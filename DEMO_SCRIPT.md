# Demo Script — Copy-Paste Ready Commands

## Setup (before demo starts)
```powershell
docker compose up -d
node src/index.js
```
In a second terminal:
```powershell
cd test-site
python -m http.server 5500
```

## 1. Login and get token
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
$token = $response.token
```

## 2. Create a widget (show embed snippet)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/widgets" -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"type":"signup-form","title":"Demo Widget","description":"Live demo","fields":[{"name":"email","label":"Email","type":"email","required":true}],"buttonText":"Subscribe"}'
```

## 3. Open test site in browser
```
http://localhost:5500
```
(Show the widget rendering on a different origin — port 5500 vs 3000)

## 4. Submit the form in the browser
(Fill email, click Subscribe — show "Thank you" message)

## 5. Show dashboard
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/submissions" -Method Get -Headers @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/stats" -Method Get -Headers @{Authorization="Bearer $token"}
```

## 6. Attack yourself — invalid payload
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/submissions" -Method Post -ContentType "application/json" -Body '{"widgetId":1}'
```
Expect: 400 error

## 7. Attack yourself — rate limit burst
Run this 6 times quickly:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/submissions" -Method Post -ContentType "application/json" -Body '{"widgetId":1,"data":{"email":"burst@example.com"}}'
```
Expect: first 5 succeed, 6th returns 429

## 8. Kill geo provider A live
Stop the server (Ctrl+C), restart with:
```powershell
$env:FORCE_FAIL_GEO_A="true"; node src/index.js
```
Then submit with a real IP:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/submissions" -Method Post -ContentType "application/json" -Headers @{"X-Forwarded-For"="8.8.8.8"} -Body '{"widgetId":1,"data":{"email":"geodemo@example.com"}}'
```
Point to server log: "Geo provider A failed, trying provider B"

## 9. Break the email side effect
Stop the server (Ctrl+C), restart with:
```powershell
$env:FORCE_FAIL_EMAIL="true"; node src/index.js
```
Submit again — show it still returns success:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/submissions" -Method Post -ContentType "application/json" -Body '{"widgetId":1,"data":{"email":"emaildemo@example.com"}}'
```
Say: **"Non-critical failures never break the main path."**

## 10. Close on the dashboard
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/stats" -Method Get -Headers @{Authorization="Bearer $token"}
```

## Cleanup after demo (restart normal)
```powershell
node src/index.js
```
(without FORCE_FAIL flags)