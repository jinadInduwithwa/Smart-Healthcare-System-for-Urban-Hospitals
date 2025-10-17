// Simple working test for appointments controller that follows CommonJS patterns
// This test should work with the test:working script

// Mock the AppointmentService before importing the controller
const mockService = {
  listSpecialties: jest.fn(),
  listDoctorsBySpecialty: jest.fn(),
  listSlots: jest.fn(),
  createAppointment: jest.fn(),
  payAndConfirm: jest.fn(),
  listAppointmentsForPatient: jest.fn(),
  listAppointmentsForDoctor: jest.fn(),
  updateAppointmentStatus: jest.fn()
};

// Mock the service module
jest.mock('../../services/appointments.service.js', () => {
  return {
    AppointmentService: jest.fn(() => mockService)
  };
});

// Use require instead of import to avoid ES module issues
const { 
  getSpecialties, 
  getDoctors, 
  getSlots, 
  postCreate, 
  postPay, 
  getMine,
  getDoctorAppointments,
  updateAppointmentStatus
} = require('../../controllers/appointments.controller.js');

describe('Appointments Controller - Working Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request, response, and next function
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
    
    mockNext = jest.fn();
  });

  describe('getSpecialties', () => {
    it('should return a list of specialties', async () => {
      // Setup
      const mockSpecialties = ['General OPD', 'Cardiologist', 'Pediatrician'];
      mockService.listSpecialties.mockResolvedValue(mockSpecialties);
      
      // Execute
      await getSpecialties(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.listSpecialties).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockSpecialties });
    });
    
    it('should call next with error when service throws', async () => {
      // Setup
      const error = new Error('Service error');
      mockService.listSpecialties.mockRejectedValue(error);
      
      // Execute
      await getSpecialties(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getDoctors', () => {
      it('should return a list of doctors by specialty', async () => {
        // Setup
        mockReq.query = { specialty: 'Cardiologist' };
        const mockDoctors = [
          { _id: 'doc1', name: 'Dr. Smith' },
          { _id: 'doc2', name: 'Dr. Johnson' }
        ];
        mockService.listDoctorsBySpecialty.mockResolvedValue(mockDoctors);
        
        // Execute
        await getDoctors(mockReq, mockRes, mockNext);
        
        // Assert
        expect(mockService.listDoctorsBySpecialty).toHaveBeenCalledWith('Cardiologist');
        expect(mockRes.json).toHaveBeenCalledWith({ data: mockDoctors });
      });
      
      it('should call next with error when service throws', async () => {
        // Setup
        mockReq.query = { specialty: 'Cardiologist' };
        const error = new Error('Service error');
        mockService.listDoctorsBySpecialty.mockRejectedValue(error);
        
        // Execute
        await getDoctors(mockReq, mockRes, mockNext);
        
        // Assert
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

    describe('getSlots', () => {
      it('should return a list of available slots', async () => {
        // Setup
        mockReq.query = { doctorId: 'doc123', date: '2023-12-01' };
        const mockSlots = [
          { _id: 'slot1', time: '09:00' },
          { _id: 'slot2', time: '10:00' }
        ];
        mockService.listSlots.mockResolvedValue(mockSlots);
        
        // Execute
        await getSlots(mockReq, mockRes, mockNext);
        
        // Assert
        expect(mockService.listSlots).toHaveBeenCalledWith({
          doctorId: 'doc123',
          dateISO: '2023-12-01'
        });
        expect(mockRes.json).toHaveBeenCalledWith({ data: mockSlots });
      });
      
      it('should call next with error when service throws', async () => {
        // Setup
        mockReq.query = { doctorId: 'doc123', date: '2023-12-01' };
        const error = new Error('Service error');
        mockService.listSlots.mockRejectedValue(error);
        
        // Execute
        await getSlots(mockReq, mockRes, mockNext);
        
        // Assert
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

  describe('postCreate', () => {
    it('should create an appointment successfully', async () => {
      // Setup
      mockReq.user = { _id: 'patient123' };
      mockReq.body = { doctorId: 'doctor123', slotId: 'slot123' };
      
      const mockAppointment = { 
        _id: 'appointment123', 
        patient: 'patient123',
        doctor: 'doctor123',
        status: 'PENDING' 
      };
      
      mockService.createAppointment.mockResolvedValue(mockAppointment);
      
      // Execute
      await postCreate(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.createAppointment).toHaveBeenCalledWith({
        patientId: 'patient123',
        doctorId: 'doctor123',
        slotId: 'slot123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockAppointment });
    });
    
    it('should call next with error when service throws', async () => {
      // Setup
      mockReq.user = { _id: 'patient123' };
      mockReq.body = { doctorId: 'doctor123', slotId: 'slot123' };
      
      const error = new Error('Service error');
      mockService.createAppointment.mockRejectedValue(error);
      
      // Execute
      await postCreate(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('postPay', () => {
    it('should process payment successfully', async () => {
      // Setup
      mockReq.body = { appointmentId: 'appointment123' };
      
      const mockResult = { 
        _id: 'appointment123', 
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      };
      
      mockService.payAndConfirm.mockResolvedValue(mockResult);
      
      // Execute
      await postPay(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.payAndConfirm).toHaveBeenCalledWith({
        appointmentId: 'appointment123'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockResult });
    });
    
    it('should call next with error when service throws', async () => {
      // Setup
      mockReq.body = { appointmentId: 'appointment123' };
      
      const error = new Error('Payment failed');
      mockService.payAndConfirm.mockRejectedValue(error);
      
      // Execute
      await postPay(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getMine', () => {
    it('should return appointments for the current patient', async () => {
      // Setup
      mockReq.user = { _id: 'patient123' };
      
      const mockAppointments = [{ _id: 'appointment123' }];
      mockService.listAppointmentsForPatient.mockResolvedValue(mockAppointments);
      
      // Execute
      await getMine(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.listAppointmentsForPatient).toHaveBeenCalledWith({
        patientId: 'patient123'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockAppointments });
    });
    
    it('should call next with error when service throws', async () => {
      // Setup
      mockReq.user = { _id: 'patient123' };
      
      const error = new Error('Service error');
      mockService.listAppointmentsForPatient.mockRejectedValue(error);
      
      // Execute
      await getMine(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getDoctorAppointments', () => {
    it('should return appointments for the current doctor', async () => {
      // Setup
      mockReq.user = { 
        _id: 'doctor123', 
        role: 'DOCTOR',
        doctor: { _id: 'doctor123' }
      };
      
      const mockAppointments = [{ _id: 'appointment123' }];
      mockService.listAppointmentsForDoctor.mockResolvedValue(mockAppointments);
      
      // Execute
      await getDoctorAppointments(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.listAppointmentsForDoctor).toHaveBeenCalledWith({
        doctorId: 'doctor123'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockAppointments });
    });
    
    it('should return 403 when user is not a doctor', async () => {
      // Setup
      mockReq.user = { 
        _id: 'patient123', 
        role: 'PATIENT'
      };
      
      // Execute
      await getDoctorAppointments(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Access denied. Doctors only.' 
      });
    });
    
    it('should return 400 when doctor profile is missing', async () => {
      // Setup
      mockReq.user = { 
        _id: 'doctor123', 
        role: 'DOCTOR'
      };
      
      // Execute
      await getDoctorAppointments(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Doctor profile not found' 
      });
    });
    
    it('should call next with error when service throws', async () => {
      // Setup
      mockReq.user = { 
        _id: 'doctor123', 
        role: 'DOCTOR',
        doctor: { _id: 'doctor123' }
      };
      
      const error = new Error('Service error');
      mockService.listAppointmentsForDoctor.mockRejectedValue(error);
      
      // Execute
      await getDoctorAppointments(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status successfully', async () => {
      // Setup
      mockReq.user = { 
        _id: 'doctor123', 
        role: 'DOCTOR',
        doctor: { _id: 'doctor123' }
      };
      mockReq.params = { appointmentId: 'appointment123' };
      mockReq.body = { status: 'CONFIRMED' };
      
      const mockAppointment = { 
        _id: 'appointment123', 
        status: 'CONFIRMED'
      };
      
      mockService.updateAppointmentStatus.mockResolvedValue(mockAppointment);
      
      // Execute
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.updateAppointmentStatus).toHaveBeenCalledWith({
        appointmentId: 'appointment123',
        status: 'CONFIRMED',
        doctorId: 'doctor123'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Appointment status updated successfully',
        data: mockAppointment 
      });
    });
    
    it('should return 403 when user is not a doctor', async () => {
      // Setup
      mockReq.user = { 
        _id: 'patient123', 
        role: 'PATIENT'
      };
      mockReq.params = { appointmentId: 'appointment123' };
      mockReq.body = { status: 'CONFIRMED' };
      
      // Execute
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Access denied. Doctors only.' 
      });
    });
    
    it('should return 400 when doctor profile is missing', async () => {
      // Setup
      mockReq.user = { 
        _id: 'doctor123', 
        role: 'DOCTOR'
      };
      mockReq.params = { appointmentId: 'appointment123' };
      mockReq.body = { status: 'CONFIRMED' };
      
      // Execute
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Doctor profile not found' 
      });
    });
    
    it('should return 400 for invalid status', async () => {
      // Setup
      mockReq.user = { 
        _id: 'doctor123', 
        role: 'DOCTOR',
        doctor: { _id: 'doctor123' }
      };
      mockReq.params = { appointmentId: 'appointment123' };
      mockReq.body = { status: 'INVALID_STATUS' };
      
      // Execute
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Invalid status value' 
      });
    });
    
    it('should call next with error when service throws', async () => {
      // Setup
      mockReq.user = { 
        _id: 'doctor123', 
        role: 'DOCTOR',
        doctor: { _id: 'doctor123' }
      };
      mockReq.params = { appointmentId: 'appointment123' };
      mockReq.body = { status: 'CONFIRMED' };
      
      const error = new Error('Service error');
      mockService.updateAppointmentStatus.mockRejectedValue(error);
      
      // Execute
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});