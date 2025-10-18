// // Tests/report.controller.test.js

// // Mock the models and logger
// const mockAppointment = {
//   countDocuments: jest.fn()
// };

// const mockAvailability = {
//   countDocuments: jest.fn(),
//   aggregate: jest.fn()
// };

// const mockDoctor = {
//   countDocuments: jest.fn()
// };

// const mockPatient = {
//   countDocuments: jest.fn(),
//   aggregate: jest.fn()
// };

// const mockPayment = {
//   aggregate: jest.fn()
// };

// const mockLogger = {
//   info: jest.fn(),
//   error: jest.fn()
// };

// // Mock the modules
// jest.mock('../models/appointment.model.js', () => ({ default: mockAppointment }));
// jest.mock('../models/availability.model.js', () => ({ default: mockAvailability }));
// jest.mock('../models/doctor.model.js', () => ({ default: mockDoctor }));
// jest.mock('../models/patient.model.js', () => ({ default: mockPatient }));
// jest.mock('../models/payment.model.js', () => ({ default: mockPayment }));
// jest.mock('../utils/logger.js', () => ({ default: mockLogger }));

// // Import the controller
// import ReportController from '../controllers/report.controller.js';

// describe('Report Controller - Unit Tests', () => {
//   let mockReq, mockRes;

//   beforeEach(() => {
//     jest.clearAllMocks();
    
//     mockReq = {
//       query: {},
//       params: {},
//       body: {}
//     };
    
//     mockRes = {
//       json: jest.fn(),
//       status: jest.fn().mockReturnThis(),
//       setHeader: jest.fn()
//     };
//   });

//   describe('getDoctorAvailabilityReport', () => {
//     it('should return doctor availability report with date range', async () => {
//       // Setup
//       mockReq.query = {
//         startDate: '2024-01-01',
//         endDate: '2024-01-31'
//       };

//       const mockAvailabilityData = [
//         {
//           doctorId: 'doc1',
//           doctorName: 'Dr. John Smith',
//           email: 'john@example.com',
//           specialization: 'Cardiology',
//           availableSlots: 15
//         },
//         {
//           doctorId: 'doc2',
//           doctorName: 'Dr. Jane Doe',
//           email: 'jane@example.com',
//           specialization: 'Pediatrics',
//           availableSlots: 10
//         }
//       ];

//       mockAvailability.aggregate.mockResolvedValue(mockAvailabilityData);

//       // Execute
//       await ReportController.getDoctorAvailabilityReport(mockReq, mockRes);

//       // Assert
//       expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
//       expect(mockRes.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
//       expect(mockRes.setHeader).toHaveBeenCalledWith('Expires', '0');
      
//       expect(mockAvailability.aggregate).toHaveBeenCalled();
//       expect(mockRes.status).toHaveBeenCalledWith(200);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "success",
//         data: { availableSlots: mockAvailabilityData }
//       });
//       expect(mockLogger.info).toHaveBeenCalledWith(
//         "Doctor availability report generated", 
//         expect.any(Object)
//       );
//     });

//     it('should return doctor availability report with default date range when no dates provided', async () => {
//       // Setup - no query parameters
//       const mockAvailabilityData = [
//         {
//           doctorId: 'doc1',
//           doctorName: 'Dr. John Smith',
//           email: 'john@example.com',
//           specialization: 'Cardiology',
//           availableSlots: 8
//         }
//       ];

//       mockAvailability.aggregate.mockResolvedValue(mockAvailabilityData);

//       // Execute
//       await ReportController.getDoctorAvailabilityReport(mockReq, mockRes);

//       // Assert
//       expect(mockAvailability.aggregate).toHaveBeenCalled();
//       expect(mockRes.status).toHaveBeenCalledWith(200);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "success",
//         data: { availableSlots: mockAvailabilityData }
//       });
//     });

//     it('should handle errors gracefully', async () => {
//       // Setup
//       const error = new Error('Database error');
//       mockAvailability.aggregate.mockRejectedValue(error);

//       // Execute
//       await ReportController.getDoctorAvailabilityReport(mockReq, mockRes);

//       // Assert
//       expect(mockLogger.error).toHaveBeenCalledWith(
//         "Error generating doctor availability report:",
//         error.message
//       );
//       expect(mockRes.status).toHaveBeenCalledWith(500);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Failed to generate doctor availability report"
//       });
//     });
//   });

//   describe('getPatientCheckInReport', () => {
//     it('should return patient check-in report successfully', async () => {
//       // Setup
//       mockReq.query = {
//         startDate: '2024-01-01',
//         endDate: '2024-03-31'
//       };

//       const mockPatientData = [
//         {
//           _id: '2024-01',
//           month: 'Jan',
//           visits: 25,
//           patients: [
//             {
//               patientId: 'pat1',
//               firstName: 'John',
//               lastName: 'Doe',
//               email: 'john@example.com'
//             }
//           ]
//         },
//         {
//           _id: '2024-02',
//           month: 'Feb',
//           visits: 30,
//           patients: [
//             {
//               patientId: 'pat2',
//               firstName: 'Jane',
//               lastName: 'Smith',
//               email: 'jane@example.com'
//             }
//           ]
//         }
//       ];

