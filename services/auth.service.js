import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import { User } from '../models/user.model.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.js';

// Load environment variables
config();

// Validate environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'EMAIL_SERVICE',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

// Initialize Nodemailer transporter
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

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error('Email transporter configuration error:', { error: error.message });
  } else {
    logger.info('Email transporter is ready');
  }
});

export class AuthService {
  generateToken(user) {
    try {
      logger.info('Generating JWT token for user:', { userId: user._id });
      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      logger.info('JWT token generated successfully');
      return token;
    } catch (error) {
      logger.error('Error generating JWT token:', { userId: user._id, error: error.message });
      throw new AppError('Failed to generate token', 500);
    }
  }

  // register
  async register(userData) {
    try {
      // Input validation
      if (!userData.email || !userData.password) {
        logger.warn('Registration failed - Missing required fields');
        throw new AppError('Email and password are required', 400);
      }

      logger.info('Starting registration for:', { email: userData.email });

      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        logger.warn('Registration failed - Email already exists:', { email: userData.email });
        throw new AppError('Email already registered', 400);
      }

      const verificationPin = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationPinExpires = new Date(Date.now() + 10 * 60 * 1000);

      const user = await User.create({
        ...userData,
        verificationPin,
        verificationPinExpires,
        isVerified: false,
      });
      logger.info('User created successfully:', { userId: user._id });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Verify Your Email Address',
        text: `Your verification PIN is ${verificationPin}. It expires in 10 minutes.`,
        html: `
          <h2>Email Verification</h2>
          <p>Please verify your email address using the following PIN:</p>
          <h3>${verificationPin}</h3>
          <p>This PIN expires in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        logger.info('Verification email sent:', { email: user.email, messageId: info.messageId });
      } catch (emailError) {
        logger.error('Failed to send verification email:', { error: emailError.message });
        // Optionally, delete user if email fails
        // await User.deleteOne({ _id: user._id });
        // throw new AppError('Failed to send verification email', 500);
      }

      return { user };
    } catch (error) {
      logger.error('Registration error:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Registration failed', 500);
    }
  }

  // verify Email
  async verifyEmail(pin) {
    try {
      logger.info('Starting email verification process', { pin });

      const user = await User.findOne({
        verificationPin: pin,
        verificationPinExpires: { $gt: Date.now() },
      });

      if (!user) {
        logger.warn('Email verification failed: Invalid or expired PIN', { pin });
        throw new AppError('Invalid or expired verification PIN', 400);
      }

      user.isVerified = true;
      user.verificationPin = undefined;
      user.verificationPinExpires = undefined;
      await user.save();

      logger.info('Email verified successfully', { userId: user._id });
      return user;
    } catch (error) {
      logger.error('Email verification failed:', { pin, error: error.message });
      throw error instanceof AppError ? error : new AppError('Email verification failed', 500);
    }
  }

  // login
  async login(email, password) {
    try {
      if (!email || !password) {
        logger.warn('Login failed: Missing credentials');
        throw new AppError('Email and password are required', 400);
      }

      logger.info('Starting login process', { email });

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        logger.warn('Login failed: User not found', { email });
        throw new AppError('Invalid email or password', 401);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        logger.warn('Login failed: Invalid password', { email });
        throw new AppError('Invalid email or password', 401);
      }

      if (!user.isVerified) {
        logger.warn('Login failed: Email not verified', { email });
        throw new AppError('Please verify your email first', 403);
      }

      logger.info('Login successful', { userId: user._id });
      return user;
    } catch (error) {
      logger.error('Login failed:', { email, error: error.message });
      throw error instanceof AppError ? error : new AppError('Login failed', 500);
    }
  }

  //forgot password
  async forgotPassword(email) {
    try {
      if (!email) {
        logger.warn('Forgot password failed: Email required');
        throw new AppError('Email is required', 400);
      }

      const user = await User.findOne({ email });
      if (!user) {
        logger.warn('Forgot password failed: User not found', { email });
        throw new AppError('User not found', 404);
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        logger.info('Password reset email sent:', { email, messageId: info.messageId });
      } catch (emailError) {
        logger.error('Failed to send password reset email:', { error: emailError.message });
      }

      return resetToken;
    } catch (error) {
      logger.error('Forgot password error:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to process password reset', 500);
    }
  }

  // reset password
  async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        logger.warn('Reset password failed: Missing token or password');
        throw new AppError('Token and new password are required', 400);
      }

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        logger.warn('Reset password failed: Invalid or expired token');
        throw new AppError('Invalid or expired reset token', 400);
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      logger.info('Password reset successfully', { userId: user._id });
      return user;
    } catch (error) {
      logger.error('Reset password error:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Password reset failed', 500);
    }
  }

  // update profile
  async updateProfile(userId, updateData) {
    try {
      if (!userId || !Object.keys(updateData).length) {
        logger.warn('Update profile failed: Missing user ID or update data');
        throw new AppError('User ID and update data are required', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        logger.warn('Update profile failed: User not found', { userId });
        throw new AppError('User not found', 404);
      }

      const allowedUpdates = ['firstName', 'lastName', 'phone'];
      Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          user[key] = updateData[key];
        }
      });

      await user.save();
      logger.info('Profile updated successfully', { userId });
      return user;
    } catch (error) {
      logger.error('Update profile error:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to update profile', 500);
    }
  }

  // change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      if (!userId || !currentPassword || !newPassword) {
        logger.warn('Change password failed: Missing required fields');
        throw new AppError('User ID, current password, and new password are required', 400);
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        logger.warn('Change password failed: User not found', { userId });
        throw new AppError('User not found', 404);
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        logger.warn('Change password failed: Incorrect current password', { userId });
        throw new AppError('Current password is incorrect', 400);
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Change password error:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to change password', 500);
    }
  }

  // send welcome e mail
  async sendWelcomeEmail(email, password) {
    try {
      if (!email || !password) {
        logger.warn('Send welcome email failed: Missing email or password');
        throw new AppError('Email and password are required', 400);
      }

      const user = await User.findOne({ email });
      if (!user) {
        logger.warn('Send welcome email failed: User not found', { email });
        throw new AppError('User not found', 404);
      }

      user.password = await bcrypt.hash(password, 10); // Hash the password
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Welcome to Our Platform',
        text: `Welcome, ${user.firstName}! Your account has been created. Use this link to set your password: ${resetUrl}\nThis link expires in 1 hour.`,
        html: `
          <h2>Welcome, ${user.firstName}!</h2>
          <p>Your account has been created. Click the link below to set your password:</p>
          <a href="${resetUrl}">Set Password</a>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        logger.info('Welcome email sent:', { email, messageId: info.messageId });
      } catch (emailError) {
        logger.error('Failed to send welcome email:', { error: emailError.message });
      }

