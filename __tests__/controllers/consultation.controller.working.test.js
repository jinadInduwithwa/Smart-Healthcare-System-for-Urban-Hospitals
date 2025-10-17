// Simple working test for consultation controller that follows CommonJS patterns
// This test should work with the test:working script

// Mock the ConsultationService before importing the controller
const mockService = {
  deleteConsultation: jest.fn(),
  addConsultation: jest.fn(),
  getConsultationsByPatient: jest.fn(),
  getAllPatients: jest.fn(),
  searchDiagnosisCodes: jest.fn(),
  searchTestNames: jest.fn(),
  searchDrugs: jest.fn(),
  updateConsultation: jest.fn(),
  addMedicalReport: jest.fn(),
  removeMedicalReport: jest.fn()
};

// Mock the service module
jest.mock('../../services/consultation.service.js', () => {
  return {
    ConsultationService: jest.fn().mockImplementation(() => mockService)
  };
});

// Use require instead of import to avoid ES module issues
const { ConsultationController } = require('../../controllers/consultation.controller.js');

describe('Consultation Controller - Working Tests', () => {
  let consultationController;
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Create an instance of the controller
    consultationController = new ConsultationController();
    
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request, response, and next function
    mockReq = {
      params: {},
      body: {},
      query: {},
      user: {},
      file: null
    };
    
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('deleteConsultation', () => {
    it('should delete a consultation successfully', async () => {
      // Setup
      mockReq.params = { id: 'consultation123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: null,
        message: 'Consultation deleted successfully'
      };
      
      mockService.deleteConsultation.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.deleteConsultation(mockReq, mockRes);
      
      // Assert
      expect(mockService.deleteConsultation).toHaveBeenCalledWith('consultation123', mockReq.user);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.params = { id: 'consultation123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Database error');
      mockService.deleteConsultation.mockRejectedValue(error);
      
      // Execute
      await consultationController.deleteConsultation(mockReq, mockRes);
      
      // Assert
      expect(mockService.deleteConsultation).toHaveBeenCalledWith('consultation123', mockReq.user);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('addConsultation', () => {
    it('should create a consultation successfully', async () => {
      // Setup
      mockReq.body = {
        patient: 'patient123',
        consultationDate: '2023-12-01',
        diagnosis: [],
        medications: [],
        recommendedTests: []
      };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: { _id: 'consultation123' },
        message: 'Consultation created successfully'
      };
      
      mockService.addConsultation.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.addConsultation(mockReq, mockRes);
      
      // Assert
      expect(mockService.addConsultation).toHaveBeenCalledWith(mockReq.body, mockReq.user);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        message: mockResult.message
      });
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.body = {
        patient: 'patient123',
        consultationDate: '2023-12-01',
        diagnosis: [],
        medications: [],
        recommendedTests: []
      };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Service error');
      mockService.addConsultation.mockRejectedValue(error);
      
      // Execute
      await consultationController.addConsultation(mockReq, mockRes);
      
      // Assert
      expect(mockService.addConsultation).toHaveBeenCalledWith(mockReq.body, mockReq.user);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('getConsultationsByPatient', () => {
    it('should fetch consultations for a patient', async () => {
      // Setup
      mockReq.params = { patientId: 'patient123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: [{ _id: 'consultation123' }],
        message: 'Consultations fetched successfully'
      };
      
      mockService.getConsultationsByPatient.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.getConsultationsByPatient(mockReq, mockRes);
      
      // Assert
      expect(mockService.getConsultationsByPatient).toHaveBeenCalledWith('patient123', mockReq.user);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.params = { patientId: 'patient123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Service error');
      mockService.getConsultationsByPatient.mockRejectedValue(error);
      
      // Execute
      await consultationController.getConsultationsByPatient(mockReq, mockRes);
      
      // Assert
      expect(mockService.getConsultationsByPatient).toHaveBeenCalledWith('patient123', mockReq.user);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('getAllPatients', () => {
    it('should fetch all patients successfully', async () => {
      // Setup
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: [{ _id: 'patient123', name: 'John Doe' }],
        message: 'Patients fetched successfully'
      };
      
      mockService.getAllPatients.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.getAllPatients(mockReq, mockRes);
      
      // Assert
      expect(mockService.getAllPatients).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        message: mockResult.message
      });
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Service error');
      mockService.getAllPatients.mockRejectedValue(error);
      
      // Execute
      await consultationController.getAllPatients(mockReq, mockRes);
      
      // Assert
      expect(mockService.getAllPatients).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('searchDiagnosisCodes', () => {
    it('should search diagnosis codes successfully', async () => {
      // Setup
      mockReq.query = { query: 'headache', maxResults: '5' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: [{ code: 'R51', description: 'Headache' }],
        message: 'Diagnosis codes found'
      };
      
      mockService.searchDiagnosisCodes.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.searchDiagnosisCodes(mockReq, mockRes);
      
      // Assert
      expect(mockService.searchDiagnosisCodes).toHaveBeenCalledWith('headache', 5);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        message: mockResult.message
      });
    });
    
    it('should return 400 when query parameter is missing', async () => {
      // Setup
      mockReq.query = {};
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      // Execute
      await consultationController.searchDiagnosisCodes(mockReq, mockRes);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Query parameter is required'
      });
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.query = { query: 'headache' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Service error');
      mockService.searchDiagnosisCodes.mockRejectedValue(error);
      
      // Execute
      await consultationController.searchDiagnosisCodes(mockReq, mockRes);
      
      // Assert
      expect(mockService.searchDiagnosisCodes).toHaveBeenCalledWith('headache', 10);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('searchTestNames', () => {
    it('should search test names successfully', async () => {
      // Setup
      mockReq.query = { query: 'blood', maxResults: '5' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: [{ name: 'Complete Blood Count', category: 'Hematology' }],
        message: 'Test names found'
      };
      
      mockService.searchTestNames.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.searchTestNames(mockReq, mockRes);
      
      // Assert
      expect(mockService.searchTestNames).toHaveBeenCalledWith('blood', 5);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        message: mockResult.message
      });
    });
    
    it('should return 400 when query parameter is missing', async () => {
      // Setup
      mockReq.query = {};
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      // Execute
      await consultationController.searchTestNames(mockReq, mockRes);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Query parameter is required'
      });
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.query = { query: 'blood' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Service error');
      mockService.searchTestNames.mockRejectedValue(error);
      
      // Execute
      await consultationController.searchTestNames(mockReq, mockRes);
      
      // Assert
      expect(mockService.searchTestNames).toHaveBeenCalledWith('blood', 10);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('searchDrugs', () => {
    it('should search drugs successfully', async () => {
      // Setup
      mockReq.query = { query: 'aspirin', maxResults: '5' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: [{ name: 'Aspirin', dosage: '75mg' }],
        message: 'Drugs found'
      };
      
      mockService.searchDrugs.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.searchDrugs(mockReq, mockRes);
      
      // Assert
      expect(mockService.searchDrugs).toHaveBeenCalledWith('aspirin', 5);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        message: mockResult.message
      });
    });
    
    it('should return 400 when query parameter is missing', async () => {
      // Setup
      mockReq.query = {};
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      // Execute
      await consultationController.searchDrugs(mockReq, mockRes);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Query parameter is required'
      });
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.query = { query: 'aspirin' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Service error');
      mockService.searchDrugs.mockRejectedValue(error);
      
      // Execute
      await consultationController.searchDrugs(mockReq, mockRes);
      
      // Assert
      expect(mockService.searchDrugs).toHaveBeenCalledWith('aspirin', 10);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('updateConsultation', () => {
    it('should update a consultation successfully', async () => {
      // Setup
      mockReq.params = { id: 'consultation123' };
      mockReq.body = {
        diagnosis: ['R51'],
        medications: [{ name: 'Aspirin', dosage: '75mg' }],
        recommendedTests: ['Complete Blood Count']
      };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: { _id: 'consultation123', diagnosis: ['R51'] },
        message: 'Consultation updated successfully'
      };
      
      mockService.updateConsultation.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.updateConsultation(mockReq, mockRes);
      
      // Assert
      expect(mockService.updateConsultation).toHaveBeenCalledWith(
        'consultation123', 
        mockReq.body, 
        mockReq.user
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.params = { id: 'consultation123' };
      mockReq.body = {
        diagnosis: ['R51']
      };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Service error');
      mockService.updateConsultation.mockRejectedValue(error);
      
      // Execute
      await consultationController.updateConsultation(mockReq, mockRes);
      
      // Assert
      expect(mockService.updateConsultation).toHaveBeenCalledWith(
        'consultation123', 
        mockReq.body, 
        mockReq.user
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('addMedicalReport', () => {
    it('should add a medical report successfully', async () => {
      // Setup
      mockReq.params = { id: 'consultation123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      mockReq.file = {
        buffer: Buffer.from('test'),
        originalname: 'report.pdf'
      };
      
      const mockResult = {
        success: true,
        data: { reportId: 'report123' },
        message: 'Medical report added successfully'
      };
      
      mockService.addMedicalReport.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.addMedicalReport(mockReq, mockRes);
      
      // Assert
      expect(mockService.addMedicalReport).toHaveBeenCalledWith(
        'consultation123',
        mockReq.user,
        mockReq.file.buffer,
        'report.pdf'
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });
    
    it('should return 400 when no file is uploaded', async () => {
      // Setup
      mockReq.params = { id: 'consultation123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      mockReq.file = null;
      
      // Execute
      await consultationController.addMedicalReport(mockReq, mockRes);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file uploaded'
      });
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.params = { id: 'consultation123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      mockReq.file = {
        buffer: Buffer.from('test'),
        originalname: 'report.pdf'
      };
      
      const error = new Error('Service error');
      mockService.addMedicalReport.mockRejectedValue(error);
      
      // Execute
      await consultationController.addMedicalReport(mockReq, mockRes);
      
      // Assert
      expect(mockService.addMedicalReport).toHaveBeenCalledWith(
        'consultation123',
        mockReq.user,
        mockReq.file.buffer,
        'report.pdf'
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('removeMedicalReport', () => {
    it('should remove a medical report successfully', async () => {
      // Setup
      mockReq.params = { id: 'consultation123', reportId: 'report123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const mockResult = {
        success: true,
        data: null,
        message: 'Medical report removed successfully'
      };
      
      mockService.removeMedicalReport.mockResolvedValue(mockResult);
      
      // Execute
      await consultationController.removeMedicalReport(mockReq, mockRes);
      
      // Assert
      expect(mockService.removeMedicalReport).toHaveBeenCalledWith(
        'consultation123',
        'report123',
        mockReq.user
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });
    
    it('should handle error when service throws', async () => {
      // Setup
      mockReq.params = { id: 'consultation123', reportId: 'report123' };
      mockReq.user = { _id: 'doctor123', role: 'DOCTOR' };
      
      const error = new Error('Service error');
      mockService.removeMedicalReport.mockRejectedValue(error);
      
      // Execute
      await consultationController.removeMedicalReport(mockReq, mockRes);
      
      // Assert
      expect(mockService.removeMedicalReport).toHaveBeenCalledWith(
        'consultation123',
        'report123',
        mockReq.user
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });
});