//       mockPatient.aggregate.mockResolvedValue(mockPatientData);

//       // Execute
//       await ReportController.getPatientCheckInReport(mockReq, mockRes);

//       // Assert
//       expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
//       expect(mockPatient.aggregate).toHaveBeenCalled();
//       expect(mockRes.status).toHaveBeenCalledWith(200);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "success",
//         data: { patientCheckIns: expect.any(Array) }
//       });
//       expect(mockLogger.info).toHaveBeenCalledWith(
//         "Patient check-in report generated",
//         expect.any(Object)
//       );
//     });

//     it('should return error when startDate and endDate are missing', async () => {
//       // Setup - no query parameters
//       mockReq.query = {};

//       // Execute
//       await ReportController.getPatientCheckInReport(mockReq, mockRes);

//       // Assert
//       expect(mockLogger.error).toHaveBeenCalledWith(
//         "Error generating patient check-in report:",
//         expect.any(Object)
//       );
//       expect(mockRes.status).toHaveBeenCalledWith(400);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "startDate and endDate are required"
//       });
//     });

//     it('should return error for invalid date format', async () => {
//       // Setup
//       mockReq.query = {
//         startDate: 'invalid-date',
//         endDate: '2024-01-31'
//       };

//       // Execute
//       await ReportController.getPatientCheckInReport(mockReq, mockRes);

//       // Assert
//       expect(mockRes.status).toHaveBeenCalledWith(400);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Invalid date format"
//       });
//     });
//   });

//   describe('getFinancialReport', () => {
//     it('should return financial report successfully', async () => {
//       // Setup
//       mockReq.query = {
//         startDate: '2024-01-01',
//         endDate: '2024-03-31'
//       };

//       const mockPaymentData = [
//         {
//           _id: '2024-01',
//           month: 'Jan 2024',
//           revenue: 5000,
//           transactionCount: 25,
//           pendingAmount: 1000,
//           refundAmount: 200,
//           totalTransactions: 26
//         }
//       ];

//       const mockSummaryStats = [
//         {
//           totalRevenue: 15000,
//           totalPending: 3000,
//           totalRefunded: 600,
//           paidTransactions: 75,
//           pendingTransactions: 15,
//           refundedTransactions: 3
//         }
//       ];

//       const mockPaymentMethodStats = [
//         {
//           _id: 'CREDIT_CARD',
//           totalAmount: 10000,
//           transactionCount: 50
//         },
//         {
//           _id: 'DEBIT_CARD',
//           totalAmount: 5000,
//           transactionCount: 25
//         }
//       ];

//       const mockTopDoctors = [
//         {
//           _id: 'doc1',
//           doctorName: 'Dr. John Smith',
//           specialization: 'Cardiology',
//           totalRevenue: 8000,
//           appointmentCount: 40
//         }
//       ];

//       mockPayment.aggregate
//         .mockResolvedValueOnce(mockPaymentData) // First call for payment data
//         .mockResolvedValueOnce(mockSummaryStats) // Second call for summary stats
//         .mockResolvedValueOnce(mockPaymentMethodStats) // Third call for payment methods
//         .mockResolvedValueOnce(mockTopDoctors); // Fourth call for top doctors

//       // Execute
//       await ReportController.getFinancialReport(mockReq, mockRes);

//       // Assert
//       expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
//       expect(mockPayment.aggregate).toHaveBeenCalledTimes(4);
//       expect(mockRes.status).toHaveBeenCalledWith(200);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "success",
//         data: {
//           financialData: expect.any(Array),
//           summary: expect.any(Object),
//           paymentMethods: mockPaymentMethodStats,
//           topDoctors: mockTopDoctors,
//           reportPeriod: expect.any(Object)
//         }
//       });
//       expect(mockLogger.info).toHaveBeenCalledWith(
//         "Financial report generated with payment data",
//         expect.any(Object)
//       );
//     });

//     it('should return error when startDate and endDate are missing', async () => {
//       // Setup - no query parameters
//       mockReq.query = {};

//       // Execute
//       await ReportController.getFinancialReport(mockReq, mockRes);

//       // Assert
//       expect(mockRes.status).toHaveBeenCalledWith(400);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "startDate and endDate are required"
//       });
//     });

//     it('should return error for invalid date format', async () => {
//       // Setup
//       mockReq.query = {
//         startDate: 'invalid-date',
//         endDate: '2024-01-31'
//       };

//       // Execute
//       await ReportController.getFinancialReport(mockReq, mockRes);

//       // Assert
//       expect(mockRes.status).toHaveBeenCalledWith(400);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Invalid date format"
//       });
//     });

//     it('should handle database errors gracefully', async () => {
//       // Setup
//       mockReq.query = {
//         startDate: '2024-01-01',
//         endDate: '2024-01-31'
//       };

//       const error = new Error('Database connection failed');
//       mockPayment.aggregate.mockRejectedValue(error);

