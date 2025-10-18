// // controllers/report.controller.js (updated)
// import logger from "../utils/logger.js";
// import { Appointment } from "../models/appointment.model.js";
// import { Availability } from "../models/availability.model.js";
// import { Consultation } from "../models/consultation.model.js";
// import { Doctor } from "../models/doctor.model.js";
// import { Patient } from "../models/patient.model.js";
// import Payment from "../models/payment.model.js";

// export class ReportController {
//   async getDoctorAvailabilityReport(req, res) {
//     try {
//       const { startDate, endDate } = req.query;
      
//       // If no dates provided, use current date range (last 30 days)
//       const queryDate = startDate && endDate ? {
//         date: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate),
//         }
//       } : {
//         date: {
//           $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
//           $lte: new Date()
//         }
//       };

//       const query = {
//         isBooked: false,
//         ...queryDate
//       };

//       const availableSlots = await Availability.aggregate([
//         { $match: query },
//         {
//           $lookup: {
//             from: "doctors",
//             localField: "doctor",
//             foreignField: "_id",
//             as: "doctorDetails",
//           },
//         },
//         { $unwind: "$doctorDetails" },
//         {
//           $lookup: {
//             from: "users",
//             localField: "doctorDetails.userId",
//             foreignField: "_id",
//             as: "userDetails",
//           },
//         },
//         { $unwind: "$userDetails" },
//         {
//           $group: {
//             _id: "$doctor",
//             doctorId: { $first: "$doctor" },
//             doctorName: { 
//               $first: { 
//                 $cond: {
//                   if: { $ne: ["$userDetails.firstName", null] },
//                   then: { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] },
//                   else: "Unknown Doctor"
//                 }
//               } 
//             },
//             email: { $first: "$userDetails.email" },
//             specialization: { $first: "$doctorDetails.specialization" },
//             availableSlots: { $sum: 1 },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             doctorId: 1,
//             doctorName: 1,
//             email: 1,
//             specialization: 1,
//             availableSlots: 1,
//           },
//         },
//         { $sort: { availableSlots: -1 } },
//       ]);

//       logger.info("Doctor availability report generated", { 
//         count: availableSlots.length,
//         dateRange: queryDate 
//       });

//       res.status(200).json({
//         status: "success",
//         data: { availableSlots },
//       });
//     } catch (error) {
//       logger.error("Error generating doctor availability report:", error.message);
//       res.status(500).json({ 
//         status: "error", 
//         message: "Failed to generate doctor availability report" 
//       });
//     }
//   }

//   async getPatientCheckInReport(req, res) {
//     try {
//       const { startDate, endDate } = req.query;

//       // Validate date inputs
//       if (!startDate || !endDate) {
//         throw new Error("startDate and endDate are required");
//       }

//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       if (isNaN(start) || isNaN(end)) {
//         throw new Error("Invalid date format");
//       }

//       // Generate all months in the range
//       const months = [];
//       let currentDate = new Date(start);
//       while (currentDate <= end) {
//         months.push({
//           _id: currentDate.toISOString().slice(0, 7), // YYYY-MM
//           month: currentDate.toLocaleString("en-US", { month: "short" }),
//           visits: 0,
//           patients: [],
//         });
//         currentDate.setMonth(currentDate.getMonth() + 1);
//       }

//       // Query patients with createdAt in the date range
//       const patientCheckIns = await Patient.aggregate([
//         {
//           $match: {
//             role: "PATIENT",
//             createdAt: {
//               $gte: new Date(startDate),
//               $lte: new Date(endDate),
//             },
//           },
//         },
//         {
//           $group: {
//             _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//             month: { $first: { $dateToString: { format: "%b", date: "$createdAt" } } },
//             visits: { $sum: 1 },
//             patients: {
//               $push: {
//                 patientId: "$_id",
//                 firstName: "$firstName",
//                 lastName: "$lastName",
//                 email: "$email",
//               },
//             },
//           },
//         },
//         { $sort: { _id: 1 } },
//       ]);

