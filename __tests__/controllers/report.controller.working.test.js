// Simple working test for report controller that follows CommonJS patterns
// This test should work with the test:working script

// Mock the models before importing the controller
const mockAvailabilityAggregate = jest.fn();
const mockAvailabilityCountDocuments = jest.fn();
const mockPatientAggregate = jest.fn();
const mockPatientCountDocuments = jest.fn();
const mockDoctorCountDocuments = jest.fn();
const mockAppointmentAggregate = jest.fn();
const mockAppointmentCountDocuments = jest.fn();

jest.mock('../../models/availability.model.js', () => {
  return {
    Availability: {
      aggregate: mockAvailabilityAggregate,
      countDocuments: mockAvailabilityCountDocuments
    }
  };
});

jest.mock('../../models/patient.model.js', () => {
  return {
    Patient: {
      aggregate: mockPatientAggregate,
      countDocuments: mockPatientCountDocuments
    }
  };
});

jest.mock('../../models/doctor.model.js', () => {
  return {
    Doctor: {
      countDocuments: mockDoctorCountDocuments
    }
  };
});

jest.mock('../../models/appointment.model.js', () => {
  return {
    Appointment: {
      aggregate: mockAppointmentAggregate,
      countDocuments: mockAppointmentCountDocuments
    }
  };
});

// Use require instead of import to avoid ES module issues
const { ReportController } = require('../../controllers/report.controller.js');

