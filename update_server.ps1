# Скрипт для автоматического обновления сервера

# Настройки
$ServerUser = "root"
$ServerHost = "45.150.10.220"
$LocalBackendPath = "C:\Users\Vladislav\Documents\GitHub\aist-messenger\aist-backend\server.js"
$RemotePath = "/root/aist-backend/server.js"

Write-Host "🚀 Загрузка server.js на сервер..." -ForegroundColor Green

# Загрузка файла
scp $LocalBackendPath "${ServerUser}@${ServerHost}:${RemotePath}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Файл успешно загружен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Теперь выполните следующие команды на сервере:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ssh root@45.150.10.220" -ForegroundColor Cyan
    Write-Host "cd ~/aist-backend" -ForegroundColor Cyan
    Write-Host "pkill -f 'node.*server.js'" -ForegroundColor Cyan
    Write-Host "nohup node server.js > backend.log 2>&1 &" -ForegroundColor Cyan
    Write-Host "echo \$! > backend.pid" -ForegroundColor Cyan
    Write-Host "tail -f backend.log" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✨ После этого проверьте:" -ForegroundColor Yellow
    Write-Host "curl http://localhost:3001/api/health" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "❌ Ошибка при загрузке файла!" -ForegroundColor Red
    exit 1
}