//       // Merge query results with all months to fill in zeros
//       const mergedData = months.map((month) => {
//         const found = patientCheckIns.find((item) => item._id === month._id);
//         return found
//           ? { ...month, visits: found.visits, patients: found.patients }
//           : month;
//       });

//       logger.info("Patient check-in report generated", {
//         count: mergedData.length,
//         nonZeroMonths: patientCheckIns.length,
//         dateRange: { startDate, endDate },
//       });

//       res.status(200).json({
//         status: "success",
//         data: { patientCheckIns: mergedData },
//       });
//     } catch (error) {
//       logger.error("Error generating patient check-in report:", {
//         error: error.message,
//         startDate,
//         endDate,
//       });
//       res.status(400).json({ status: "error", message: error.message || "Failed to generate report" });
//     }
//   }

//   async getFinancialReport(req, res) {
//     try {
//       const { startDate, endDate } = req.query;
//       const query = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate),
//         },
//         status: "CONFIRMED",
//       };

//       const financialData = await Appointment.aggregate([
//         { $match: query },
//         {
//           $group: {
//             _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//             month: { $first: { $dateToString: { format: "%b", date: "$createdAt" } } },
//             revenue: { $sum: "$amountCents" },
//           },
//         },
//         { $sort: { _id: 1 } },
//         {
//           $project: {
//             _id: 0,
//             month: 1,
//             revenue: { $divide: ["$revenue", 100] },
//           },
//         },
//       ]);

//       logger.info("Financial report generated", { count: financialData.length });
//       res.status(200).json({
//         status: "success",
//         data: { financialData },
//       });
//     } catch (error) {
//       logger.error("Error generating financial report:", error.message);
//       res.status(500).json({ status: "error", message: "Failed to generate report" });
//     }
//   }

//   async getOverviewStats(req, res) {
//     try {
//       const { startDate, endDate } = req.query;
      
//       // If no dates provided, use default range
//       const queryDate = startDate && endDate ? {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate),
//         }
//       } : {
//         createdAt: {
//           $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
//           $lte: new Date()
//         }
//       };

//       // Get total patients
//       const totalPatients = await Patient.countDocuments({ role: "PATIENT" });

//       // Get total doctors
//       const totalDoctors = await Doctor.countDocuments();

//       // Get available slots (unbooked availabilities)
//       const availableSlots = await Availability.countDocuments({ 
//         isBooked: false,
//         date: { $gte: new Date() } // Future available slots
//       });

//       // Get total appointments
//       const totalAppointments = await Appointment.countDocuments(queryDate);

//       logger.info("Overview stats generated", {
//         totalPatients,
//         totalDoctors,
//         availableSlots,
//         totalAppointments
//       });

//       res.status(200).json({
//         status: "success",
//         data: {
//           totalPatients,
//           totalDoctors,
//           totalAppointments,
//           availableSlots,
//           lastUpdated: new Date().toLocaleString("en-US", { 
//             timeZone: "Asia/Colombo", 
//             hour12: true,
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//           }),
//         },
//       });
//     } catch (error) {
//       logger.error("Error generating overview stats:", error.message);
//       res.status(500).json({ status: "error", message: "Failed to generate stats" });
//     }
//   }

//   async getFinancialReport(req, res) {
//     try {
//       const { startDate, endDate } = req.query;
      
//       // Validate date inputs
//       if (!startDate || !endDate) {
//         return res.status(400).json({ 
//           status: "error", 
//           message: "startDate and endDate are required" 
//         });
//       }

//       const start = new Date(startDate);
//       const end = new Date(endDate);
      
//       if (isNaN(start) || isNaN(end)) {
//         return res.status(400).json({ 
//           status: "error", 
//           message: "Invalid date format" 
//         });
//       }

//       // Generate all months in the range for complete data
//       const allMonths = [];
//       let currentDate = new Date(start);
//       while (currentDate <= end) {
//         allMonths.push({
//           _id: currentDate.toISOString().slice(0, 7), // YYYY-MM
//           month: currentDate.toLocaleString("en-US", { month: "short", year: 'numeric' }),
//           revenue: 0,
//           transactionCount: 0,
//           pendingAmount: 0,
//           refundAmount: 0
//         });
//         currentDate.setMonth(currentDate.getMonth() + 1);
//       }