      return resetToken;
    } catch (error) {
      logger.error('Send welcome email error:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to send welcome email', 500);
    }
  }

  // get all users
  async getAllUsers() {
    try {
      logger.info('Fetching all users');
      const users = await User.find()
        .select('-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires')
        .lean();
      logger.info('Successfully fetched all users', { count: users.length });
      return users;
    } catch (error) {
      logger.error('Error fetching all users:', { error: error.message });
      throw new AppError('Failed to fetch users', 500);
    }
  }

  // get user by id
  async getUserById(userId) {
    try {
      logger.info('Fetching user by ID:', { userId });
      const user = await User.findById(userId)
        .select('-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires')
        .lean();
      if (!user) {
        logger.warn('User not found:', { userId });
        throw new AppError('User not found', 404);
      }
      logger.info('Successfully fetched user:', { userId });
      return user;
    } catch (error) {
      logger.error('Error fetching user by ID:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to fetch user', 500);
    }
  }

  // update user
  async updateUser(userId, updateData) {
    try {
      logger.info('Updating user:', { userId });
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User not found:', { userId });
        throw new AppError('User not found', 404);
      }

      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ email: updateData.email });
        if (existingUser) {
          logger.warn('Email already exists:', { email: updateData.email });
          throw new AppError('Email already registered', 400);
        }
      }

      const allowedUpdates = [
        'email',
        'firstName',
        'lastName',
        'phone',
        'role',
        'address.street',
        'address.city',
        'address.state',
        'address.zipCode',
        'address.country',
      ];
      Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          if (key.startsWith('address.')) {
            const addressField = key.split('.')[1];
            user.address[addressField] = updateData[key];
          } else {
            user[key] = updateData[key];
          }
        }
      });

      if (updateData.password) {
        user.password = await bcrypt.hash(updateData.password, 10);
      }

      await user.save();
      logger.info('User updated successfully:', { userId });

      return await User.findById(userId)
        .select('-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires')
        .lean();
    } catch (error) {
      logger.error('Error updating user:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to update user', 500);
    }
  }

  // delete user
  async deleteUser(userId) {
    try {
      logger.info('Deleting user:', { userId });
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User not found:', { userId });
        throw new AppError('User not found', 404);
      }

      await user.deleteOne();
      logger.info('User deleted successfully:', { userId });
    } catch (error) {
      logger.error('Error deleting user:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to delete user', 500);
    }
  }

  // update user status
  async updateUserStatus(userId, statusData) {
    try {
      logger.info('Updating user status:', { userId });
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User not found:', { userId });
        throw new AppError('User not found', 404);
      }

      if (typeof statusData.isActive !== 'undefined') {
        user.isActive = statusData.isActive;
      }
      if (typeof statusData.isVerified !== 'undefined') {
        user.isVerified = statusData.isVerified;
      }

      await user.save();
      logger.info('User status updated successfully:', { userId });

      return await User.findById(userId)
        .select('-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires')
        .lean();
    } catch (error) {
      logger.error('Error updating user status:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to update user status', 500);
    }
  }

  // update user role
  async updateUserRole(userId, role) {
    try {
      logger.info('Updating user role:', { userId, role });
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User not found:', { userId });
        throw new AppError('User not found', 404);
      }

      user.role = role;
      await user.save();
      logger.info('User role updated successfully:', { userId, role });

      return await User.findById(userId)
        .select('-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires')
        .lean();
    } catch (error) {
      logger.error('Error updating user role:', { error: error.message });
      throw error instanceof AppError ? error : new AppError('Failed to update user role', 500);
    }
  }
}