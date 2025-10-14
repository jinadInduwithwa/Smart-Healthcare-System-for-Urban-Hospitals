import { Doctor } from '../models/doctor.model.js';
import logger from '../utils/logger.js';

export class DoctorMgrController {
  async addDoctor(req, res) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        specialization,
        licenseNumber,
        address,
      } = req.body;

      const doctor = await Doctor.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        specialization,
        licenseNumber,
        address,
        role: 'DOCTOR',
      });

      logger.info('Doctor added successfully:', { email });
      res.status(201).json({
        status: 'success',
        message: 'Doctor added successfully',
        data: { doctor },
      });
    } catch (error) {
      logger.error('Add doctor error:', { error: error.message });
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid data',
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server error',
      });
    }
  }

  async updateDoctor(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const doctor = await Doctor.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!doctor) {
        logger.warn('Update doctor failed: Doctor not found', { id });
        return res.status(404).json({ status: 'error', message: 'Doctor not found' });
      }

      logger.info('Doctor updated successfully:', { id });
      res.status(200).json({
        status: 'success',
        message: 'Doctor updated successfully',
        data: { doctor },
      });
    } catch (error) {
      logger.error('Update doctor error:', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server error',
      });
    }
  }

  async deleteDoctor(req, res) {
    try {
      const { id } = req.params;

      const doctor = await Doctor.findByIdAndDelete(id);
      if (!doctor) {
        logger.warn('Delete doctor failed: Doctor not found', { id });
        return res.status(404).json({ status: 'error', message: 'Doctor not found' });
      }

      logger.info('Doctor deleted successfully:', { id });
      res.status(200).json({
        status: 'success',
        message: 'Doctor deleted successfully',
      });
    } catch (error) {
      logger.error('Delete doctor error:', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server error',
      });
    }
  }

  async getDoctors(req, res) {
    try {
      const doctors = await Doctor.find({ role: 'DOCTOR' }).select('-password'); // Exclude password
      logger.info('Doctors fetched successfully:', { count: doctors.length });
      res.status(200).json({
        status: 'success',
        data: { doctors },
      });
    } catch (error) {
      logger.error('Get doctors error:', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server error',
      });
    }
  }
}


export default new DoctorMgrController();