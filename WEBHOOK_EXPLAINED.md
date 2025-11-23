# 🎯 Stripe Webhook - Simple Explanation

## What is a Webhook?

Think of a webhook as a **phone call from Stripe to your server**.

When something happens on Stripe (like a payment succeeding), Stripe "calls" your server to let it know.

---

## Why Do We Need It?

### Without Webhooks ❌

```
User pays → Stripe processes → User closes browser → Your server never knows!
```

### With Webhooks ✅

```
User pays → Stripe processes → Stripe calls your server → Payment marked as PAID
```

**Webhooks ensure your database stays in sync with Stripe!**

---

## The Problem: Local Development

Stripe is on the internet, but your computer (localhost) is not accessible from the internet.

```
Internet (Stripe) ❌ → 🚫 Firewall → ❌ Your Computer (localhost:3002)
```

**Solution:** Stripe CLI acts as a tunnel!

---

## What Does `stripe listen` Do?

```
Internet (Stripe) → Stripe CLI (on your computer) → Your localhost:3002
```

The Stripe CLI:

1. Connects to Stripe's servers
2. Listens for events
3. Forwards them to your local server

---

## Step-by-Step: What Happens

### 1. You Run This Command:

```bash
stripe listen --forward-to localhost:3002/api/payments/webhook
```

### 2. Stripe CLI Says:

```
> Ready! Your webhook signing secret is whsec_abc123xyz...
```

This secret is like a **password** that proves the webhook is really from Stripe.

### 3. When a Payment Happens:

```
User → Stripe Checkout → Payment Succeeds
                              ↓
                         Stripe Server
                              ↓
                    [Webhook Event Created]
                              ↓
                         Stripe CLI (on your PC)
                              ↓
                    localhost:3002/api/payments/webhook
                              ↓
                    Your Payment Controller
                              ↓
                    Updates Database: Status = PAID
```

---

## The Three Commands Explained

### Command 1: `stripe login`

**What it does:** Connects the Stripe CLI to your Stripe account

**Like:** Logging into your email before you can send/receive messages

```bash
stripe login
```

**You only need to do this once.**

---

### Command 2: `stripe listen --forward-to localhost:3002/api/payments/webhook`

**What it does:** Starts listening for webhook events and forwards them to your local server

**Like:** Forwarding your phone calls to a different number

```bash
stripe listen --forward-to localhost:3002/api/payments/webhook
```

**Keep this running in a terminal while developing.**

**Important:** Copy the webhook secret it gives you!

---

### Command 3: `stripe trigger payment_intent.succeeded`

**What it does:** Creates a fake payment event to test your webhook

**Like:** Sending yourself a test message to make sure everything works

```bash
stripe trigger payment_intent.succeeded
```

**Use this to test without making real payments.**

---

## Real-World Flow

### Development (What You're Doing Now):

```
Terminal 1: pnpm run dev:backend        (Your server)
Terminal 2: stripe listen --forward-to... (Webhook forwarder)
Terminal 3: stripe trigger ...           (Testing - optional)
```

### Production (When You Deploy):

```
No stripe listen needed!
Just add webhook URL in Stripe Dashboard:
https://yourdomain.com/api/payments/webhook
```

---

## What You Need to Do

### Step 1: Install Stripe CLI

**Windows (PowerShell):**

```powershell
# Install Scoop package manager (if you don't have it)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Stripe CLI
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Verify:**

```powershell
stripe --version
```

---

### Step 2: Login

```powershell
stripe login
```

- Browser opens
- Click "Allow access"
- Done!

---

### Step 3: Start Your Server

```powershell
pnpm run dev:backend
```

Wait for: `✓ Server running on port 3002`

---

### Step 4: Start Webhook Listener (New Terminal)

```powershell
stripe listen --forward-to localhost:3002/api/payments/webhook
```

**Copy this:** `whsec_abc123xyz...`

---

### Step 5: Add Webhook Secret

1. Open `.env` file
2. Find: `STRIPE_WEBHOOK_SECRET=`
3. Change to: `STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...` (your actual secret)
4. Save file

---

### Step 6: Restart Server

Go back to Terminal 1:

- Press `Ctrl+C` to stop
- Run `pnpm run dev:backend` again

---

### Step 7: Test It!

**Terminal 3:**

```powershell
stripe trigger payment_intent.succeeded
```

**Check Terminal 2:** Should show event received ✅
**Check Terminal 1:** Should show "Stripe webhook received" ✅

---

## Visual Guide

### Your Terminal Setup:

```
┌─────────────────────────────────────┐
│ Terminal 1: Server                  │
│ $ pnpm run dev:backend              │
│ ✓ Server running on port 3002       │
│ [info]: Stripe webhook received...  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Terminal 2: Stripe Listener         │
│ $ stripe listen --forward-to...     │
│ > Ready! whsec_abc123...            │
│ → payment_intent.succeeded [200]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Terminal 3: Testing (Optional)      │
│ $ stripe trigger payment_intent...  │
└─────────────────────────────────────┘
```

---

## What Each File Does

### Your Code:

```javascript
// routes/payment.routes.js
// Defines: POST /api/payments/webhook

// controllers/payment.controller.js
// handleStripeWebhook() - Processes events

// services/payment.service.js
// Updates payment status in database
```

### Flow:

```
Stripe Event → Stripe CLI → /webhook → Controller → Service → Database
```

---

## Common Questions

### Q: Do I need to keep `stripe listen` running?

**A:** Yes, during development. In production, you don't need it.

### Q: What happens if I close the `stripe listen` terminal?

**A:** Webhooks won't reach your local server. Just restart it.

### Q: Can I test payments without webhooks?

**A:** Yes, but you'll have to manually verify payments. Webhooks automate this.

### Q: What's the webhook secret for?

**A:** Security! It proves the webhook is really from Stripe, not a hacker.

### Q: Do I need a different secret for production?

**A:** Yes! You'll get a production secret when you add the webhook in Stripe Dashboard.

---

## Quick Reference

### Install:

```bash
scoop install stripe
```

### Login (once):

```bash
stripe login
```

### Listen (keep running):

```bash
stripe listen --forward-to localhost:3002/api/payments/webhook
```

### Test (optional):

```bash
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
```

---

## Troubleshooting

### "stripe: command not found"

→ Stripe CLI not installed. Run installation steps.

### "Connection refused"

→ Server not running. Start with `pnpm run dev:backend`

### "Failed to verify signature"

→ Webhook secret not set or wrong. Check `.env` file.

### "Port 3002 already in use"

→ Another process using port 3002. Kill it or change port.

---

## Summary

1. **Webhooks = Notifications from Stripe**
2. **Stripe CLI = Forwards notifications to localhost**
3. **Webhook Secret = Password for security**
4. **stripe listen = Must run during development**
5. **Production = No CLI needed, use Stripe Dashboard**

---

## Ready to Start?

Follow these docs in order:

1. ✅ This file (you're here!)
2. 📖 `QUICK_START_STRIPE.md` - Step-by-step setup
3. 🔧 `STRIPE_WEBHOOK_SETUP.md` - Detailed technical guide
4. 🧪 `TESTING_GUIDE.md` - Testing your implementation
5. 📚 `PAYMENT_README.md` - Complete API documentation

**Good luck! 🚀**