describe('Report Controller - Working Tests', () => {
  let reportController;
  let mockReq, mockRes;

  beforeEach(() => {
    // Create an instance of the controller
    reportController = new ReportController();
    
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request and response
    mockReq = {
      params: {},
      body: {},
      query: {},
      user: {}
    };
    
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getDoctorAvailabilityReport', () => {
    it('should generate doctor availability report successfully with date range', async () => {
      // Setup
      mockReq.query = {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      };
      
      const mockAvailableSlots = [
        {
          doctorId: 'doctor123',
          doctorName: 'Dr. Smith',
          email: 'smith@example.com',
          specialization: 'Cardiology',
          availableSlots: 10
        }
      ];
      
      mockAvailabilityAggregate.mockResolvedValue(mockAvailableSlots);
      
      // Execute
      await reportController.getDoctorAvailabilityReport(mockReq, mockRes);
      
      // Assert
      expect(mockAvailabilityAggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { availableSlots: mockAvailableSlots }
      });
    });
    
    it('should generate doctor availability report with default date range when no dates provided', async () => {
      // Setup
      mockReq.query = {};
      
      const mockAvailableSlots = [
        {
          doctorId: 'doctor456',
          doctorName: 'Dr. Johnson',
          email: 'johnson@example.com',
          specialization: 'Neurology',
          availableSlots: 5
        }
      ];
      
      mockAvailabilityAggregate.mockResolvedValue(mockAvailableSlots);
      
      // Execute
      await reportController.getDoctorAvailabilityReport(mockReq, mockRes);
      
      // Assert
      expect(mockAvailabilityAggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { availableSlots: mockAvailableSlots }
      });
    });
    
    it('should handle errors when generating doctor availability report', async () => {
      // Setup
      mockReq.query = {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      };
      
      const error = new Error('Database error');
      mockAvailabilityAggregate.mockRejectedValue(error);
      
      // Execute
      await reportController.getDoctorAvailabilityReport(mockReq, mockRes);
      
      // Assert
      expect(mockAvailabilityAggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to generate doctor availability report'
      });
    });
  });

  describe('getPatientCheckInReport', () => {
    it('should generate patient check-in report successfully', async () => {
      // Setup
      mockReq.query = {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      };
      
      const mockPatientCheckIns = [
        {
          _id: '2023-12',
          month: 'Dec',
          visits: 25,
          patients: []
        }
      ];
      
      mockPatientAggregate.mockResolvedValue(mockPatientCheckIns);
      
      // Execute
      await reportController.getPatientCheckInReport(mockReq, mockRes);
      
      // Assert
      expect(mockPatientAggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { patientCheckIns: mockPatientCheckIns }
      });
    });
    
    it('should handle errors when generating patient check-in report', async () => {
      // Setup
      mockReq.query = {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      };
      
      const error = new Error('Database error');
      mockPatientAggregate.mockRejectedValue(error);
      
      // Execute
      await reportController.getPatientCheckInReport(mockReq, mockRes);
      
      // Assert
      expect(mockPatientAggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error'
      });
    });
  });

  describe('getFinancialReport', () => {
    it('should generate financial report successfully', async () => {
      // Setup
      mockReq.query = {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      };
      
      const mockFinancialData = [
        {
          month: 'Dec',
          revenue: 25000
        }
      ];
      
      mockAppointmentAggregate.mockResolvedValue(mockFinancialData);
      
      // Execute
      await reportController.getFinancialReport(mockReq, mockRes);
      
      // Assert
      expect(mockAppointmentAggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { financialData: mockFinancialData }
      });
    });
    
    it('should handle errors when generating financial report', async () => {
      // Setup
      mockReq.query = {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      };
      
      const error = new Error('Database error');
      mockAppointmentAggregate.mockRejectedValue(error);
      
      // Execute
      await reportController.getFinancialReport(mockReq, mockRes);
      
      // Assert
      expect(mockAppointmentAggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to generate report'
      });
    });
  });

  describe('getOverviewStats', () => {
    it('should generate overview stats successfully with date range', async () => {
      // Setup
      mockReq.query = {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      };
      
      mockPatientCountDocuments.mockResolvedValue(150);
      mockDoctorCountDocuments.mockResolvedValue(25);
      mockAvailabilityCountDocuments.mockResolvedValue(50);
      mockAppointmentCountDocuments.mockResolvedValue(200);
      
      // Execute
      await reportController.getOverviewStats(mockReq, mockRes);
      
      // Assert
      expect(mockPatientCountDocuments).toHaveBeenCalledWith({ role: 'PATIENT' });
      expect(mockDoctorCountDocuments).toHaveBeenCalled();
      expect(mockAvailabilityCountDocuments).toHaveBeenCalledWith({
        isBooked: false,
        date: { $gte: expect.any(Date) }
      });
      expect(mockAppointmentCountDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          totalPatients: 150,
          totalDoctors: 25,
          totalAppointments: 200,
          availableSlots: 50,
          lastUpdated: expect.any(String)
        }
      });
    });
    
    it('should generate overview stats with default date range when no dates provided', async () => {
      // Setup
      mockReq.query = {};
      
      mockPatientCountDocuments.mockResolvedValue(150);
      mockDoctorCountDocuments.mockResolvedValue(25);
      mockAvailabilityCountDocuments.mockResolvedValue(50);
      mockAppointmentCountDocuments.mockResolvedValue(200);
      
      // Execute
      await reportController.getOverviewStats(mockReq, mockRes);
      
      // Assert
      expect(mockPatientCountDocuments).toHaveBeenCalledWith({ role: 'PATIENT' });
      expect(mockDoctorCountDocuments).toHaveBeenCalled();
      expect(mockAvailabilityCountDocuments).toHaveBeenCalledWith({
        isBooked: false,
        date: { $gte: expect.any(Date) }
      });
      expect(mockAppointmentCountDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          totalPatients: 150,
          totalDoctors: 25,
          totalAppointments: 200,
          availableSlots: 50,
          lastUpdated: expect.any(String)
        }
      });
    });
    
    it('should handle errors when generating overview stats', async () => {
      // Setup
      mockReq.query = {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      };
      
      const error = new Error('Database error');
      mockPatientCountDocuments.mockRejectedValue(error);
      
      // Execute
      await reportController.getOverviewStats(mockReq, mockRes);
      
      // Assert
      expect(mockPatientCountDocuments).toHaveBeenCalledWith({ role: 'PATIENT' });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to generate stats'
      });
    });
  });
});