//       // Execute
//       await ReportController.getFinancialReport(mockReq, mockRes);

//       // Assert
//       expect(mockLogger.error).toHaveBeenCalledWith(
//         "Error generating financial report:",
//         error.message
//       );
//       expect(mockRes.status).toHaveBeenCalledWith(500);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Failed to generate financial report"
//       });
//     });
//   });

//   describe('getOverviewStats', () => {
//     it('should return overview statistics successfully', async () => {
//       // Setup
//       const mockRevenueStats = [
//         {
//           totalRevenue: 50000,
//           totalTransactions: 250
//         }
//       ];

//       mockPatient.countDocuments.mockResolvedValue(150);
//       mockDoctor.countDocuments.mockResolvedValue(25);
//       mockAvailability.countDocuments.mockResolvedValue(80);
//       mockAppointment.countDocuments.mockResolvedValue(200);
//       mockPayment.aggregate.mockResolvedValue(mockRevenueStats);

//       // Execute
//       await ReportController.getOverviewStats(mockReq, mockRes);

//       // Assert
//       expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      
//       expect(mockPatient.countDocuments).toHaveBeenCalledWith({ role: "PATIENT" });
//       expect(mockDoctor.countDocuments).toHaveBeenCalled();
//       expect(mockAvailability.countDocuments).toHaveBeenCalled();
//       expect(mockAppointment.countDocuments).toHaveBeenCalled();
//       expect(mockPayment.aggregate).toHaveBeenCalled();
      
//       expect(mockRes.status).toHaveBeenCalledWith(200);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "success",
//         data: {
//           totalPatients: 150,
//           totalDoctors: 25,
//           totalAppointments: 200,
//           availableSlots: 80,
//           totalRevenue: 50000,
//           totalTransactions: 250,
//           lastUpdated: expect.any(String)
//         }
//       });
      
//       expect(mockLogger.info).toHaveBeenCalledWith(
//         "Overview stats generated",
//         expect.any(Object)
//       );
//     });

//     it('should handle errors gracefully', async () => {
//       // Setup
//       const error = new Error('Database error');
//       mockPatient.countDocuments.mockRejectedValue(error);

//       // Execute
//       await ReportController.getOverviewStats(mockReq, mockRes);

//       // Assert
//       expect(mockLogger.error).toHaveBeenCalledWith(
//         "Error generating overview stats:",
//         error.message
//       );
//       expect(mockRes.status).toHaveBeenCalledWith(500);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Failed to generate stats"
//       });
//     });
//   });

//   describe('getPaymentDashboard', () => {
//     it('should return payment dashboard data successfully', async () => {
//       // Setup
//       const mockTodayPayments = [{ amount: 5000, count: 25 }];
//       const mockMonthlyPayments = [{ amount: 15000, count: 75 }];
//       const mockYearlyPayments = [{ amount: 50000, count: 250 }];
//       const mockPendingPayments = [{ amount: 3000, count: 15 }];

//       mockPayment.aggregate
//         .mockResolvedValueOnce(mockTodayPayments)
//         .mockResolvedValueOnce(mockMonthlyPayments)
//         .mockResolvedValueOnce(mockYearlyPayments)
//         .mockResolvedValueOnce(mockPendingPayments);

//       // Execute
//       await ReportController.getPaymentDashboard(mockReq, mockRes);

//       // Assert
//       expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
//       expect(mockPayment.aggregate).toHaveBeenCalledTimes(4);
//       expect(mockRes.status).toHaveBeenCalledWith(200);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "success",
//         data: {
//           today: mockTodayPayments[0],
//           monthly: mockMonthlyPayments[0],
//           yearly: mockYearlyPayments[0],
//           pending: mockPendingPayments[0]
//         }
//       });
//     });

//     it('should return zero values when no data found', async () => {
//       // Setup
//       mockPayment.aggregate
//         .mockResolvedValueOnce([]) // Today payments
//         .mockResolvedValueOnce([]) // Monthly payments
//         .mockResolvedValueOnce([]) // Yearly payments
//         .mockResolvedValueOnce([]); // Pending payments

//       // Execute
//       await ReportController.getPaymentDashboard(mockReq, mockRes);

//       // Assert
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "success",
//         data: {
//           today: { amount: 0, count: 0 },
//           monthly: { amount: 0, count: 0 },
//           yearly: { amount: 0, count: 0 },
//           pending: { amount: 0, count: 0 }
//         }
//       });
//     });

//     it('should handle errors gracefully', async () => {
//       // Setup
//       const error = new Error('Database error');
//       mockPayment.aggregate.mockRejectedValue(error);

//       // Execute
//       await ReportController.getPaymentDashboard(mockReq, mockRes);

//       // Assert
//       expect(mockLogger.error).toHaveBeenCalledWith(
//         "Error generating payment dashboard:",
//         error.message
//       );
//       expect(mockRes.status).toHaveBeenCalledWith(500);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Failed to generate payment dashboard"
//       });
//     });
//   });
// });