# Payment Integration Test Script

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Payment Integration Test  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🧪 Testing Payment System Integration..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Server Health Check
Write-Host "1. Testing server health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/test" -Method Get
    if ($response.message -eq "Backend working fine") {
        Write-Host "   ✅ Server is running" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Server responded but message unexpected" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Server is not running on port 3002" -ForegroundColor Red
    Write-Host "   Please start the server with: pnpm run dev:backend" -ForegroundColor Yellow
    exit
}

# Test 2: Payment Routes Available
Write-Host "2. Testing payment routes..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/payments/summary/overview" -Method Get -Headers @{"Authorization"="Bearer test"} -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.ErrorDetails.Message -like "*Token is not valid*") {
        Write-Host "   ✅ Payment routes are loaded (auth required)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Payment routes not found" -ForegroundColor Red
        Write-Host "   Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 3: Environment Variables
Write-Host "3. Checking environment variables..." -ForegroundColor Cyan
$envPath = ".\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Check Stripe Secret Key
    if ($envContent -match "STRIPE_SECRET_KEY=sk_test_") {
        Write-Host "   ✅ STRIPE_SECRET_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ STRIPE_SECRET_KEY missing or invalid" -ForegroundColor Red
    }
    
    # Check Webhook Secret
    if ($envContent -match "STRIPE_WEBHOOK_SECRET=whsec_") {
        Write-Host "   ✅ STRIPE_WEBHOOK_SECRET configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ STRIPE_WEBHOOK_SECRET missing or invalid" -ForegroundColor Red
    }
    
    # Check Currency
    if ($envContent -match "STRIPE_CURRENCY=lkr") {
        Write-Host "   ✅ STRIPE_CURRENCY configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  STRIPE_CURRENCY not set (will default to USD)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
}

# Test 4: Check Stripe CLI
Write-Host "4. Checking Stripe CLI..." -ForegroundColor Cyan
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue
if ($stripeInstalled) {
    Write-Host "   ✅ Stripe CLI installed" -ForegroundColor Green
    
    # Check if webhook listener is running
    $webhookRunning = Get-Process | Where-Object { $_.ProcessName -eq "stripe" }
    if ($webhookRunning) {
        Write-Host "   ✅ Stripe CLI process detected" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Stripe CLI not running webhook listener" -ForegroundColor Yellow
        Write-Host "   Run: stripe listen --forward-to localhost:3002/api/payments/webhook" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Stripe CLI not installed" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "If all tests pass, your payment system is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Make sure Stripe webhook listener is running:" -ForegroundColor White
Write-Host "   stripe listen --forward-to localhost:3002/api/payments/webhook" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start your frontend:" -ForegroundColor White
Write-Host "   cd Client && pnpm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test the payment flow:" -ForegroundColor White
Write-Host "   - Navigate to: http://localhost:5173/patient/book" -ForegroundColor Gray
Write-Host "   - Book an appointment" -ForegroundColor Gray
Write-Host "   - Click 'Make Payment and Book Now'" -ForegroundColor Gray
Write-Host "   - Use test card: 4242 4242 4242 4242" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Test Cards:" -ForegroundColor Yellow
Write-Host "   Success: 4242 4242 4242 4242" -ForegroundColor Green
Write-Host "   Decline: 4000 0000 0000 0002" -ForegroundColor Red
Write-Host "   Exp: Any future date, CVC: Any 3 digits" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 What Should Happen:" -ForegroundColor Yellow
Write-Host "1. Payment modal opens" -ForegroundColor White
Write-Host "2. Redirects to Stripe Checkout" -ForegroundColor White
Write-Host "3. Enter card details" -ForegroundColor White
Write-Host "4. Stripe processes payment" -ForegroundColor White
Write-Host "5. Redirects back to /patient/payments" -ForegroundColor White
Write-Host "6. Shows success message" -ForegroundColor White
Write-Host "7. Payment status updates in database" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If Issues Occur:" -ForegroundColor Yellow
Write-Host "- Check server logs for errors" -ForegroundColor White
Write-Host "- Check Stripe webhook listener for events" -ForegroundColor White
Write-Host "- Verify webhook secret is correct" -ForegroundColor White
Write-Host "- Check browser network tab for API calls" -ForegroundColor White
Write-Host ""
Write-Host "Happy Testing! 🎉" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")