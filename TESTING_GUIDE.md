# Stripe Payment System - Testing Guide

## Prerequisites Checklist

- [ ] Node.js and pnpm installed
- [ ] MongoDB connected
- [ ] Stripe CLI installed
- [ ] Stripe account (test mode)
- [ ] `.env` file configured with Stripe keys

---

## Test 1: Verify Server Setup

### Start the server:

```powershell
pnpm run dev:backend
```

### Expected Output:

```
✓ Connected to MongoDB
✓ Server running on port 3002
```

### Test endpoint:

```powershell
curl http://localhost:3002/api/test
```

**Expected:** `{"message":"Backend working fine"}`

---

## Test 2: Verify Stripe CLI Installation

```powershell
# Check version
stripe --version

# Login to Stripe
stripe login
```

**Expected:** Browser opens and authenticates successfully

---

## Test 3: Start Webhook Listener

### Terminal 2:

```powershell
stripe listen --forward-to localhost:3002/api/payments/webhook
```

**Expected Output:**

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxx
```

### Copy and save the webhook secret!

### Add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
```

### Restart server (Terminal 1)

---

## Test 4: Trigger Test Events

### Terminal 3:

```powershell
# Test successful payment
stripe trigger payment_intent.succeeded
```

### Check Terminal 2 (Stripe Listener):

```
✓ Should show event received
✓ Should show [200] POST response
```

### Check Terminal 1 (Server):

```
✓ Should show "Stripe webhook received: payment_intent.succeeded"
```

---

## Test 5: Create Payment via API

### Using curl or Postman:

**1. First, get your auth token by logging in:**

```powershell
# Login endpoint
POST http://localhost:3002/api/auth/login
Content-Type: application/json

{
  "email": "your-patient-email@example.com",
  "password": "your-password"
}
```

**2. Create a payment:**

```powershell
POST http://localhost:3002/api/payments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "appointmentId": "your-appointment-id",
  "amount": 3000
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "invoiceNumber": "INV-202510-00001",
    "status": "PENDING",
    "amount": 3000
  }
}
```

---

## Test 6: Create Stripe Checkout

```powershell
POST http://localhost:3002/api/payments/{payment-id}/stripe-checkout
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "successUrl": "http://localhost:3000/patient/payments?success=true",
  "cancelUrl": "http://localhost:3000/patient/payments?cancelled=true"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_xxxxx",
    "url": "https://checkout.stripe.com/pay/cs_test_xxxxx"
  }
}
```

---

## Test 7: Complete Payment Flow

### Option A: Using Frontend

1. Start frontend: `cd Client && pnpm run dev`
2. Navigate to: `http://localhost:5173/patient/payments`
3. Click "Proceed with Card Payment"
4. Enter test card: **4242 4242 4242 4242**
5. Complete payment

### Option B: Using Stripe Checkout URL

1. Copy the `url` from Test 6 response
2. Open in browser
3. Enter test card details
4. Complete payment

### Test Card Numbers:

| Card Number         | Result                |
| ------------------- | --------------------- |
| 4242 4242 4242 4242 | Success ✅            |
| 4000 0000 0000 0002 | Card declined ❌      |
| 4000 0027 6000 3184 | 3D Secure required 🔒 |

### Expected Result:

- ✅ Redirected to success URL
- ✅ Payment status updates to "PAID"
- ✅ Webhook event received in Terminal 2
- ✅ Server logs show payment verified

---

## Test 8: Verify Payment

```powershell
POST http://localhost:3002/api/payments/verify-stripe
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "sessionId": "cs_test_xxxxx"
}
```

**Expected:**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "status": "PAID",
    "paidAt": "2025-10-16T12:00:00.000Z"
  }
}
```

---

## Test 9: Get Outstanding Payments

```powershell
GET http://localhost:3002/api/payments/outstanding/list
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected:** Array of pending payments

---

## Test 10: Get Payment History

```powershell
GET http://localhost:3002/api/payments/history/list?status=PAID&page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected:** Paginated list of paid payments

---

## Test 11: Get Payment Summary

```powershell
GET http://localhost:3002/api/payments/summary/overview
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected:**

```json
{
  "success": true,
  "data": {
    "outstandingBalance": 5000,
    "pendingAppointments": 2,
    "totalPaid": 15000,
    "completedPayments": 5
  }
}
```

---

## Test 12: Generate Receipt

