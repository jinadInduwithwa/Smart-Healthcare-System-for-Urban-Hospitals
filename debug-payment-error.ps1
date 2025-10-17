# Debug payment error script
Write-Host "🔍 Testing payment endpoint to find the 'Something went wrong' error..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Check if the payment endpoint is accessible
Write-Host "1. Testing payment endpoint accessibility..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/payments" -Method Get -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer invalid_token_for_testing"
    } -ErrorAction Stop
    Write-Host "✅ Endpoint is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 2: Test creating a payment with invalid data to see validation errors
Write-Host "2. Testing payment creation with invalid data..." -ForegroundColor Cyan
try {
    $body = @{
        appointmentId = "invalid_id"
        amount = "invalid_amount"
        paymentMethod = "invalid_method"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/payments" -Method Post -Body $body -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer invalid_token"
    } -ErrorAction Stop
    Write-Host "✅ Request went through: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Payment creation error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
        
        # Check if this contains "Something went wrong!"
        if ($responseBody -like "*Something went wrong*") {
            Write-Host "🎯 Found the 'Something went wrong!' error!" -ForegroundColor Magenta
        }
    }
}

Write-Host ""

# Test 3: Check server health
Write-Host "3. Testing server health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002" -Method Get -ErrorAction Stop
    Write-Host "✅ Server is responding: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Server health error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔍 Debug complete. Check the errors above to identify the issue." -ForegroundColor Yellow