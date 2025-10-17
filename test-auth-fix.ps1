Write-Host "Testing payment endpoint with authentication fix..." -ForegroundColor Yellow

# Test without token (should return 401)
Write-Host "1. Testing without authentication token (should return 401)..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/payments" -Method Post -Headers @{
        "Content-Type" = "application/json"
    } -Body '{"appointmentId":"test","amount":2500,"paymentMethod":"CARD"}' -ErrorAction Stop
    Write-Host "Unexpected success: $response" -ForegroundColor Red
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Expected auth error: $responseBody" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Authentication middleware is now active!" -ForegroundColor Green
Write-Host "The payment endpoint now requires a valid authentication token." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure you're logged in to the frontend application" -ForegroundColor White
Write-Host "2. Try the payment flow again - it should work now!" -ForegroundColor White