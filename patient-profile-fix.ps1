Write-Host "✅ Fixed Patient profile lookup issue!" -ForegroundColor Green
Write-Host ""
Write-Host "The issue was in the payment service - it was looking for:" -ForegroundColor Yellow
Write-Host "  { user: userId }" -ForegroundColor Red
Write-Host ""
Write-Host "But the Patient model field is actually:" -ForegroundColor Yellow
Write-Host "  { userId: userId }" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Fixed the field name in payment.service.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now try the payment flow again!" -ForegroundColor Magenta
Write-Host "1. Make sure you're logged in as a patient" -ForegroundColor White
Write-Host "2. Select an appointment" -ForegroundColor White
Write-Host "3. Click 'Make Payment and Book Now'" -ForegroundColor White
Write-Host ""
Write-Host "The payment should now work correctly! 🎉" -ForegroundColor Green