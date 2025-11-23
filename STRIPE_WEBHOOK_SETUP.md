# Stripe Webhook Setup Guide

## What are Webhooks?

Webhooks are automated messages sent from Stripe to your server when events occur (payments, refunds, etc.). They allow your application to respond to payment events in real-time.

## Local Development Setup (Using Stripe CLI)

### Step 1: Install Stripe CLI

#### Windows (PowerShell)

```powershell
# Download and install using Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**OR** download directly from:
https://github.com/stripe/stripe-cli/releases/latest

Download `stripe_X.X.X_windows_x86_64.zip`, extract, and add to PATH.

#### macOS

```bash
brew install stripe/stripe-cli/stripe
```

#### Linux

```bash
# Debian/Ubuntu
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Step 2: Login to Stripe

Open a new terminal and run:

```bash
stripe login
```

This will:

1. Open your browser
2. Ask you to log in to your Stripe account
3. Grant the CLI access to your account
4. Display your pairing code

You should see:

```
Your pairing code is: xxx-xxx-xxx
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser (^C to quit)
```

### Step 3: Start Webhook Forwarding

In your project, the webhook endpoint is:

```
http://localhost:3002/api/payments/webhook
```

Run this command in a **separate terminal** (keep it running):

```bash
stripe listen --forward-to localhost:3002/api/payments/webhook
```

You should see:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

**IMPORTANT:** Copy the webhook signing secret (starts with `whsec_`)

### Step 4: Update Environment Variables

Add the webhook secret to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Restart Your Server

```bash
pnpm run dev:backend
```

Now your server can verify webhook events from Stripe!

---

## Testing Webhooks

### Method 1: Trigger Test Events with CLI

Open another terminal and run:

```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test checkout session completed
stripe trigger checkout.session.completed

# Test payment failed
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded
```

You should see the events in:

1. The terminal running `stripe listen`
2. Your server logs
3. Your database (payment status updates)

### Method 2: Make Real Test Payments

1. Create a checkout session using your frontend
2. Complete payment with test card: `4242 4242 4242 4242`
3. Stripe will send real webhook events to your local server

---

## Webhook Events We Handle

Your payment system listens for these events:

| Event                           | Description        | Action                |
| ------------------------------- | ------------------ | --------------------- |
| `checkout.session.completed`    | Checkout completed | Mark payment as PAID  |
| `payment_intent.succeeded`      | Payment succeeded  | Update payment status |
| `payment_intent.payment_failed` | Payment failed     | Mark as FAILED        |
| `charge.refunded`               | Refund processed   | Mark as REFUNDED      |

---

## Terminal Setup (3 Terminals Needed)

```
Terminal 1: Server
$ pnpm run dev:backend

Terminal 2: Stripe Webhook Listener
$ stripe listen --forward-to localhost:3002/api/payments/webhook

Terminal 3: Test Events (optional)
$ stripe trigger payment_intent.succeeded
```

---

## Verifying Webhook Setup

### 1. Check Server Logs

When `stripe listen` is running, you should see logs like:

```
2025-10-16 12:00:00 [info]: Stripe webhook received: checkout.session.completed
```

### 2. Check Stripe Dashboard

Go to: https://dashboard.stripe.com/test/webhooks
You'll see all webhook events and their delivery status.

### 3. Test with Frontend

1. Navigate to payment page
2. Select a payment
3. Click "Proceed with Card Payment"
4. Complete payment on Stripe Checkout
5. Check your database - payment status should be "PAID"

---

## Production Webhook Setup

For production, you DON'T use `stripe listen`. Instead:

### Step 1: Deploy Your Server

Your webhook endpoint will be:

```
https://yourdomain.com/api/payments/webhook
```

### Step 2: Add Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"

### Step 3: Get Production Webhook Secret

