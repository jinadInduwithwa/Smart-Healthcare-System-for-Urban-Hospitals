// Tests/report.controller.test.js
import { jest } from '@jest/globals';

// Create mock functions
const mockFn = () => jest.fn();

// Mock the models and logger - define before jest.unstable_mockModule
const mockAppointment = { countDocuments: mockFn() };
const mockAvailability = { countDocuments: mockFn(), aggregate: mockFn() };
const mockDoctor = { countDocuments: mockFn() };
const mockPatient = { countDocuments: mockFn(), aggregate: mockFn() };
const mockPayment = { aggregate: mockFn() };
const mockLogger = { info: mockFn(), error: mockFn() };

// Mock the modules using unstable_mockModule for ES modules
await jest.unstable_mockModule('../models/appointment.model.js', () => ({
  Appointment: mockAppointment
}));

await jest.unstable_mockModule('../models/availability.model.js', () => ({
  Availability: mockAvailability
}));

await jest.unstable_mockModule('../models/doctor.model.js', () => ({
  Doctor: mockDoctor
}));

await jest.unstable_mockModule('../models/patient.model.js', () => ({
  Patient: mockPatient
}));

await jest.unstable_mockModule('../models/payment.model.js', () => ({
  default: mockPayment
}));

await jest.unstable_mockModule('../utils/logger.js', () => ({
  default: mockLogger
}));

// Import the controller after mocking
const { default: ReportController } = await import('../controllers/report.controller.js');

