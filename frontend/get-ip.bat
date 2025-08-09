@echo off
echo Finding your computer's IP address for network access...
echo.
echo Your network IP addresses:
powershell "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' -or ($_.IPAddress -like '172.*' -and [int]($_.IPAddress.Split('.')[1]) -ge 16 -and [int]($_.IPAddress.Split('.')[1]) -le 31)} | Select-Object IPAddress, InterfaceAlias"
echo.
echo Use one of the above IP addresses (usually starts with 192.168.x.x)
echo Update the .env.local file with: NEXT_PUBLIC_API_URL=http://YOUR_IP:5205/api
echo.
pause
