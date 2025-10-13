import fs from "fs";
import path from "path";
import logger from "./logger.js";
import { AppError } from "./AppError.js";
import { config } from "dotenv";

config();

// Load recommended tests dataset
let testData = [];

const loadTestDataset = () => {
  try {
    const datasetPath = path.join(process.cwd(), "data", "recommended_tests.json");
    if (fs.existsSync(datasetPath)) {
      const rawData = fs.readFileSync(datasetPath, "utf8");
      testData = JSON.parse(rawData);
      logger.info(`Loaded ${testData.length} recommended tests from ${datasetPath}`);
    } else {
      logger.warn(`Recommended tests dataset not found at ${datasetPath}; using empty dataset`);
    }
  } catch (error) {
    logger.error("Failed to load recommended tests dataset", { error: error.message });
  }
};

// Load dataset on startup
loadTestDataset();

export const validateTestName = async (testName) => {
  try {
    logger.info(`Validating test name: ${testName}`);
    const exactMatch = testData.find((item) => item.name.toLowerCase() === testName.trim().toLowerCase());

    if (!exactMatch) {
      throw new AppError(`Invalid test name: ${testName} (not found in dataset)`, 400);
    }

    logger.info(`Validated test name: ${testName}`, { description: exactMatch.description });
    return {
      name: exactMatch.name,
      description: exactMatch.description || "No description available",
      valid: true,
    };
  } catch (error) {
    logger.error(`Failed to validate test name: ${testName}`, { error: error.message });
    throw error;
  }
};

export const searchTestNames = async (query, maxResults = 10) => {
  try {
    logger.info(`Searching test names for: ${query}`);
    if (testData.length === 0) {
      throw new AppError("Recommended tests dataset not loaded", 500);
    }

    // Simple case-insensitive search
    const results = testData
      .filter((item) => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, maxResults)
      .map((item) => ({
        name: item.name,
        description: item.description || "No description available",
      }));

    logger.info(`Found ${results.length} test names for: ${query}`);
    return {
      total: results.length,
      results,
      hasMore: results.length === maxResults,
    };
  } catch (error) {
    logger.error(`Failed to search test names for: ${query}`, { error: error.message });
    return {
      total: 0,
      results: [],
      hasMore: false,
    };
  }
};