describe('Report Controller - Unit Tests for Admin Report Generation', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      query: {},
      params: {},
      body: {}
    };
    
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };
  });

  describe('getDoctorAvailabilityReport', () => {
    it('should return doctor availability report with date range', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const mockAvailabilityData = [
        {
          doctorId: 'doc1',
          doctorName: 'Dr. John Smith',
          email: 'john@example.com',
          specialization: 'Cardiology',
          availableSlots: 15
        },
        {
          doctorId: 'doc2',
          doctorName: 'Dr. Jane Doe',
          email: 'jane@example.com',
          specialization: 'Pediatrics',
          availableSlots: 10
        }
      ];

      mockAvailability.aggregate.mockResolvedValue(mockAvailabilityData);

      // Execute
      await ReportController.getDoctorAvailabilityReport(mockReq, mockRes);

      // Assert
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Expires', '0');
      
      expect(mockAvailability.aggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: { availableSlots: mockAvailabilityData }
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Doctor availability report generated", 
        expect.any(Object)
      );
    });

    it('should return doctor availability report with default date range when no dates provided', async () => {
      // Setup - no query parameters
      const mockAvailabilityData = [
        {
          doctorId: 'doc1',
          doctorName: 'Dr. John Smith',
          email: 'john@example.com',
          specialization: 'Cardiology',
          availableSlots: 8
        }
      ];

      mockAvailability.aggregate.mockResolvedValue(mockAvailabilityData);

      // Execute
      await ReportController.getDoctorAvailabilityReport(mockReq, mockRes);

      // Assert
      expect(mockAvailability.aggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: { availableSlots: mockAvailabilityData }
      });
    });

    it('should return empty array when no available slots found', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      mockAvailability.aggregate.mockResolvedValue([]);

      // Execute
      await ReportController.getDoctorAvailabilityReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: { availableSlots: [] }
      });
    });

    it('should handle errors gracefully', async () => {
      // Setup
      const error = new Error('Database error');
      mockAvailability.aggregate.mockRejectedValue(error);

      // Execute
      await ReportController.getDoctorAvailabilityReport(mockReq, mockRes);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error generating doctor availability report:",
        error.message
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to generate doctor availability report"
      });
    });
  });

  describe('getPatientCheckInReport', () => {
    it('should return patient check-in report successfully', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-03-31'
      };

      const mockPatientData = [
        {
          _id: '2024-01',
          month: 'Jan',
          visits: 25,
          patients: [
            {
              patientId: 'pat1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com'
            }
          ]
        },
        {
          _id: '2024-02',
          month: 'Feb',
          visits: 30,
          patients: [
            {
              patientId: 'pat2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com'
            }
          ]
        }
      ];

      mockPatient.aggregate.mockResolvedValue(mockPatientData);

      // Execute
      await ReportController.getPatientCheckInReport(mockReq, mockRes);

      // Assert
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      expect(mockPatient.aggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: { patientCheckIns: expect.any(Array) }
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Patient check-in report generated",
        expect.any(Object)
      );
    });

    it('should fill in zero values for months with no data', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-03-31'
      };

      // Only February has data
      const mockPatientData = [
        {
          _id: '2024-02',
          month: 'Feb',
          visits: 30,
          patients: []
        }
      ];

      mockPatient.aggregate.mockResolvedValue(mockPatientData);

      // Execute
      await ReportController.getPatientCheckInReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.patientCheckIns.length).toBe(3); // Jan, Feb, Mar
      // Check that Jan and Mar have zero visits
      expect(response.data.patientCheckIns[0].visits).toBe(0);
      expect(response.data.patientCheckIns[2].visits).toBe(0);
    });

    it('should return error when startDate and endDate are missing', async () => {
      // Setup - no query parameters
      mockReq.query = {};

      // Execute
      await ReportController.getPatientCheckInReport(mockReq, mockRes);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error generating patient check-in report:",
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "startDate and endDate are required"
      });
    });

    it('should return error for invalid date format', async () => {
      // Setup
      mockReq.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      // Execute
      await ReportController.getPatientCheckInReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid date format"
      });
    });

    it('should handle database errors gracefully', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-03-31'
      };

      const error = new Error('Database connection failed');
      mockPatient.aggregate.mockRejectedValue(error);

      // Execute
      await ReportController.getPatientCheckInReport(mockReq, mockRes);

      // Assert
      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getFinancialReport', () => {
    it('should return comprehensive financial report successfully', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-03-31'
      };

      const mockPaymentData = [
        {
          _id: '2024-01',
          month: 'Jan 2024',
          revenue: 5000,
          transactionCount: 25,
          pendingAmount: 1000,
          refundAmount: 200,
          totalTransactions: 26
        }
      ];

      const mockSummaryStats = [
        {
          totalRevenue: 15000,
          totalPending: 3000,
          totalRefunded: 600,
          paidTransactions: 75,
          pendingTransactions: 15,
          refundedTransactions: 3
        }
      ];

      const mockPaymentMethodStats = [
        {
          _id: 'CARD',
          totalAmount: 10000,
          transactionCount: 50
        },
        {
          _id: 'INSURANCE',
          totalAmount: 5000,
          transactionCount: 25
        }
      ];

      const mockTopDoctors = [
        {
          _id: 'doc1',
          doctorName: 'Dr. John Smith',
          specialization: 'Cardiology',
          totalRevenue: 8000,
          appointmentCount: 40
        },
        {
          _id: 'doc2',
          doctorName: 'Dr. Jane Doe',
          specialization: 'Pediatrics',
          totalRevenue: 7000,
          appointmentCount: 35
        }
      ];

      mockPayment.aggregate
        .mockResolvedValueOnce(mockPaymentData) // First call for payment data
        .mockResolvedValueOnce(mockSummaryStats) // Second call for summary stats
        .mockResolvedValueOnce(mockPaymentMethodStats) // Third call for payment methods
        .mockResolvedValueOnce(mockTopDoctors); // Fourth call for top doctors

      // Execute
      await ReportController.getFinancialReport(mockReq, mockRes);

      // Assert
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      expect(mockPayment.aggregate).toHaveBeenCalledTimes(4);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.data).toHaveProperty('financialData');
      expect(response.data).toHaveProperty('summary');
      expect(response.data).toHaveProperty('paymentMethods');
      expect(response.data).toHaveProperty('topDoctors');
      expect(response.data).toHaveProperty('reportPeriod');
      
      // Check summary calculations
      expect(response.data.summary.netRevenue).toBe(mockSummaryStats[0].totalRevenue - mockSummaryStats[0].totalRefunded);
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Financial report generated with payment data",
        expect.any(Object)
      );
    });

    it('should handle empty payment data gracefully', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-03-31'
      };

      mockPayment.aggregate
        .mockResolvedValueOnce([]) // Payment data
        .mockResolvedValueOnce([]) // Summary stats
        .mockResolvedValueOnce([]) // Payment methods
        .mockResolvedValueOnce([]); // Top doctors

      // Execute
      await ReportController.getFinancialReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.summary.totalRevenue).toBe(0);
      expect(response.data.summary.netRevenue).toBe(0);
    });

    it('should return error when startDate and endDate are missing', async () => {
      // Setup - no query parameters
      mockReq.query = {};

      // Execute
      await ReportController.getFinancialReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "startDate and endDate are required"
      });
    });

    it('should return error for invalid date format', async () => {
      // Setup
      mockReq.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      // Execute
      await ReportController.getFinancialReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid date format"
      });
    });

    it('should handle database errors gracefully', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const error = new Error('Database connection failed');
      mockPayment.aggregate.mockRejectedValue(error);

      // Execute
      await ReportController.getFinancialReport(mockReq, mockRes);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error generating financial report:",
        error.message
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to generate financial report"
      });
    });
  });

  describe('getOverviewStats', () => {
    it('should return comprehensive overview statistics successfully', async () => {
      // Setup
      const mockRevenueStats = [
        {
          totalRevenue: 50000,
          totalTransactions: 250
        }
      ];

      mockPatient.countDocuments.mockResolvedValue(150);
      mockDoctor.countDocuments.mockResolvedValue(25);
      mockAvailability.countDocuments.mockResolvedValue(80);
      mockAppointment.countDocuments.mockResolvedValue(200);
      mockPayment.aggregate.mockResolvedValue(mockRevenueStats);

      // Execute
      await ReportController.getOverviewStats(mockReq, mockRes);

      // Assert
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      expect(mockPatient.countDocuments).toHaveBeenCalledWith({ role: "PATIENT" });
      expect(mockDoctor.countDocuments).toHaveBeenCalled();
      expect(mockAvailability.countDocuments).toHaveBeenCalled();
      expect(mockAppointment.countDocuments).toHaveBeenCalled();
      expect(mockPayment.aggregate).toHaveBeenCalled();
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.data.totalPatients).toBe(150);
      expect(response.data.totalDoctors).toBe(25);
      expect(response.data.totalAppointments).toBe(200);
      expect(response.data.availableSlots).toBe(80);
      expect(response.data.totalRevenue).toBe(50000);
      expect(response.data.totalTransactions).toBe(250);
      expect(response.data).toHaveProperty('lastUpdated');
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Overview stats generated",
        expect.any(Object)
      );
    });

    it('should handle zero revenue gracefully', async () => {
      // Setup
      mockPatient.countDocuments.mockResolvedValue(10);
      mockDoctor.countDocuments.mockResolvedValue(5);
      mockAvailability.countDocuments.mockResolvedValue(20);
      mockAppointment.countDocuments.mockResolvedValue(15);
      mockPayment.aggregate.mockResolvedValue([]); // No revenue data

      // Execute
      await ReportController.getOverviewStats(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.totalRevenue).toBe(0);
      expect(response.data.totalTransactions).toBe(0);
    });

    it('should use custom date range when provided', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const mockRevenueStats = [{ totalRevenue: 10000, totalTransactions: 50 }];
      
      mockPatient.countDocuments.mockResolvedValue(100);
      mockDoctor.countDocuments.mockResolvedValue(10);
      mockAvailability.countDocuments.mockResolvedValue(30);
      mockAppointment.countDocuments.mockResolvedValue(50);
      mockPayment.aggregate.mockResolvedValue(mockRevenueStats);

      // Execute
      await ReportController.getOverviewStats(mockReq, mockRes);

      // Assert
      expect(mockAppointment.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.any(Object)
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors gracefully', async () => {
      // Setup
      const error = new Error('Database error');
      mockPatient.countDocuments.mockRejectedValue(error);

      // Execute
      await ReportController.getOverviewStats(mockReq, mockRes);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error generating overview stats:",
        error.message
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to generate stats"
      });
    });
  });

  describe('getPaymentDashboard', () => {
    it('should return payment dashboard data successfully', async () => {
      // Setup
      const mockTodayPayments = [{ amount: 5000, count: 25 }];
      const mockMonthlyPayments = [{ amount: 15000, count: 75 }];
      const mockYearlyPayments = [{ amount: 50000, count: 250 }];
      const mockPendingPayments = [{ amount: 3000, count: 15 }];

      mockPayment.aggregate
        .mockResolvedValueOnce(mockTodayPayments)
        .mockResolvedValueOnce(mockMonthlyPayments)
        .mockResolvedValueOnce(mockYearlyPayments)
        .mockResolvedValueOnce(mockPendingPayments);

      // Execute
      await ReportController.getPaymentDashboard(mockReq, mockRes);

      // Assert
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      expect(mockPayment.aggregate).toHaveBeenCalledTimes(4);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response.status).toBe('success');
      expect(response.data.today).toEqual(mockTodayPayments[0]);
      expect(response.data.monthly).toEqual(mockMonthlyPayments[0]);
      expect(response.data.yearly).toEqual(mockYearlyPayments[0]);
      expect(response.data.pending).toEqual(mockPendingPayments[0]);
    });

    it('should return zero values when no data found', async () => {
      // Setup
      mockPayment.aggregate
        .mockResolvedValueOnce([]) // Today payments
        .mockResolvedValueOnce([]) // Monthly payments
        .mockResolvedValueOnce([]) // Yearly payments
        .mockResolvedValueOnce([]); // Pending payments

      // Execute
      await ReportController.getPaymentDashboard(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.today).toEqual({ amount: 0, count: 0 });
      expect(response.data.monthly).toEqual({ amount: 0, count: 0 });
      expect(response.data.yearly).toEqual({ amount: 0, count: 0 });
      expect(response.data.pending).toEqual({ amount: 0, count: 0 });
    });

    it('should handle partial data correctly', async () => {
      // Setup - only today and monthly have data
      mockPayment.aggregate
        .mockResolvedValueOnce([{ amount: 1000, count: 5 }]) // Today
        .mockResolvedValueOnce([{ amount: 5000, count: 25 }]) // Monthly
        .mockResolvedValueOnce([]) // Yearly - no data
        .mockResolvedValueOnce([]); // Pending - no data

      // Execute
      await ReportController.getPaymentDashboard(mockReq, mockRes);

      // Assert
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.today.amount).toBe(1000);
      expect(response.data.monthly.amount).toBe(5000);
      expect(response.data.yearly).toEqual({ amount: 0, count: 0 });
      expect(response.data.pending).toEqual({ amount: 0, count: 0 });
    });

    it('should handle errors gracefully', async () => {
      // Setup
      const error = new Error('Database error');
      mockPayment.aggregate.mockRejectedValue(error);

      // Execute
      await ReportController.getPaymentDashboard(mockReq, mockRes);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error generating payment dashboard:",
        error.message
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to generate payment dashboard"
      });
    });
  });

  // Integration-style tests for cache headers
  describe('Cache Control Headers', () => {
    it('should set proper cache control headers for all report endpoints', async () => {
      // Setup mock data for each endpoint
      mockAvailability.aggregate.mockResolvedValue([]);
      mockPatient.aggregate.mockResolvedValue([]);
      mockPayment.aggregate.mockResolvedValue([]);
      mockPatient.countDocuments.mockResolvedValue(0);
      mockDoctor.countDocuments.mockResolvedValue(0);
      mockAvailability.countDocuments.mockResolvedValue(0);
      mockAppointment.countDocuments.mockResolvedValue(0);

      const tests = [
        { method: 'getDoctorAvailabilityReport', query: {} },
        { method: 'getPatientCheckInReport', query: { startDate: '2024-01-01', endDate: '2024-01-31' } },
        { method: 'getFinancialReport', query: { startDate: '2024-01-01', endDate: '2024-01-31' } },
        { method: 'getOverviewStats', query: {} },
        { method: 'getPaymentDashboard', query: {} }
      ];

      for (const test of tests) {
        jest.clearAllMocks();
        mockReq.query = test.query;
        
        await ReportController[test.method](mockReq, mockRes);
        
        expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(mockRes.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
        expect(mockRes.setHeader).toHaveBeenCalledWith('Expires', '0');
      }
    });
  });

  // Edge case tests
  describe('Edge Cases and Error Handling', () => {
    it('should handle very large date ranges in patient check-in report', async () => {
      // Setup - 12 month range
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      mockPatient.aggregate.mockResolvedValue([]);

      // Execute
      await ReportController.getPatientCheckInReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.patientCheckIns.length).toBe(12);
    });

    it('should handle single day date range', async () => {
      // Setup
      mockReq.query = {
        startDate: '2024-01-15',
        endDate: '2024-01-15'
      };

      mockPatient.aggregate.mockResolvedValue([]);

      // Execute
      await ReportController.getPatientCheckInReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.patientCheckIns.length).toBe(1);
    });

    it('should handle null or undefined values in query parameters', async () => {
      // Setup
      mockReq.query = {
        startDate: null,
        endDate: undefined
      };

      // Execute
      await ReportController.getPatientCheckInReport(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});