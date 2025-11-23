Write-Host "Testing payment endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/payments" -Method Get -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer test_token"
    } -ErrorAction Stop
    Write-Host "Success: $response" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}