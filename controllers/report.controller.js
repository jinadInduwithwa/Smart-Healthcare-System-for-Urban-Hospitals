
// controllers/report.controller.js (updated)
import logger from "../utils/logger.js";
import { Appointment } from "../models/appointment.model.js";
import { Availability } from "../models/availability.model.js";
import { Consultation } from "../models/consultation.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";

export class ReportController {
  async getDoctorAvailabilityReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const query = {
        isBooked: false, // Corrected from "availability.isBooked"
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const availableSlots = await Availability.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "doctors",
            localField: "doctor",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        { $unwind: "$doctorDetails" },
        {
          $group: {
            _id: "$doctorDetails.userId",
            doctorName: { $first: { $concat: ["$doctorDetails.firstName", " ", "$doctorDetails.lastName"] } },
            availableSlots: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            doctorId: "$_id",
            doctorName: 1,
            availableSlots: 1,
          },
        },
      ]);

      logger.info("Doctor availability report generated", { count: availableSlots.length });
      res.status(200).json({
        status: "success",
        data: { availableSlots },
      });
    } catch (error) {
      logger.error("Error generating doctor availability report:", error.message);
      res.status(500).json({ status: "error", message: "Failed to generate report" });
    }
  }

  async getPatientCheckInReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Validate date inputs
      if (!startDate || !endDate) {
        throw new Error("startDate and endDate are required");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) {
        throw new Error("Invalid date format");
      }

      // Generate all months in the range
      const months = [];
      let currentDate = new Date(start);
      while (currentDate <= end) {
        months.push({
          _id: currentDate.toISOString().slice(0, 7), // YYYY-MM
          month: currentDate.toLocaleString("en-US", { month: "short" }),
          visits: 0,
          patients: [],
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Query patients with createdAt in the date range
      const patientCheckIns = await Patient.aggregate([
        {
          $match: {
            role: "PATIENT",
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            month: { $first: { $dateToString: { format: "%b", date: "$createdAt" } } },
            visits: { $sum: 1 },
            patients: {
              $push: {
                patientId: "$_id",
                firstName: "$firstName",
                lastName: "$lastName",
                email: "$email",
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Merge query results with all months to fill in zeros
      const mergedData = months.map((month) => {
        const found = patientCheckIns.find((item) => item._id === month._id);
        return found
          ? { ...month, visits: found.visits, patients: found.patients }
          : month;
      });

      logger.info("Patient check-in report generated", {
        count: mergedData.length,
        nonZeroMonths: patientCheckIns.length,
        dateRange: { startDate, endDate },
      });

      res.status(200).json({
        status: "success",
        data: { patientCheckIns: mergedData },
      });
    } catch (error) {
      logger.error("Error generating patient check-in report:", {
        error: error.message,
        startDate,
        endDate,
      });
      res.status(400).json({ status: "error", message: error.message || "Failed to generate report" });
    }
  }

  async getFinancialReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const query = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        status: "CONFIRMED",
      };

      const financialData = await Appointment.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            month: { $first: { $dateToString: { format: "%b", date: "$createdAt" } } },
            revenue: { $sum: "$amountCents" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: 1,
            revenue: { $divide: ["$revenue", 100] },
          },
        },
      ]);

      logger.info("Financial report generated", { count: financialData.length });
      res.status(200).json({
        status: "success",
        data: { financialData },
      });
    } catch (error) {
      logger.error("Error generating financial report:", error.message);
      res.status(500).json({ status: "error", message: "Failed to generate report" });
    }
  }

  async getOverviewStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const query = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const totalPatientVisits = await Appointment.countDocuments({
        ...query,
        status: "COMPLETED",
      });
      const newRegistrations = await Patient.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
      const totalAppointments = await Appointment.countDocuments(query);
      const completedAppointments = await Appointment.countDocuments({
        ...query,
        status: "COMPLETED",
      });
      const appointmentAdherence = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
      const peakTimes = await Appointment.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "availabilities",
            localField: "availability",
            foreignField: "_id",
            as: "slotDetails",
          },
        },
        { $unwind: "$slotDetails" },
        {
          $group: {
            _id: "$slotDetails.startTime",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]);
      const avgPeakTime = peakTimes.length > 0 ? peakTimes[0]._id : "N/A";

      logger.info("Overview stats generated");
      res.status(200).json({
        status: "success",
        data: {
          totalPatientVisits,
          newRegistrations,
          appointmentAdherence,
          avgPeakTime,
          lastUpdated: new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo", hour12: true }),
        },
      });
    } catch (error) {
      logger.error("Error generating overview stats:", error.message);
      res.status(500).json({ status: "error", message: "Failed to generate stats" });
    }
  }
}

export default new ReportController();