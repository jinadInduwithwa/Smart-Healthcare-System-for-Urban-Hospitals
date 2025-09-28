import fs from "fs";
import path from "path";
import Fuse from "fuse.js";
import logger from "./logger.js";
import { AppError } from "./AppError.js";
import { config } from "dotenv";

config();

// Load and flatten ICD dataset
let icdData = [];
let fuse = null;

const flattenIcdData = (nodes) => {
  const result = [];
  nodes.forEach((node) => {
    // Use desc_full if available, otherwise desc
    const description = node.desc_full || node.desc || "No description";
    result.push({ code: node.code, description });
    if (node.children && node.children.length > 0) {
      result.push(...flattenIcdData(node.children));
    }
  });
  return result;
};

const loadIcdDataset = () => {
  try {
    const datasetPath = path.join(process.cwd(), "data", "diagnosis_codes.json");
    if (fs.existsSync(datasetPath)) {
      const rawData = fs.readFileSync(datasetPath, "utf8");
      const parsedData = JSON.parse(rawData);
      icdData = flattenIcdData(parsedData);
      // Initialize Fuse.js for fuzzy search
      fuse = new Fuse(icdData, {
        keys: ["code", "description"],
        threshold: 0.3, // Fuzzy match tolerance
        limit: 50,
      });
      logger.info(`Loaded ${icdData.length} ICD-10 codes from ${datasetPath}`);
    } else {
      logger.warn(`ICD dataset not found at ${datasetPath}; using empty dataset`);
    }
  } catch (error) {
    logger.error("Failed to load ICD dataset", { error: error.message });
  }
};

// Load dataset on startup
loadIcdDataset();

export const validateDiagnosisCode = async (code) => {
  try {
    logger.info(`Validating ICD-10 code: ${code}`);
    const exactMatch = icdData.find((item) => item.code === code.trim());

    if (!exactMatch) {
      throw new AppError(`Invalid ICD-10 code: ${code} (not found in dataset)`, 400);
    }

    logger.info(`Validated ICD-10 code: ${code}`, { description: exactMatch.description });
    return {
      code: exactMatch.code,
      description: exactMatch.description,
      valid: true,
    };
  } catch (error) {
    logger.error(`Failed to validate ICD-10 code: ${code}`, { error: error.message });
    // Fallback: Basic regex for ICD-10-CM format
    if (/^[A-Z]\d{2}(\.\d{1,2})?$/.test(code)) {
      logger.warn(`Dataset failed; using fallback validation for code: ${code}`);
      return { code, description: "Description unavailable", valid: true };
    }
    throw error;
  }
};

export const searchDiagnosisCodes = async (query, maxResults = 10) => {
  try {
    logger.info(`Searching ICD-10 codes for: ${query}`);
    if (!fuse || icdData.length === 0) {
      throw new AppError("ICD-10 dataset not loaded", 500);
    }

    const results = fuse.search(query).slice(0, maxResults).map((result) => ({
      code: result.item.code,
      description: result.item.description,
    }));

    logger.info(`Found ${results.length} ICD-10 codes for: ${query}`);
    return {
      total: results.length,
      results,
      hasMore: results.length === maxResults,
    };
  } catch (error) {
    logger.error(`Failed to search ICD-10 codes for: ${query}`, { error: error.message });
    return {
      total: 0,
      results: [],
      hasMore: false,
    };
  }
};