//       // Get payment data grouped by month
//       const paymentData = await Payment.aggregate([
//         {
//           $match: {
//             createdAt: {
//               $gte: start,
//               $lte: end
//             }
//           }
//         },
//         {
//           $group: {
//             _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//             month: { $first: { $dateToString: { format: "%b %Y", date: "$createdAt" } } },
//             revenue: { 
//               $sum: { 
//                 $cond: [
//                   { $in: ["$status", ["PAID", "COMPLETED"]] },
//                   "$amount",
//                   0
//                 ]
//               }
//             },
//             pendingAmount: {
//               $sum: {
//                 $cond: [
//                   { $in: ["$status", ["PENDING", "OVERDUE"]] },
//                   "$amount",
//                   0
//                 ]
//               }
//             },
//             refundAmount: {
//               $sum: {
//                 $cond: [
//                   { $eq: ["$status", "REFUNDED"] },
//                   "$refundAmount",
//                   0
//                 ]
//               }
//             },
//             transactionCount: {
//               $sum: {
//                 $cond: [
//                   { $in: ["$status", ["PAID", "COMPLETED"]] },
//                   1,
//                   0
//                 ]
//               }
//             },
//             totalTransactions: { $sum: 1 }
//           }
//         },
//         { $sort: { _id: 1 } }
//       ]);

//       // Merge with all months to ensure we have data for every month
//       const financialData = allMonths.map(month => {
//         const found = paymentData.find(item => item._id === month._id);
//         return found ? {
//           month: found.month,
//           revenue: found.revenue,
//           transactionCount: found.transactionCount,
//           pendingAmount: found.pendingAmount,
//           refundAmount: found.refundAmount,
//           totalTransactions: found.totalTransactions
//         } : {
//           month: month.month,
//           revenue: 0,
//           transactionCount: 0,
//           pendingAmount: 0,
//           refundAmount: 0,
//           totalTransactions: 0
//         };
//       });

//       // Get summary statistics
//       const summaryStats = await Payment.aggregate([
//         {
//           $match: {
//             createdAt: { $gte: start, $lte: end }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             totalRevenue: {
//               $sum: {
//                 $cond: [
//                   { $in: ["$status", ["PAID", "COMPLETED"]] },
//                   "$amount",
//                   0
//                 ]
//               }
//             },
//             totalPending: {
//               $sum: {
//                 $cond: [
//                   { $in: ["$status", ["PENDING", "OVERDUE"]] },
//                   "$amount",
//                   0
//                 ]
//               }
//             },
//             totalRefunded: {
//               $sum: {
//                 $cond: [
//                   { $eq: ["$status", "REFUNDED"] },
//                   "$refundAmount",
//                   0
//                 ]
//               }
//             },
//             paidTransactions: {
//               $sum: {
//                 $cond: [
//                   { $in: ["$status", ["PAID", "COMPLETED"]] },
//                   1,
//                   0
//                 ]
//               }
//             },
//             pendingTransactions: {
//               $sum: {
//                 $cond: [
//                   { $in: ["$status", ["PENDING", "OVERDUE"]] },
//                   1,
//                   0
//                 ]
//               }
//             },
//             refundedTransactions: {
//               $sum: {
//                 $cond: [
//                   { $eq: ["$status", "REFUNDED"] },
//                   1,
//                   0
//                 ]
//               }
//             }
//           }
//         }
//       ]);

//       // Get payment method breakdown
//       const paymentMethodStats = await Payment.aggregate([
//         {
//           $match: {
//             createdAt: { $gte: start, $lte: end },
//             status: { $in: ["PAID", "COMPLETED"] }
//           }
//         },
//         {
//           $group: {
//             _id: "$paymentMethod",
//             totalAmount: { $sum: "$amount" },
//             transactionCount: { $sum: 1 }
//           }
//         },
//         { $sort: { totalAmount: -1 } }
//       ]);

