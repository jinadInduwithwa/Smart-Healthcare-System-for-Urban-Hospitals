import { ConsultationService } from "../services/consultation.service.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";

export class ConsultationController {
  constructor() {
    this.consultationService = new ConsultationService();
    this.addConsultation = this.addConsultation.bind(this);
    this.searchDiagnosisCodes = this.searchDiagnosisCodes.bind(this);
    this.searchTestNames = this.searchTestNames.bind(this);
    this.getConsultationsByPatient = this.getConsultationsByPatient.bind(this);
    this.updateConsultation = this.updateConsultation.bind(this);
    this.deleteConsultation = this.deleteConsultation.bind(this);
  }

  async addConsultation(req, res) {
    try {
      logger.info("Processing add consultation request", {
        userId: req.user._id,
      });

      const consultationData = req.body;
      const user = req.user;

      const result = await this.consultationService.addConsultation(consultationData, user);

      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      logger.error("Error in addConsultation controller", {
        userId: req.user._id,
        error: error.message,
      });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchDiagnosisCodes(req, res) {
    try {
      logger.info("Processing search diagnosis codes request", {
        userId: req.user._id,
        query: req.query.query,
      });

      const { query, maxResults } = req.query;
      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Query parameter is required",
        });
      }

      const result = await this.consultationService.searchDiagnosisCodes(
        query,
        parseInt(maxResults) || 10
      );

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      logger.error("Error in searchDiagnosisCodes controller", {
        userId: req.user._id,
        error: error.message,
      });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchTestNames(req, res) {
    try {
      logger.info("Processing search test names request", {
        userId: req.user._id,
        query: req.query.query,
      });

      const { query, maxResults } = req.query;
      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Query parameter is required",
        });
      }

      const result = await this.consultationService.searchTestNames(
        query,
        parseInt(maxResults) || 10
      );

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      logger.error("Error in searchTestNames controller", {
        userId: req.user._id,
        error: error.message,
      });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getConsultationsByPatient(req, res) {
    try {
      logger.info("Processing get consultations by patient request", {
        userId: req.user._id,
        patientId: req.params.patientId,
      });

      const patientId = req.params.patientId;
      const user = req.user;

      const result = await this.consultationService.getConsultationsByPatient(patientId, user);

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error in getConsultationsByPatient controller", {
        userId: req.user._id,
        error: error.message,
      });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateConsultation(req, res) {
    try {
      logger.info("Processing update consultation request", {
        userId: req.user._id,
        consultationId: req.params.id,
      });

      const id = req.params.id;
      const consultationData = req.body;
      const user = req.user;

      const result = await this.consultationService.updateConsultation(id, consultationData, user);

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error in updateConsultation controller", {
        userId: req.user._id,
        error: error.message,
      });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteConsultation(req, res) {
    try {
      logger.info("Processing delete consultation request", {
        userId: req.user._id,
        consultationId: req.params.id,
      });

      const id = req.params.id;
      const user = req.user;

      const result = await this.consultationService.deleteConsultation(id, user);

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error in deleteConsultation controller", {
        userId: req.user._id,
        error: error.message,
      });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}