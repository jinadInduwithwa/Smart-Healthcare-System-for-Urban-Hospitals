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
      
      // If no dates provided, use current date range (last 30 days)
      const queryDate = startDate && endDate ? {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        }
      } : {
        date: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
          $lte: new Date()
        }
      };

      const query = {
        isBooked: false,
        ...queryDate
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
          $lookup: {
            from: "users",
            localField: "doctorDetails.userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $group: {
            _id: "$doctor",
            doctorId: { $first: "$doctor" },
            doctorName: { 
              $first: { 
                $cond: {
                  if: { $ne: ["$userDetails.firstName", null] },
                  then: { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] },
                  else: "Unknown Doctor"
                }
              } 
            },
            email: { $first: "$userDetails.email" },
            specialization: { $first: "$doctorDetails.specialization" },
            availableSlots: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            doctorId: 1,
            doctorName: 1,
            email: 1,
            specialization: 1,
            availableSlots: 1,
          },
        },
        { $sort: { availableSlots: -1 } },
      ]);

      logger.info("Doctor availability report generated", { 
        count: availableSlots.length,
        dateRange: queryDate 
      });

      res.status(200).json({
        status: "success",
        data: { availableSlots },
      });
    } catch (error) {
      logger.error("Error generating doctor availability report:", error.message);
      res.status(500).json({ 
        status: "error", 
        message: "Failed to generate doctor availability report" 
      });
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
      
      // If no dates provided, use default range
      const queryDate = startDate && endDate ? {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        }
      } : {
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
          $lte: new Date()
        }
      };

      // Get total patients
      const totalPatients = await Patient.countDocuments({ role: "PATIENT" });

      // Get total doctors
      const totalDoctors = await Doctor.countDocuments();

      // Get available slots (unbooked availabilities)
      const availableSlots = await Availability.countDocuments({ 
        isBooked: false,
        date: { $gte: new Date() } // Future available slots
      });

      // Get total appointments
      const totalAppointments = await Appointment.countDocuments(queryDate);

      logger.info("Overview stats generated", {
        totalPatients,
        totalDoctors,
        availableSlots,
        totalAppointments
      });

      res.status(200).json({
        status: "success",
        data: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          availableSlots,
          lastUpdated: new Date().toLocaleString("en-US", { 
            timeZone: "Asia/Colombo", 
            hour12: true,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
        },
      });
    } catch (error) {
      logger.error("Error generating overview stats:", error.message);
      res.status(500).json({ status: "error", message: "Failed to generate stats" });
    }
  }
}

export default new ReportController();