```powershell
GET http://localhost:3002/api/payments/{payment-id}/receipt
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected:** Payment receipt with all details

---

## Test 13: Process Refund

```powershell
POST http://localhost:3002/api/payments/{payment-id}/refund
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "refundAmount": 1500
}
```

**Expected:**

```json
{
  "success": true,
  "data": {
    "refundId": "re_xxxxx",
    "refundAmount": 1500,
    "status": "succeeded"
  }
}
```

---

## Test 14: Webhook Event Testing

### Trigger different events:

```powershell
# Successful checkout
stripe trigger checkout.session.completed

# Payment succeeded
stripe trigger payment_intent.succeeded

# Payment failed
stripe trigger payment_intent.payment_failed

# Refund completed
stripe trigger charge.refunded
```

### Check:

- ✅ Terminal 2 shows events
- ✅ Terminal 1 shows webhook received
- ✅ Database updates accordingly

---

## Test Results Checklist

### Server Setup

- [ ] Server starts without errors
- [ ] MongoDB connected
- [ ] Test endpoint responds

### Stripe CLI

- [ ] CLI installed and working
- [ ] Login successful
- [ ] Webhook listener running
- [ ] Webhook secret obtained

### Environment

- [ ] `.env` has STRIPE_SECRET_KEY
- [ ] `.env` has STRIPE_WEBHOOK_SECRET
- [ ] Server restarted after adding webhook secret

### API Endpoints

- [ ] Create payment works
- [ ] Create checkout session works
- [ ] Verify payment works
- [ ] Get outstanding payments works
- [ ] Get payment history works
- [ ] Get payment summary works
- [ ] Generate receipt works
- [ ] Process refund works

### Webhooks

- [ ] Webhook listener receives events
- [ ] Server processes webhooks
- [ ] Payment status updates via webhooks
- [ ] No signature verification errors

### Frontend Integration

- [ ] Payment page loads
- [ ] Stripe checkout opens
- [ ] Test payment succeeds
- [ ] Success redirect works
- [ ] Payment list updates

---

## Common Test Failures & Solutions

### Error: "Cannot find module 'stripe'"

**Solution:** Run `pnpm install`

### Error: "Failed to verify webhook signature"

**Solution:**

1. Copy webhook secret from `stripe listen` output
2. Add to `.env` as `STRIPE_WEBHOOK_SECRET`
3. Restart server

### Error: "Payment not found"

**Solution:**

1. First create an appointment
2. Then create a payment for that appointment

### Error: "Patient profile not found"

**Solution:** Make sure you're logged in as a patient user

### Error: "Appointment not found"

**Solution:** Use a valid appointment ID when creating payment

---

## Monitoring & Debugging

### Server Logs

```powershell
# Watch server logs in Terminal 1
# Look for:
✓ "Payment created"
✓ "Stripe checkout session created"
✓ "Stripe webhook received"
✓ "Payment verified"
```

### Stripe Dashboard

https://dashboard.stripe.com/test/payments

- View all test payments
- See webhook events
- Check event details

### Database

```javascript
// MongoDB Compass or CLI
// Check collections:
-payments - appointments;
```

---

## Performance Testing

### Load Test (Optional)

```powershell
# Create multiple payments
for ($i=1; $i -le 10; $i++) {
    echo "Creating payment $i"
    # Run create payment API call
}
```

---

## Security Testing

### Test Authentication

- [ ] Try accessing endpoints without token (should fail)
- [ ] Try with invalid token (should fail)
- [ ] Try with valid token (should work)

### Test Authorization

- [ ] Patient can only see their own payments
- [ ] Cannot access other patient's payments

---

## Final Verification

After all tests pass:

1. ✅ Create a payment
2. ✅ Complete Stripe checkout
3. ✅ Verify payment status updated
4. ✅ View in payment history
5. ✅ Download receipt
6. ✅ Process refund (if needed)

**If all steps work, your payment system is ready! 🎉**

---

## Next Steps

1. Test with real users (still in test mode)
2. Implement email notifications for payments
3. Add payment reminders for overdue payments
4. Create admin dashboard for payment management
5. Prepare for production deployment

---

## Production Testing Checklist

Before going live:

- [ ] Switch to live Stripe keys
- [ ] Set up production webhook endpoint
- [ ] Test with real bank accounts (small amounts)
- [ ] Verify refund process
- [ ] Test error scenarios
- [ ] Load testing
- [ ] Security audit
- [ ] Backup procedures
- [ ] Monitoring alerts
- [ ] Documentation complete
