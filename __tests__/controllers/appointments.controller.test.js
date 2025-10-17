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

jest.mock('../../services/appointments.service.js', () => {
  return {
    AppointmentService: jest.fn().mockImplementation(() => mockService)
  };
});

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

describe('Appointments Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      query: {},
      body: {},
      params: {},
      user: {}
    };
    
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    
    mockNext = jest.fn();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getSpecialties', () => {
    it('should return a list of specialties', async () => {
      const mockSpecialties = ['General OPD', 'Cardiologist', 'Pediatrician'];
      mockService.listSpecialties.mockResolvedValue(mockSpecialties);
      
      await getSpecialties(mockReq, mockRes, mockNext);
      
      expect(mockService.listSpecialties).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockSpecialties });
    });
    
    it('should call next with error if service throws', async () => {
      const error = new Error('Service error');
      mockService.listSpecialties.mockRejectedValue(error);
      
      await getSpecialties(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getDoctors', () => {
    it('should return doctors for a specialty', async () => {
      mockReq.query.specialty = 'Cardiologist';
      const mockDoctors = [{ name: 'Dr. Smith' }];
      mockService.listDoctorsBySpecialty.mockResolvedValue(mockDoctors);
      
      await getDoctors(mockReq, mockRes, mockNext);
      
      expect(mockService.listDoctorsBySpecialty).toHaveBeenCalledWith('Cardiologist');
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockDoctors });
    });
    
    it('should call next with error if service throws', async () => {
      const error = new Error('Service error');
      mockService.listDoctorsBySpecialty.mockRejectedValue(error);
      
      await getDoctors(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getSlots', () => {
    it('should return available slots for a doctor and date', async () => {
      mockReq.query.doctorId = 'doctor123';
      mockReq.query.date = '2023-12-01';
      const mockSlots = [{ startTime: '09:00', endTime: '10:00' }];
      mockService.listSlots.mockResolvedValue(mockSlots);
      
      await getSlots(mockReq, mockRes, mockNext);
      
      expect(mockService.listSlots).toHaveBeenCalledWith({
        doctorId: 'doctor123',
        dateISO: '2023-12-01'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockSlots });
    });
    
    it('should call next with error if service throws', async () => {
      const error = new Error('Service error');
      mockService.listSlots.mockRejectedValue(error);
      
      await getSlots(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('postCreate', () => {
    it('should create an appointment and return it', async () => {
      mockReq.user = { _id: 'patient123' };
      mockReq.body = { doctorId: 'doctor123', slotId: 'slot123' };
      const mockAppointment = { _id: 'appointment123', status: 'PENDING' };
      mockService.createAppointment.mockResolvedValue(mockAppointment);
      
      await postCreate(mockReq, mockRes, mockNext);
      
      expect(mockService.createAppointment).toHaveBeenCalledWith({
        patientId: 'patient123',
        doctorId: 'doctor123',
        slotId: 'slot123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockAppointment });
    });
    
    it('should call next with error if service throws', async () => {
      mockReq.user = { _id: 'patient123' };
      mockReq.body = { doctorId: 'doctor123', slotId: 'slot123' };
      const error = new Error('Service error');
      mockService.createAppointment.mockRejectedValue(error);
      
      await postCreate(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('postPay', () => {
    it('should confirm payment for an appointment', async () => {
      mockReq.body = { appointmentId: 'appointment123' };
      const mockAppointment = { _id: 'appointment123', status: 'CONFIRMED' };
      mockService.payAndConfirm.mockResolvedValue(mockAppointment);
      
      await postPay(mockReq, mockRes, mockNext);
      
      expect(mockService.payAndConfirm).toHaveBeenCalledWith({
        appointmentId: 'appointment123'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockAppointment });
    });
    
    it('should call next with error if service throws', async () => {
      const error = new Error('Service error');
      mockService.payAndConfirm.mockRejectedValue(error);
      
      await postPay(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getMine', () => {
    it('should return appointments for the current patient', async () => {
      mockReq.user = { _id: 'patient123' };
      const mockAppointments = [{ _id: 'appointment123' }];
      mockService.listAppointmentsForPatient.mockResolvedValue(mockAppointments);
      
      await getMine(mockReq, mockRes, mockNext);
      
      expect(mockService.listAppointmentsForPatient).toHaveBeenCalledWith({
        patientId: 'patient123'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockAppointments });
    });
    
    it('should call next with error if service throws', async () => {
      const error = new Error('Service error');
      mockService.listAppointmentsForPatient.mockRejectedValue(error);
      
      await getMine(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getDoctorAppointments', () => {
    it('should return 403 if user is not a doctor', async () => {
      mockReq.user = { role: 'PATIENT' };
      
      await getDoctorAppointments(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. Doctors only.' });
    });
    
    it('should return 400 if doctor profile not found', async () => {
      mockReq.user = { role: 'DOCTOR' };
      
      await getDoctorAppointments(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Doctor profile not found' });
    });
    
    it('should return appointments for the current doctor', async () => {
      mockReq.user = { role: 'DOCTOR', doctor: { _id: 'doctor123' } };
      const mockAppointments = [{ _id: 'appointment123' }];
      mockService.listAppointmentsForDoctor.mockResolvedValue(mockAppointments);
      
      await getDoctorAppointments(mockReq, mockRes, mockNext);
      
      expect(mockService.listAppointmentsForDoctor).toHaveBeenCalledWith({
        doctorId: 'doctor123'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockAppointments });
    });
    
    it('should call next with error if service throws', async () => {
      mockReq.user = { role: 'DOCTOR', doctor: { _id: 'doctor123' } };
      const error = new Error('Service error');
      mockService.listAppointmentsForDoctor.mockRejectedValue(error);
      
      await getDoctorAppointments(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should return 403 if user is not a doctor', async () => {
      mockReq.user = { role: 'PATIENT' };
      
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. Doctors only.' });
    });
    
    it('should return 400 if doctor profile not found', async () => {
      mockReq.user = { role: 'DOCTOR' };
      
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Doctor profile not found' });
    });
    
    it('should return 400 for invalid status', async () => {
      mockReq.user = { role: 'DOCTOR', doctor: { _id: 'doctor123' } };
      mockReq.params = { appointmentId: 'appointment123' };
      mockReq.body = { status: 'INVALID' };
      
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid status value' });
    });
    
    it('should update appointment status successfully', async () => {
      mockReq.user = { role: 'DOCTOR', doctor: { _id: 'doctor123' } };
      mockReq.params = { appointmentId: 'appointment123' };
      mockReq.body = { status: 'CONFIRMED' };
      const mockAppointment = { _id: 'appointment123', status: 'CONFIRMED' };
      mockService.updateAppointmentStatus.mockResolvedValue(mockAppointment);
      
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
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
    
    it('should call next with error if service throws', async () => {
      mockReq.user = { role: 'DOCTOR', doctor: { _id: 'doctor123' } };
      mockReq.params = { appointmentId: 'appointment123' };
      mockReq.body = { status: 'CONFIRMED' };
      const error = new Error('Service error');
      mockService.updateAppointmentStatus.mockRejectedValue(error);
      
      await updateAppointmentStatus(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});