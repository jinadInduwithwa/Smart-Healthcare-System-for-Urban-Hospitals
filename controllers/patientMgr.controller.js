import logger from "../utils/logger.js";
import { Patient } from "../models/patient.model.js";

export class PatientMgrController {
  async addPatient(req, res) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        address,
        healthCardId,
        dateOfBirth,
        gender,
      } = req.body;

      const patient = await Patient.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        address,
        healthCardId,
        dateOfBirth,
        gender,
        role: "PATIENT",
      });

      logger.info("Patient added successfully:", { email });
      res.status(201).json({
        status: "success",
        message: "Patient added successfully",
        data: { patient },
      });
    } catch (error) {
      logger.error("Add patient error:", { error: error.message });
      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Invalid data",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }
      res.status(500).json({
        status: "error",
        message: error.message || "Server error",
      });
    }
  }

  async updatePatient(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const patient = await Patient.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!patient) {
        logger.warn("Update patient failed: Patient not found", { id });
        return res.status(404).json({ status: "error", message: "Patient not found" });
      }

      logger.info("Patient updated successfully:", { id });
      res.status(200).json({
        status: "success",
        message: "Patient updated successfully",
        data: { patient },
      });
    } catch (error) {
      logger.error("Update patient error:", { error: error.message });
      res.status(500).json({
        status: "error",
        message: error.message || "Server error",
      });
    }
  }

  async deletePatient(req, res) {
    try {
      const { id } = req.params;

      const patient = await Patient.findByIdAndDelete(id);
      if (!patient) {
        logger.warn("Delete patient failed: Patient not found", { id });
        return res.status(404).json({ status: "error", message: "Patient not found" });
      }

      logger.info("Patient deleted successfully:", { id });
      res.status(200).json({
        status: "success",
        message: "Patient deleted successfully",
      });
    } catch (error) {
      logger.error("Delete patient error:", { error: error.message });
      res.status(500).json({
        status: "error",
        message: error.message || "Server error",
      });
    }
  }

  async getPatients(req, res) {
    try {
      const patients = await Patient.find({ role: "PATIENT" }).select("-password"); // Exclude password
      logger.info("Patients fetched successfully:", { count: patients.length });
      res.status(200).json({
        status: "success",
        data: { patients },
      });
    } catch (error) {
      logger.error("Get patients error:", { error: error.message });
      res.status(500).json({
        status: "error",
        message: error.message || "Server error",
      });
    }
  }
}

export default new PatientMgrController();