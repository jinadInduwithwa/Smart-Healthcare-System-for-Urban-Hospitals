// Simple working test for payment controller that follows CommonJS patterns
// This test should work with the test:working script

// Mock the PaymentService before importing the controller
const mockService = {
  createPayment: jest.fn(),
  createStripeCheckout: jest.fn(),
  verifyStripePayment: jest.fn(),
  getOutstandingPayments: jest.fn(),
  getPaymentHistory: jest.fn(),
  getPaymentSummary: jest.fn(),
  getPaymentById: jest.fn(),
  processRefund: jest.fn(),
  generateReceipt: jest.fn(),
  handleStripeWebhook: jest.fn()
};

// Mock the service module
jest.mock('../../services/payment.service.js', () => {
  return mockService;
});

// Use require instead of import to avoid ES module issues
const {
  createPayment,
  createStripeCheckout,
  verifyStripePayment,
  getOutstandingPayments,
  getPaymentHistory,
  getPaymentSummary,
  getPaymentById,
  processRefund,
  generateReceipt,
  handleStripeWebhook
} = require('../../controllers/payment.controller.js');

describe('Payment Controller - Working Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request, response, and next function
    mockReq = {
      params: {},
      body: {},
      query: {},
      user: {},
      headers: {}
    };
    
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    
    mockNext = jest.fn();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      // Setup
      mockReq.body = {
        appointmentId: 'appointment123',
        amount: 250000,
        dueDate: '2023-12-01'
      };
      mockReq.user = { _id: 'user123' };
      
      const mockPayment = {
        _id: 'payment123',
        appointmentId: 'appointment123',
        amount: 250000,
        status: 'PENDING'
      };
      
      mockService.createPayment.mockResolvedValue(mockPayment);
      
      // Execute
      await createPayment(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.createPayment).toHaveBeenCalledWith(
        'appointment123',
        250000,
        'user123',
        '2023-12-01'
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment created successfully',
        data: mockPayment
      });
    });
    
    it('should call next with error when appointmentId is missing', async () => {
      // Setup
      mockReq.body = {
        amount: 250000
      };
      mockReq.user = { _id: 'user123' };
      
      // Execute
      await createPayment(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toBe('Appointment ID is required');
    });
  });

  describe('createStripeCheckout', () => {
    it('should create a Stripe checkout session successfully', async () => {
      // Setup
      mockReq.params = { paymentId: 'payment123' };
      mockReq.body = {
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel'
      };
      
      const mockCheckoutSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      };
      
      mockService.createStripeCheckout.mockResolvedValue(mockCheckoutSession);
      
      // Execute
      await createStripeCheckout(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.createStripeCheckout).toHaveBeenCalledWith(
        'payment123',
        'https://example.com/success',
        'https://example.com/cancel'
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Stripe checkout session created',
        data: mockCheckoutSession
      });
    });
  });

  describe('verifyStripePayment', () => {
    it('should verify a Stripe payment successfully', async () => {
      // Setup
      mockReq.body = { sessionId: 'session123' };
      
      const mockPayment = {
        _id: 'payment123',
        status: 'PAID',
        transactionId: 'txn123'
      };
      
      mockService.verifyStripePayment.mockResolvedValue(mockPayment);
      
      // Execute
      await verifyStripePayment(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.verifyStripePayment).toHaveBeenCalledWith('session123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment verified successfully',
        data: mockPayment
      });
    });
    
    it('should call next with error when sessionId is missing', async () => {
      // Setup
      mockReq.body = {};
      
      // Execute
      await verifyStripePayment(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toBe('Session ID is required');
    });
  });

  describe('getOutstandingPayments', () => {
    it('should fetch outstanding payments successfully', async () => {
      // Setup
      mockReq.user = { _id: 'user123' };
      
      const mockPayments = [
        { _id: 'payment123', amount: 250000, status: 'PENDING' },
        { _id: 'payment456', amount: 150000, status: 'PENDING' }
      ];
      
      mockService.getOutstandingPayments.mockResolvedValue(mockPayments);
      
      // Execute
      await getOutstandingPayments(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.getOutstandingPayments).toHaveBeenCalledWith('user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Outstanding payments retrieved successfully',
        data: mockPayments
      });
    });
  });

  describe('getPaymentHistory', () => {
    it('should fetch payment history successfully', async () => {
      // Setup
      mockReq.user = { _id: 'user123' };
      mockReq.query = {
        status: 'PAID',
        page: '1',
        limit: '10'
      };
      
      const mockResult = {
        payments: [
          { _id: 'payment123', amount: 250000, status: 'PAID' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      };
      
      mockService.getPaymentHistory.mockResolvedValue(mockResult);
      
      // Execute
      await getPaymentHistory(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.getPaymentHistory).toHaveBeenCalledWith('user123', {
        status: 'PAID',
        page: '1',
        limit: '10'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment history retrieved successfully',
        data: mockResult.payments,
        pagination: mockResult.pagination
      });
    });
  });

  describe('getPaymentSummary', () => {
    it('should fetch payment summary successfully', async () => {
      // Setup
      mockReq.user = { _id: 'user123' };
      
      const mockSummary = {
        totalPaid: 250000,
        totalPending: 150000,
        totalRefunded: 50000
      };
      
      mockService.getPaymentSummary.mockResolvedValue(mockSummary);
      
      // Execute
      await getPaymentSummary(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.getPaymentSummary).toHaveBeenCalledWith('user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment summary retrieved successfully',
        data: mockSummary
      });
    });
  });

  describe('getPaymentById', () => {
    it('should fetch a payment by ID successfully', async () => {
      // Setup
      mockReq.params = { paymentId: 'payment123' };
      mockReq.user = { _id: 'user123' };
      
      const mockPayment = {
        _id: 'payment123',
        amount: 250000,
        status: 'CONFIRMED'
      };
      
      mockService.getPaymentById.mockResolvedValue(mockPayment);
      
      // Execute
      await getPaymentById(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.getPaymentById).toHaveBeenCalledWith('payment123', 'user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment retrieved successfully',
        data: mockPayment
      });
    });
  });

  describe('processRefund', () => {
    it('should process a refund successfully', async () => {
      // Setup
      mockReq.params = { paymentId: 'payment123' };
      mockReq.body = { refundAmount: 250000 };
      mockReq.user = { _id: 'user123' };
      
      const mockRefund = {
        refundId: 'refund123',
        refundAmount: 250000,
        status: 'succeeded'
      };
      
      mockService.processRefund.mockResolvedValue(mockRefund);
      
      // Execute
      await processRefund(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.processRefund).toHaveBeenCalledWith(
        'payment123',
        'user123',
        250000
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Refund processed successfully',
        data: mockRefund
      });
    });
  });

  describe('generateReceipt', () => {
    it('should generate a receipt successfully', async () => {
      // Setup
      mockReq.params = { paymentId: 'payment123' };
      mockReq.user = { _id: 'user123' };
      
      const mockReceipt = {
        invoiceNumber: 'INV-123',
        transactionId: 'txn123',
        amount: 250000
      };
      
      mockService.generateReceipt.mockResolvedValue(mockReceipt);
      
      // Execute
      await generateReceipt(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.generateReceipt).toHaveBeenCalledWith('payment123', 'user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Receipt generated successfully',
        data: mockReceipt
      });
    });
  });

  describe('handleStripeWebhook', () => {
    it('should handle a Stripe webhook successfully', async () => {
      // Setup
      mockReq.headers = { 'stripe-signature': 'sig123' };
      mockReq.body = { type: 'checkout.session.completed' };
      
      mockService.handleStripeWebhook.mockResolvedValue();
      
      // Execute
      await handleStripeWebhook(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockService.handleStripeWebhook).toHaveBeenCalledWith({ type: 'checkout.session.completed' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });
  });
});