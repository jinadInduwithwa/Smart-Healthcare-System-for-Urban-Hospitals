# Payment System Setup Guide

This guide will help you set up the integrated Stripe payment system for the Smart Healthcare System.

## Backend Setup

### 1. Install Dependencies

```bash
# Install Stripe package
pnpm install stripe

# Or if using npm
npm install stripe
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

### 3. Stripe Account Setup

1. **Create a Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**:
   - Go to Stripe Dashboard > Developers > API Keys
   - Copy your Publishable key and Secret key
   - Add them to your `.env` file
3. **Set up Webhooks**:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/payments/webhook/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook secret and add to `.env`

### 4. Database Models

The payment system uses the following MongoDB collections:

- `payments` - Stores payment records
- `appointments` - Links to appointments
- `patients` - Links to patient information

## Frontend Setup

### 1. Environment Variables

Add to your frontend `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_API_BASE_URL=http://localhost:5000
```

### 2. Payment Flow

1. **Book Appointment**: User books an appointment
2. **Create Payment**: System creates a payment record
3. **Redirect to Payment**: User is redirected to payment management page
4. **Stripe Checkout**: User clicks "Proceed with Card Payment"
5. **Stripe Redirect**: User is redirected to Stripe's secure checkout
6. **Payment Success**: After successful payment, user is redirected back
7. **Payment Verification**: System verifies payment with Stripe
8. **Update Records**: Payment status is updated in database

## API Endpoints

### Payment Management

- `POST /api/payments` - Create a new payment
- `GET /api/payments/outstanding/list` - Get outstanding payments
- `GET /api/payments/history/list` - Get payment history
- `GET /api/payments/summary/overview` - Get payment summary
- `POST /api/payments/:id/stripe-checkout` - Create Stripe checkout session
- `POST /api/payments/verify-stripe` - Verify Stripe payment
- `POST /api/payments/:id/refund` - Process refund
- `GET /api/payments/:id/receipt` - Download receipt

### Stripe Webhook

- `POST /api/payments/webhook/stripe` - Handle Stripe webhooks

## Testing

### 1. Test Cards

Use these Stripe test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### 2. Test Flow

1. Start the backend server: `pnpm run dev:backend`
2. Start the frontend: `cd Client && pnpm run dev`
3. Book an appointment
4. Complete the payment flow
5. Check payment history

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Webhook Verification**: Always verify Stripe webhook signatures
3. **HTTPS**: Use HTTPS in production for webhook endpoints
4. **API Keys**: Keep Stripe secret keys secure
5. **Validation**: Validate all payment data on both frontend and backend

## Production Deployment

### 1. Stripe Live Mode

1. Switch to live mode in Stripe Dashboard
2. Update API keys to live keys
3. Update webhook endpoints to production URLs
4. Test with real payment methods

### 2. Environment Variables

Update production environment variables:

- Use live Stripe keys
- Set production frontend URL
- Configure production database

### 3. Webhook Configuration

- Set up webhook endpoint on production server
- Configure proper SSL certificates
- Test webhook delivery

## Troubleshooting

### Common Issues

1. **Payment Not Processing**: Check Stripe API keys and webhook configuration
2. **Redirect Issues**: Verify frontend URL configuration
3. **Database Errors**: Ensure MongoDB connection and schema
4. **CORS Issues**: Check CORS configuration for frontend domain

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

Check server logs for detailed error information.

## Support

For issues related to:

- **Stripe Integration**: Check [Stripe Documentation](https://stripe.com/docs)
- **Backend Issues**: Check server logs and database connections
- **Frontend Issues**: Check browser console and network requests
