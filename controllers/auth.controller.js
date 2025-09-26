import { AuthService } from '../services/auth.service.js';
import { User } from '../models/user.model.js';
import logger from '../utils/logger.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyAuth = this.verifyAuth.bind(this);
    this.sendWelcomeEmail = this.sendWelcomeEmail.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.updateUserStatus = this.updateUserStatus.bind(this);
    this.updateUserRole = this.updateUserRole.bind(this);
  }

  async register(req, res) {
    try {
      const { email, password, role, firstName, lastName, address } = req.body;
      if (!email || !password) {
        logger.warn('Registration failed: Missing email or password', { email });
        return res.status(400).json({ status: 'error', message: 'Email and password are required' });
      }

      const { user } = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        address,
        role: role || 'CUSTOMER',
      });

      const token = this.authService.generateToken(user);

      logger.info('Registration successful:', { email });
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please check your email for verification code.',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error) {
      logger.error('Registration error:', { error: error.message, stack: error.stack });
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid data',
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Server error',
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        logger.warn('Login failed: Missing email or password', { email });
        return res.status(400).json({ status: 'error', message: 'Email and password are required' });
      }

      const user = await this.authService.login(email, password);
      const token = this.authService.generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      logger.info('Login successful:', { email });
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', { error: error.message, stack: error.stack });
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Server error',
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        logger.warn('Get profile failed: User not found', { userId: req.user.id });
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
      logger.error('Get profile error:', { error: error.message });
      res.status(500).json({ status: 'error', message: 'Error fetching profile' });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { pin } = req.body;
      if (!pin) {
        logger.warn('Verify email failed: Missing PIN');
        return res.status(400).json({ status: 'error', message: 'PIN is required' });
      }
      await this.authService.verifyEmail(pin);
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Verify email error:', { error: error.message });
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Email verification failed',
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        logger.warn('Forgot password failed: Missing email');
        return res.status(400).json({ status: 'error', message: 'Email is required' });
      }
      await this.authService.forgotPassword(email);
      res.status(200).json({
        status: 'success',
        message: 'Password reset instructions sent to email',
      });
    } catch (error) {
      logger.error('Forgot password error:', { error: error.message });
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to process password reset',
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      if (!password) {
        logger.warn('Reset password failed: Missing password');
        return res.status(400).json({ status: 'error', message: 'New password is required' });
      }
      await this.authService.resetPassword(token, password);
      res.status(200).json({
        status: 'success',
        message: 'Password reset successful',
      });
    } catch (error) {
      logger.error('Reset password error:', { error: error.message });
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Password reset failed',
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const updatedUser = await this.authService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error('Update profile error:', { error: error.message });
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to update profile',
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        logger.warn('Change password failed: Missing passwords');
        return res.status(400).json({ status: 'error', message: 'Current and new passwords are required' });
      }
      await this.authService.changePassword(req.user.id, currentPassword, newPassword);
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Change password error:', { error: error.message });
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to change password',
      });
    }
  }

  logout(req, res) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }

  async verifyAuth(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        logger.warn('Verify auth failed: User not found', { userId: req.user.id });
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive,
          },
        },
      });
    } catch (error) {
      logger.error('Auth verification error:', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Authentication verification failed',
      });
    }
  }

  async sendWelcomeEmail(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        logger.warn('Send welcome email failed: Missing email or password');
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required',
        });
      }
      const resetToken = await this.authService.sendWelcomeEmail(email, password);
      res.status(200).json({
        status: 'success',
        message: 'Welcome email sent successfully',
        data: { resetToken },
      });
    } catch (error) {
      logger.error('Send welcome email error:', { error: error.message });
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to send welcome email',
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.authService.getAllUsers();
      res.status(200).json({
        status: 'success',
        data: { users },
      });
    } catch (error) {
      logger.error('Get all users error:', { error: error.message });
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to fetch users',
      });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await this.authService.getUserById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      logger.error('Get user by ID error:', { error: error.message });
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to fetch user',
      });
    }
  }

  async updateUser(req, res) {
    try {
      const updatedUser = await this.authService.updateUser(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error('Update user error:', { error: error.message });
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to update user',
      });
    }
  }

  async deleteUser(req, res) {
    try {
      await this.authService.deleteUser(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Delete user error:', { error: error.message });
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to delete user',
      });
    }
  }

  async updateUserStatus(req, res) {
    try {
      const updatedUser = await this.authService.updateUserStatus(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error('Update user status error:', { error: error.message });
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to update user status',
      });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      if (!role) {
        logger.warn('Update user role failed: Missing role');
        return res.status(400).json({ status: 'error', message: 'Role is required' });
      }
      const updatedUser = await this.authService.updateUserRole(req.params.id, role);
      res.status(200).json({
        status: 'success',
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error('Update user role error:', { error: error.message });
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to update user role',
      });
    }
  }
}