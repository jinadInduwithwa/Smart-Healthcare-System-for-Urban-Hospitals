# Stripe Payment Setup Script
# This script helps you set up the Stripe payment system

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Stripe Payment Setup Helper  " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Stripe CLI is installed
Write-Host "Checking Stripe CLI installation..." -ForegroundColor Yellow
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue

if ($null -eq $stripeInstalled) {
    Write-Host "❌ Stripe CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Stripe CLI:" -ForegroundColor Yellow
    Write-Host "1. Install Scoop (if not installed):" -ForegroundColor White
    Write-Host "   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
    Write-Host "   irm get.scoop.sh | iex" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Install Stripe CLI:" -ForegroundColor White
    Write-Host "   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git" -ForegroundColor Gray
    Write-Host "   scoop install stripe" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit
} else {
    $version = stripe --version
    Write-Host "✅ Stripe CLI installed: $version" -ForegroundColor Green
}

Write-Host ""

# Check if user is logged in
Write-Host "Checking Stripe authentication..." -ForegroundColor Yellow
$loginCheck = stripe config --list 2>&1

if ($loginCheck -like "*not logged in*" -or $loginCheck -like "*no account*") {
    Write-Host "❌ Not logged in to Stripe" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login to Stripe:" -ForegroundColor Yellow
    Write-Host "   stripe login" -ForegroundColor Gray
    Write-Host ""
    Write-Host "This will open your browser for authentication." -ForegroundColor White
    Write-Host "After logging in, run this script again." -ForegroundColor Yellow
    exit
} else {
    Write-Host "✅ Stripe authentication configured" -ForegroundColor Green
}

Write-Host ""

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    $envContent = Get-Content $envPath -Raw
    
    # Check for Stripe secret key
    if ($envContent -match "STRIPE_SECRET_KEY=sk_test_") {
        Write-Host "✅ STRIPE_SECRET_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  STRIPE_SECRET_KEY not found or invalid" -ForegroundColor Yellow
    }
    
    # Check for webhook secret
    if ($envContent -match "STRIPE_WEBHOOK_SECRET=whsec_") {
        Write-Host "✅ STRIPE_WEBHOOK_SECRET configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  STRIPE_WEBHOOK_SECRET not configured (expected after running stripe listen)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Setup Instructions            " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "You need 2 terminals to run the payment system:" -ForegroundColor Yellow
Write-Host ""

Write-Host "Terminal 1 (Server):" -ForegroundColor Cyan
Write-Host "   cd '$PSScriptRoot'" -ForegroundColor Gray
Write-Host "   pnpm run dev:backend" -ForegroundColor White
Write-Host ""

Write-Host "Terminal 2 (Stripe Webhook Listener):" -ForegroundColor Cyan
Write-Host "   cd '$PSScriptRoot'" -ForegroundColor Gray
Write-Host "   stripe listen --forward-to localhost:3002/api/payments/webhook" -ForegroundColor White
Write-Host ""

Write-Host "After running Terminal 2:" -ForegroundColor Yellow
Write-Host "1. Copy the webhook secret (starts with whsec_)" -ForegroundColor White
Write-Host "2. Add it to .env file: STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor White
Write-Host "3. Restart the server in Terminal 1" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Test Commands                 " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "In Terminal 3 (Testing):" -ForegroundColor Cyan
Write-Host "   stripe trigger payment_intent.succeeded" -ForegroundColor White
Write-Host "   stripe trigger checkout.session.completed" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Test Cards                    " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Success: 4242 4242 4242 4242" -ForegroundColor Green
Write-Host "Decline: 4000 0000 0000 0002" -ForegroundColor Red
Write-Host "3D Secure: 4000 0027 6000 3184" -ForegroundColor Yellow
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Documentation                 " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 WEBHOOK_EXPLAINED.md - Simple explanation" -ForegroundColor White
Write-Host "🚀 QUICK_START_STRIPE.md - Quick start guide" -ForegroundColor White
Write-Host "🔧 STRIPE_WEBHOOK_SETUP.md - Detailed setup" -ForegroundColor White
Write-Host "🧪 TESTING_GUIDE.md - Testing guide" -ForegroundColor White
Write-Host "📚 PAYMENT_README.md - API documentation" -ForegroundColor White
Write-Host ""

Write-Host "Ready to start? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Great! Opening terminals..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting server in new window..." -ForegroundColor Cyan
    
    # Start server in new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'Starting backend server...' -ForegroundColor Cyan; pnpm run dev:backend"
    
    Start-Sleep -Seconds 2
    
    Write-Host "Starting Stripe listener in new window..." -ForegroundColor Cyan
    
    # Start Stripe listener in new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'Starting Stripe webhook listener...' -ForegroundColor Cyan; Write-Host 'IMPORTANT: Copy the webhook secret (whsec_...) and add to .env file!' -ForegroundColor Yellow; Write-Host ''; stripe listen --forward-to localhost:3002/api/payments/webhook"
    
    Write-Host ""
    Write-Host "✅ Terminals opened!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Wait for server to start (Terminal 1)" -ForegroundColor White
    Write-Host "2. Copy webhook secret from Terminal 2" -ForegroundColor White
    Write-Host "3. Add to .env: STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor White
    Write-Host "4. Restart server (Ctrl+C in Terminal 1, then pnpm run dev:backend)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "No problem! Run this script again when ready." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