//       // Get top doctors by revenue
//       const topDoctors = await Payment.aggregate([
//         {
//           $match: {
//             createdAt: { $gte: start, $lte: end },
//             status: { $in: ["PAID", "COMPLETED"] }
//           }
//         },
//         {
//           $lookup: {
//             from: "doctors",
//             localField: "doctor",
//             foreignField: "_id",
//             as: "doctorInfo"
//           }
//         },
//         { $unwind: "$doctorInfo" },
//         {
//           $lookup: {
//             from: "users",
//             localField: "doctorInfo.userId",
//             foreignField: "_id",
//             as: "userInfo"
//           }
//         },
//         { $unwind: "$userInfo" },
//         {
//           $group: {
//             _id: "$doctor",
//             doctorName: { 
//               $first: { 
//                 $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"] 
//               } 
//             },
//             specialization: { $first: "$doctorInfo.specialization" },
//             totalRevenue: { $sum: "$amount" },
//             appointmentCount: { $sum: 1 }
//           }
//         },
//         { $sort: { totalRevenue: -1 } },
//         { $limit: 10 }
//       ]);

//       const summary = summaryStats.length > 0 ? summaryStats[0] : {
//         totalRevenue: 0,
//         totalPending: 0,
//         totalRefunded: 0,
//         paidTransactions: 0,
//         pendingTransactions: 0,
//         refundedTransactions: 0
//       };

//       logger.info("Financial report generated with payment data", { 
//         months: financialData.length,
//         totalRevenue: summary.totalRevenue,
//         dateRange: { startDate, endDate }
//       });

//       res.status(200).json({
//         status: "success",
//         data: {
//           financialData,
//           summary: {
//             totalRevenue: summary.totalRevenue,
//             totalPending: summary.totalPending,
//             totalRefunded: summary.totalRefunded,
//             paidTransactions: summary.paidTransactions,
//             pendingTransactions: summary.pendingTransactions,
//             refundedTransactions: summary.refundedTransactions,
//             netRevenue: summary.totalRevenue - summary.totalRefunded
//           },
//           paymentMethods: paymentMethodStats,
//           topDoctors,
//           reportPeriod: {
//             startDate: start.toISOString().split('T')[0],
//             endDate: end.toISOString().split('T')[0],
//             generatedAt: new Date().toISOString()
//           }
//         },
//       });
//     } catch (error) {
//       logger.error("Error generating financial report:", error.message);
//       res.status(500).json({ 
//         status: "error", 
//         message: "Failed to generate financial report" 
//       });
//     }
//   }

//   // Additional method for real-time payment dashboard
//   async getPaymentDashboard(req, res) {
//     try {
//       const today = new Date();
//       const startOfToday = new Date(today.setHours(0, 0, 0, 0));
//       const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//       const startOfYear = new Date(today.getFullYear(), 0, 1);

//       // Today's payments
//       const todayPayments = await Payment.aggregate([
//         {
//           $match: {
//             paidAt: { $gte: startOfToday },
//             status: { $in: ["PAID", "COMPLETED"] }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             amount: { $sum: "$amount" },
//             count: { $sum: 1 }
//           }
//         }
//       ]);

//       // Monthly payments
//       const monthlyPayments = await Payment.aggregate([
//         {
//           $match: {
//             paidAt: { $gte: startOfMonth },
//             status: { $in: ["PAID", "COMPLETED"] }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             amount: { $sum: "$amount" },
//             count: { $sum: 1 }
//           }
//         }
//       ]);

//       // Yearly payments
//       const yearlyPayments = await Payment.aggregate([
//         {
//           $match: {
//             paidAt: { $gte: startOfYear },
//             status: { $in: ["PAID", "COMPLETED"] }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             amount: { $sum: "$amount" },
//             count: { $sum: 1 }
//           }
//         }
//       ]);

//       // Pending payments
//       const pendingPayments = await Payment.aggregate([
//         {
//           $match: {
//             status: { $in: ["PENDING", "OVERDUE"] }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             amount: { $sum: "$amount" },
//             count: { $sum: 1 }
//           }
//         }
//       ]);

