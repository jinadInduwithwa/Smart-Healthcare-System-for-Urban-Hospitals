# Payment System with Stripe Integration

## Overview

This payment system provides a complete solution for managing medical appointment payments using Stripe as the payment gateway.

## Features

- ✅ Create payment records for appointments
- ✅ Stripe Checkout integration for secure card payments
- ✅ Payment verification and status tracking
- ✅ Outstanding payment management
- ✅ Payment history with filtering
- ✅ Payment summary and analytics
- ✅ Refund processing
- ✅ Receipt generation
- ✅ Webhook support for real-time payment updates
- ✅ Multiple payment methods support (Card, Insurance, Hospital)

## Setup Instructions

### 1. Environment Variables

The following Stripe configuration has been added to your `.env` file:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=lkr
```

**Note:** For production, get your webhook secret from Stripe Dashboard > Developers > Webhooks

### 2. Install Dependencies

The `stripe` package is already included in package.json. Run:

```bash
pnpm install
```

### 3. Restart Server

```bash
pnpm run dev:backend
```

## API Endpoints

### Base URL

```
http://localhost:3002/api/payments
```

### Authentication

All endpoints (except webhook) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### 1. Create Payment

**POST** `/api/payments`

Create a new payment record for an appointment.

**Request Body:**

```json
{
  "appointmentId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "amount": 3000,
  "dueDate": "2025-10-23T00:00:00.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "_id": "payment_id",
    "invoiceNumber": "INV-202510-00001",
    "amount": 3000,
    "status": "PENDING",
    "dueDate": "2025-10-23T00:00:00.000Z",
    ...
  }
}
```

---

### 2. Create Stripe Checkout Session

**POST** `/api/payments/:paymentId/stripe-checkout`

Create a Stripe Checkout session for card payment.

**Request Body:**

```json
{
  "successUrl": "http://localhost:3000/patient/payments?payment_success=true&payment_id=xxx",
  "cancelUrl": "http://localhost:3000/patient/payments?payment_cancelled=true&payment_id=xxx"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Stripe checkout session created",
  "data": {
    "sessionId": "cs_test_xxx",
    "url": "https://checkout.stripe.com/pay/cs_test_xxx",
    "paymentId": "payment_id"
  }
}
```

**Usage:**
Redirect the user to the returned `url` to complete payment.

---

### 3. Verify Stripe Payment

**POST** `/api/payments/verify-stripe`

Verify payment after Stripe redirects back to your site.

**Request Body:**

```json
{
  "sessionId": "cs_test_xxx"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "_id": "payment_id",
    "status": "PAID",
    "paidAt": "2025-10-16T12:00:00.000Z",
    "transactionId": "pi_xxx",
    ...
  }
}
```

---

### 4. Get Outstanding Payments

**GET** `/api/payments/outstanding/list`

Get all pending/overdue payments for the authenticated patient.

**Response:**

```json
{
  "success": true,
  "message": "Outstanding payments retrieved successfully",
  "data": [
    {
      "_id": "payment_id",
      "invoiceNumber": "INV-202510-00001",
      "amount": 3000,
      "status": "PENDING",
      "dueDate": "2025-10-23T00:00:00.000Z",
      "appointment": { ... },
      "doctor": { ... }
    }
  ]
}
```

---

### 5. Get Payment History

**GET** `/api/payments/history/list`

Get payment history with filtering and pagination.

**Query Parameters:**

- `status` - Filter by status (PAID, PENDING, FAILED, etc.)
- `paymentMethod` - Filter by method (CARD, INSURANCE, HOSPITAL)
- `startDate` - Filter from date (ISO 8601)
- `endDate` - Filter to date (ISO 8601)
- `search` - Search by invoice number or transaction ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Example:**

```
GET /api/payments/history/list?status=PAID&page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 6. Get Payment Summary

**GET** `/api/payments/summary/overview`

Get payment summary statistics for the authenticated patient.

**Response:**

```json
{
  "success": true,
  "message": "Payment summary retrieved successfully",
  "data": {
    "outstandingBalance": 5000,
    "pendingAppointments": 2,
    "totalPaid": 15000,
    "completedPayments": 5,
    "insuranceCoverage": 0
  }
}
```

---

### 7. Get Payment by ID

**GET** `/api/payments/:paymentId`

Get detailed information about a specific payment.

**Response:**

```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": { ... }
}
```

---

### 8. Process Refund

**POST** `/api/payments/:paymentId/refund`

Process a refund for a paid payment.

**Request Body:**

```json
{
  "refundAmount": 1500 // Optional, defaults to full amount
}
```

