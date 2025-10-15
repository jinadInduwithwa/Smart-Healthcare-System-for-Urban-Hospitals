# Quick Start - Stripe Payment Integration

## Step 1: Install Stripe CLI

### Windows (Recommended - Using Scoop)

```powershell
# If you don't have Scoop, install it first:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Stripe CLI
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Manual Installation (Windows)

1. Download from: https://github.com/stripe/stripe-cli/releases/latest
2. Look for: `stripe_X.X.X_windows_x86_64.zip`
3. Extract and add to PATH

### Verify Installation

```powershell
stripe --version
```

---

## Step 2: Login to Stripe

```powershell
stripe login
```

This will:

- Open your browser
- Ask for authentication
- Give you a pairing code
- Press Enter after verification

---

## Step 3: Start Your Development Environment

### Terminal 1: Start Backend Server

```powershell
cd "C:\Users\Dasun\Desktop\my_d\Yesr 3 project\Smart-Healthcare-System-for-Urban-Hospitals"
pnpm run dev:backend
```

Wait for:

```
✓ Server running on port 3002
✓ Connected to MongoDB
```

### Terminal 2: Start Stripe Webhook Listener

```powershell
cd "C:\Users\Dasun\Desktop\my_d\Yesr 3 project\Smart-Healthcare-System-for-Urban-Hospitals"
stripe listen --forward-to localhost:3002/api/payments/webhook
```

You'll see:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANT: Copy the webhook secret (whsec\_...)**

### Terminal 3: Update Environment & Restart

1. Open `.env` file
2. Find the line: `STRIPE_WEBHOOK_SECRET=`
3. Paste your secret: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx`
4. Save the file
5. Go back to Terminal 1 and restart the server (Ctrl+C, then `pnpm run dev:backend`)

---

## Step 4: Test the Integration

### Terminal 4: Test Webhook Events (Optional)

```powershell
# Test successful payment
stripe trigger payment_intent.succeeded

# Test checkout completed
stripe trigger checkout.session.completed
```

You should see events in:

- Terminal 2 (Stripe listener)
- Terminal 1 (Server logs)

---

## Step 5: Test with Frontend

1. Start your frontend:

```powershell
cd Client
pnpm run dev
```

2. Navigate to: http://localhost:5173/patient/payments

3. Select a payment and click "Proceed with Card Payment"

4. Use test card:

   - **Card Number:** 4242 4242 4242 4242
   - **Expiry:** Any future date (e.g., 12/26)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 12345)

5. Complete payment

6. Check your database - payment status should update to "PAID"

---

## Your Environment Setup

```env
# In your .env file:
PORT=3002
MONGODB_URI=mongodb+srv://...

STRIPE_CURRENCY=lkr
```

---

## What You Should See

### Terminal 1 (Server)

```
[info]: Server running on port 3002
[info]: Connected to MongoDB
[info]: Stripe checkout session created: cs_test_xxx
[info]: Stripe webhook received: checkout.session.completed
[info]: Payment marked as paid via webhook: xxx
```

### Terminal 2 (Stripe Listener)

```
2025-10-16 12:00:00   --> payment_intent.succeeded [evt_xxx]
2025-10-16 12:00:01   <--  [200] POST http://localhost:3002/api/payments/webhook [evt_xxx]
```

---

## Common Issues

### "stripe: command not found"

**Solution:** Stripe CLI not installed. Follow Step 1.

### "Failed to verify webhook signature"

**Solution:**

1. Check `STRIPE_WEBHOOK_SECRET` in .env
2. Make sure you copied the secret from Terminal 2
3. Restart server after adding the secret

### "Connection refused"

**Solution:** Make sure server is running on port 3002

### No events received

**Solution:**

1. Check `stripe listen` is running
2. Trigger test event: `stripe trigger payment_intent.succeeded`

---

## Complete Workflow

```
1. User books appointment → Payment created (PENDING)
2. User clicks "Pay Now" → Stripe Checkout session created
3. User redirected to Stripe → Enters card details
4. Payment succeeds → Stripe sends webhook
5. Your server receives webhook → Updates payment to PAID
6. User redirected back → Sees success message
```

---

## API Endpoints Available

- `POST /api/payments` - Create payment
- `POST /api/payments/:id/stripe-checkout` - Create checkout session
- `POST /api/payments/verify-stripe` - Verify payment
- `GET /api/payments/outstanding/list` - Get outstanding payments
- `GET /api/payments/history/list` - Get payment history
- `GET /api/payments/summary/overview` - Get payment summary
- `GET /api/payments/:id/receipt` - Get receipt
- `POST /api/payments/:id/refund` - Process refund
- `POST /api/payments/webhook` - Stripe webhook (automatic)

---

## Need Help?

1. Check server logs in Terminal 1
2. Check Stripe events in Terminal 2
3. Check Stripe Dashboard: https://dashboard.stripe.com/test/payments
4. Review `STRIPE_WEBHOOK_SETUP.md` for detailed troubleshooting

---

## Production Deployment

When deploying to production:

1. ❌ DON'T use `stripe listen`
2. ✅ Add webhook in Stripe Dashboard
3. ✅ Use production Stripe keys
4. ✅ Use HTTPS for webhook endpoint
5. ✅ Update `STRIPE_WEBHOOK_SECRET` with production secret

See `STRIPE_WEBHOOK_SETUP.md` for production setup details.
