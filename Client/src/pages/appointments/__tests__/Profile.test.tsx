import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '../Profile';

// Mock the AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    setUser: jest.fn(),
    updateUser: jest.fn(),
  }),
}));

// Mock the API functions
jest.mock('@/utils/api', () => ({
  getMe: jest.fn().mockResolvedValue({
    _id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  }),
  updateMe: jest.fn(),
  uploadAvatar: jest.fn(),
  changePassword: jest.fn(),
}));

// Mock the QRCodeSVG component
jest.mock('qrcode.react', () => ({
  QRCodeSVG: () => <div>QR Code</div>,
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe('Profile Component', () => {
  test('renders without crashing', () => {
    render(<Profile />);
  });

  test('displays user name and email', async () => {
    render(<Profile />);
    
    // Wait for the component to load
    expect(await screen.findByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });
});