**Response:**

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundId": "re_xxx",
    "refundAmount": 1500,
    "status": "succeeded"
  }
}
```

---

### 9. Generate Receipt

**GET** `/api/payments/:paymentId/receipt`

Generate a payment receipt for a paid payment.

**Response:**

```json
{
  "success": true,
  "message": "Receipt generated successfully",
  "data": {
    "invoiceNumber": "INV-202510-00001",
    "transactionId": "pi_xxx",
    "amount": 3000,
    "currency": "LKR",
    "paidAt": "2025-10-16T12:00:00.000Z",
    "patientName": "John Doe",
    "doctorName": "Dr. Smith",
    "specialization": "Cardiology",
    ...
  }
}
```

---

### 10. Stripe Webhook

**POST** `/api/payments/webhook`

Endpoint for Stripe webhook events. Configure this in your Stripe Dashboard.

**Webhook URL:**

```
https://yourdomain.com/api/payments/webhook
```

**Supported Events:**

- `checkout.session.completed` - Payment completed
- `payment_intent.succeeded` - Payment succeeded
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund completed

---

## Payment Flow

### For Patients:

1. **Book Appointment** - Patient books an appointment
2. **Payment Created** - System automatically creates a payment record
3. **Select Payment Method** - Patient selects payment method (Card/Insurance/Hospital)
4. **Card Payment Flow:**
   - Call `POST /api/payments/:paymentId/stripe-checkout`
   - Redirect to Stripe Checkout URL
   - Complete payment on Stripe
   - Stripe redirects back with `session_id`
   - Call `POST /api/payments/verify-stripe` with session ID
   - Payment status updates to PAID
5. **View Outstanding** - `GET /api/payments/outstanding/list`
6. **View History** - `GET /api/payments/history/list`

### Webhook Flow (Automatic):

1. Payment completed on Stripe
2. Stripe sends webhook event to your server
3. Server verifies webhook signature
4. Server updates payment status
5. Server updates appointment payment status

---

## Frontend Integration

The payment system is already integrated with your frontend:

### Files:

- `Client/src/utils/paymentApi.ts` - API client functions
- `Client/src/pages/appointments/PaymentManagement.tsx` - Main payment page
- `Client/src/pages/appointments/OutstandingPayments.tsx` - Outstanding payments UI
- `Client/src/pages/appointments/PaymentHistory.tsx` - Payment history UI

### Usage Example:

```typescript
import {
  createStripeCheckout,
  verifyStripePayment,
  getOutstandingPayments,
} from "@/utils/paymentApi";

// Create checkout session
const checkout = await createStripeCheckout(paymentId, successUrl, cancelUrl);

// Redirect to Stripe
window.location.href = checkout.url;

// After redirect back, verify payment
const payment = await verifyStripePayment(sessionId);
```

---

## Testing

### Test Cards:

Use these test card numbers in Stripe Checkout:

**Successful Payment:**

- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Failed Payment:**

- Card: `4000 0000 0000 0002`

**3D Secure:**

- Card: `4000 0027 6000 3184`

### Test Webhook:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3002/api/payments/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

---

## Payment Status Flow

```
PENDING → PROCESSING → PAID → COMPLETED
   ↓
OVERDUE (if past due date)
   ↓
CANCELLED or FAILED

PAID → REFUNDED (if refund processed)
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

**Common Error Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (payment/appointment not found)
- `500` - Internal Server Error

---

## Security

1. **Authentication** - All endpoints require JWT authentication
2. **Authorization** - Patients can only access their own payments
3. **Stripe Security** - Uses Stripe's secure checkout (PCI compliant)
4. **Webhook Verification** - Verifies webhook signatures
5. **HTTPS** - Use HTTPS in production

---

## Production Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Set up Stripe webhook endpoint
- [ ] Add `STRIPE_WEBHOOK_SECRET` to .env
- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up payment failure notifications
- [ ] Add payment receipt email functionality
- [ ] Configure refund policies
- [ ] Set up monitoring and logging
- [ ] Test all payment flows thoroughly

---

## Support

For issues or questions:

1. Check Stripe Dashboard for payment details
2. Review server logs for errors
3. Check webhook delivery in Stripe Dashboard
4. Verify environment variables are set correctly

---

## Database Schema

### Payment Model

```javascript
{
  invoiceNumber: String (unique),
  appointment: ObjectId (ref: Appointment),
  patient: ObjectId (ref: Patient),
  doctor: ObjectId (ref: Doctor),
  amount: Number,
  currency: String (default: "lkr"),
  status: String (enum),
  paymentMethod: String (enum),
  stripeSessionId: String,
  stripePaymentIntentId: String,
  transactionId: String,
  dueDate: Date,
  paidAt: Date,
  refundId: String,
  refundAmount: Number,
  refundedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## License

This payment system is part of the Smart Healthcare System project.