1. Click on your webhook endpoint
2. Click "Reveal" under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to your production environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_production_secret_here
   ```

---

## Troubleshooting

### Issue: "stripe: command not found"

**Solution:** Stripe CLI not installed or not in PATH

```bash
# Windows: Reinstall or add to PATH
# macOS/Linux: Run installation commands again
```

### Issue: "Failed to verify webhook signature"

**Solution:** Check your webhook secret

1. Make sure `STRIPE_WEBHOOK_SECRET` is set in `.env`
2. Restart your server after adding the secret
3. The secret should start with `whsec_`

### Issue: "Connection refused"

**Solution:** Make sure your server is running on port 3002

```bash
# Check if server is running
pnpm run dev:backend

# Verify port in .env
PORT=3002
```

### Issue: "No webhook events received"

**Solution:**

1. Check `stripe listen` is running
2. Verify the forwarding URL matches your server
3. Trigger a test event: `stripe trigger payment_intent.succeeded`

### Issue: "Webhook endpoint not found"

**Solution:** Check your payment routes are registered

```javascript
// In server.js, verify this line exists:
app.use("/api/payments", paymentRoutes);
```

---

## Webhook Security

### Signature Verification

Your payment controller automatically verifies webhook signatures:

```javascript
// In payment.controller.js
const sig = req.headers["stripe-signature"];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

This ensures:

- Events are from Stripe
- Events haven't been tampered with
- Prevents replay attacks

### Best Practices

1. ✅ Always verify webhook signatures
2. ✅ Use HTTPS in production
3. ✅ Keep webhook secret secure (use environment variables)
4. ✅ Implement idempotency (handle duplicate events)
5. ✅ Log all webhook events
6. ✅ Return 200 status quickly (process async if needed)

---

## Monitoring Webhooks

### View Webhook Logs

```javascript
// Check your server logs
logger.info(`Stripe webhook received: ${event.type}`);
```

### Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on a webhook endpoint
3. View event history and delivery attempts

### Failed Webhooks

Stripe will retry failed webhooks:

- After 1 hour
- After 3 hours
- After 6 hours
- After 12 hours
- After 24 hours

Make sure your endpoint returns 200 status for successful processing.

---

## Quick Reference Commands

```bash
# Install (Windows)
scoop install stripe

# Login
stripe login

# Start listener
stripe listen --forward-to localhost:3002/api/payments/webhook

# Test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded

# View events
stripe events list

# View specific event
stripe events retrieve evt_xxxxx

# View webhook endpoints
stripe webhook-endpoints list
```

---

## Your Current Setup

### Webhook Endpoint

```
POST http://localhost:3002/api/payments/webhook
```

### Server Port

```
3002 (from your .env file)
```

### Events Handled

- ✅ checkout.session.completed
- ✅ payment_intent.succeeded
- ✅ payment_intent.payment_failed
- ✅ charge.refunded

### Current Status

- ✅ Payment routes created
- ✅ Webhook handler implemented
- ✅ Stripe integration complete
- ⏳ Need to run `stripe listen`
- ⏳ Need to add webhook secret to .env

---

## Next Steps

1. ✅ Install Stripe CLI
2. ✅ Run `stripe login`
3. ✅ Run `stripe listen --forward-to localhost:3002/api/payments/webhook`
4. ✅ Copy the webhook secret to `.env`
5. ✅ Restart your server
6. ✅ Test with `stripe trigger payment_intent.succeeded`
7. ✅ Make a test payment through your frontend

---

## Support Resources

- Stripe CLI: https://stripe.com/docs/stripe-cli
- Webhook Testing: https://stripe.com/docs/webhooks/test
- Event Types: https://stripe.com/docs/api/events/types
- Stripe Dashboard: https://dashboard.stripe.com

---

## Questions?

If you encounter issues:

1. Check server logs for errors
2. Check `stripe listen` terminal for events
3. Verify webhook secret is correct
4. Ensure server is running on correct port
5. Test with `stripe trigger` commands
