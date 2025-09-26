// email configuration
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import logger from './logger.js';

config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error('Email transporter configuration error:', { error: error.message });
  } else {
    logger.info('Email transporter is ready');
  }
});

export default transporter;