//       res.status(200).json({
//         status: "success",
//         data: {
//           today: todayPayments[0] || { amount: 0, count: 0 },
//           monthly: monthlyPayments[0] || { amount: 0, count: 0 },
//           yearly: yearlyPayments[0] || { amount: 0, count: 0 },
//           pending: pendingPayments[0] || { amount: 0, count: 0 }
//         }
//       });
//     } catch (error) {
//       logger.error("Error generating payment dashboard:", error.message);
//       res.status(500).json({ 
//         status: "error", 
//         message: "Failed to generate payment dashboard" 
//       });
//     }
//   }
// }



// export default new ReportController();

// controllers/report.controller.js
import logger from "../utils/logger.js";
import { Appointment } from "../models/appointment.model.js";
import { Availability } from "../models/availability.model.js";
import { Consultation } from "../models/consultation.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import Payment from "../models/payment.model.js";

export class ReportController {
  async getDoctorAvailabilityReport(req, res) {
    try {
      // Add cache control headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

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
      // Add cache control headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

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
      // Add cache control headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const { startDate, endDate } = req.query;
      
      // Validate date inputs
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          status: "error", 
          message: "startDate and endDate are required" 
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ 
          status: "error", 
          message: "Invalid date format" 
        });
      }

      // Generate all months in the range for complete data
      const allMonths = [];
      let currentDate = new Date(start);
      while (currentDate <= end) {
        allMonths.push({
          _id: currentDate.toISOString().slice(0, 7), // YYYY-MM
          month: currentDate.toLocaleString("en-US", { month: "short", year: 'numeric' }),
          revenue: 0,
          transactionCount: 0,
          pendingAmount: 0,
          refundAmount: 0
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Get payment data grouped by month
      const paymentData = await Payment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lte: end
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            month: { $first: { $dateToString: { format: "%b %Y", date: "$createdAt" } } },
            revenue: { 
              $sum: { 
                $cond: [
                  { $in: ["$status", ["PAID", "COMPLETED"]] },
                  "$amount",
                  0
                ]
              }
            },
            pendingAmount: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["PENDING", "OVERDUE"]] },
                  "$amount",
                  0
                ]
              }
            },
            refundAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "REFUNDED"] },
                  "$refundAmount",
                  0
                ]
              }
            },
            transactionCount: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["PAID", "COMPLETED"]] },
                  1,
                  0
                ]
              }
            },
            totalTransactions: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Merge with all months to ensure we have data for every month
      const financialData = allMonths.map(month => {
        const found = paymentData.find(item => item._id === month._id);
        return found ? {
          month: found.month,
          revenue: found.revenue,
          transactionCount: found.transactionCount,
          pendingAmount: found.pendingAmount,
          refundAmount: found.refundAmount,
          totalTransactions: found.totalTransactions
        } : {
          month: month.month,
          revenue: 0,
          transactionCount: 0,
          pendingAmount: 0,
          refundAmount: 0,
          totalTransactions: 0
        };
      });

      // Get summary statistics
      const summaryStats = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["PAID", "COMPLETED"]] },
                  "$amount",
                  0
                ]
              }
            },
            totalPending: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["PENDING", "OVERDUE"]] },
                  "$amount",
                  0
                ]
              }
            },
            totalRefunded: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "REFUNDED"] },
                  "$refundAmount",
                  0
                ]
              }
            },
            paidTransactions: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["PAID", "COMPLETED"]] },
                  1,
                  0
                ]
              }
            },
            pendingTransactions: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["PENDING", "OVERDUE"]] },
                  1,
                  0
                ]
              }
            },
            refundedTransactions: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "REFUNDED"] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get payment method breakdown
      const paymentMethodStats = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $in: ["PAID", "COMPLETED"] }
          }
        },
        {
          $group: {
            _id: "$paymentMethod",
            totalAmount: { $sum: "$amount" },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } }
      ]);

      // Get top doctors by revenue
      const topDoctors = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $in: ["PAID", "COMPLETED"] }
          }
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctor",
            foreignField: "_id",
            as: "doctorInfo"
          }
        },
        { $unwind: "$doctorInfo" },
        {
          $lookup: {
            from: "users",
            localField: "doctorInfo.userId",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        { $unwind: "$userInfo" },
        {
          $group: {
            _id: "$doctor",
            doctorName: { 
              $first: { 
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"] 
              } 
            },
            specialization: { $first: "$doctorInfo.specialization" },
            totalRevenue: { $sum: "$amount" },
            appointmentCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ]);

      const summary = summaryStats.length > 0 ? summaryStats[0] : {
        totalRevenue: 0,
        totalPending: 0,
        totalRefunded: 0,
        paidTransactions: 0,
        pendingTransactions: 0,
        refundedTransactions: 0
      };

      logger.info("Financial report generated with payment data", { 
        months: financialData.length,
        totalRevenue: summary.totalRevenue,
        dateRange: { startDate, endDate }
      });

      res.status(200).json({
        status: "success",
        data: {
          financialData,
          summary: {
            totalRevenue: summary.totalRevenue,
            totalPending: summary.totalPending,
            totalRefunded: summary.totalRefunded,
            paidTransactions: summary.paidTransactions,
            pendingTransactions: summary.pendingTransactions,
            refundedTransactions: summary.refundedTransactions,
            netRevenue: summary.totalRevenue - summary.totalRefunded
          },
          paymentMethods: paymentMethodStats,
          topDoctors,
          reportPeriod: {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            generatedAt: new Date().toISOString()
          }
        },
      });
    } catch (error) {
      logger.error("Error generating financial report:", error.message);
      res.status(500).json({ 
        status: "error", 
        message: "Failed to generate financial report" 
      });
    }
  }

  async getOverviewStats(req, res) {
    try {
      // Add cache control headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

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

      // Get total revenue from payments
      const revenueStats = await Payment.aggregate([
        {
          $match: {
            status: { $in: ["PAID", "COMPLETED"] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalTransactions: { $sum: 1 }
          }
        }
      ]);

      const revenueData = revenueStats.length > 0 ? revenueStats[0] : { totalRevenue: 0, totalTransactions: 0 };

      logger.info("Overview stats generated", {
        totalPatients,
        totalDoctors,
        availableSlots,
        totalAppointments,
        totalRevenue: revenueData.totalRevenue
      });

      res.status(200).json({
        status: "success",
        data: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          availableSlots,
          totalRevenue: revenueData.totalRevenue,
          totalTransactions: revenueData.totalTransactions,
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

  // Additional method for real-time payment dashboard
  async getPaymentDashboard(req, res) {
    try {
      // Add cache control headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Today's payments
      const todayPayments = await Payment.aggregate([
        {
          $match: {
            paidAt: { $gte: startOfToday },
            status: { $in: ["PAID", "COMPLETED"] }
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ]);

      // Monthly payments
      const monthlyPayments = await Payment.aggregate([
        {
          $match: {
            paidAt: { $gte: startOfMonth },
            status: { $in: ["PAID", "COMPLETED"] }
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ]);

      // Yearly payments
      const yearlyPayments = await Payment.aggregate([
        {
          $match: {
            paidAt: { $gte: startOfYear },
            status: { $in: ["PAID", "COMPLETED"] }
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ]);

      // Pending payments
      const pendingPayments = await Payment.aggregate([
        {
          $match: {
            status: { $in: ["PENDING", "OVERDUE"] }
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        status: "success",
        data: {
          today: todayPayments[0] || { amount: 0, count: 0 },
          monthly: monthlyPayments[0] || { amount: 0, count: 0 },
          yearly: yearlyPayments[0] || { amount: 0, count: 0 },
          pending: pendingPayments[0] || { amount: 0, count: 0 }
        }
      });
    } catch (error) {
      logger.error("Error generating payment dashboard:", error.message);
      res.status(500).json({ 
        status: "error", 
        message: "Failed to generate payment dashboard" 
      });
    }
  }
}

export default new ReportController();