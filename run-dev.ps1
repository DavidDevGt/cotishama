# Script para levantar y manejar el proyecto Cotishama
# Uso: .\run-dev.ps1 [start|stop|restart]

# Función para mostrar uso
function Show-Usage {
    Write-Host "Uso: .\run-dev.ps1 [start|stop|restart]" -ForegroundColor Yellow
    Write-Host "  start  - Levanta tanto el backend como el frontend" -ForegroundColor Green
    Write-Host "  stop   - Detiene todos los procesos relacionados" -ForegroundColor Red
    Write-Host "  restart - Reinicia ambos servicios" -ForegroundColor Cyan
}

# Función para levantar el backend
function Start-Backend {
    Write-Host "Levantando backend (API)..." -ForegroundColor Green
    # Cambiar al directorio de la API y ejecutar en modo desarrollo
    Start-Process bun -ArgumentList "run", "src/index.ts" -WorkingDirectory "apps/api" -WindowStyle Hidden
    Write-Host "Backend levantado en http://localhost:3001" -ForegroundColor Green
}

# Función para levantar el frontend
function Start-Frontend {
    Write-Host "Levantando frontend (Next.js)..." -ForegroundColor Green
    # Cambiar al directorio del web y ejecutar en modo desarrollo
    Start-Process bun -ArgumentList "run", "dev" -WorkingDirectory "apps/web" -WindowStyle Hidden
    Write-Host "Frontend levantado en http://localhost:3000" -ForegroundColor Green
}

# Función para detener procesos de bun relacionados
function Stop-Processes {
    Write-Host "Deteniendo procesos de Bun..." -ForegroundColor Red
    # Detener procesos de bun que estén ejecutando nuestros scripts
    Get-Process bun -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*bun*" -and 
        ($_.MainWindowTitle -like "*dev*" -or $_.MainWindowTitle -like "*index.ts*" -or $_.MainWindowTitle -like "*next*")
    } | ForEach-Object {
        Write-Host "Deteniendo proceso ID: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force
    }
    
    # También buscar procesos de node por si acaso
    Get-Process node -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*node*" -and 
        ($_.MainWindowTitle -like "*next*" -or $_.CommandLine -like "*next dev*" -or $_.CommandLine -like "*src/index.ts*")
    } | ForEach-Object {
        Write-Host "Deteniendo proceso Node ID: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force
    }
    
    Write-Host "Todos los procesos detenidos." -ForegroundColor Red
}

# Lógica principal
switch ($args[0]) {
    "start" {
        Stop-Processes  # Limpiar cualquier proceso existente primero
        Start-Backend
        Start-Frontend
        Write-Host "`n¡Proyecto levantado exitosamente!" -ForegroundColor Green
        Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "`nPara detener: .\run-dev.ps1 stop" -ForegroundColor Yellow
    }
    "stop" {
        Stop-Processes
        Write-Host "`nProyecto detenido." -ForegroundColor Red
    }
    "restart" {
        Stop-Processes
        Start-Sleep -Seconds 2
        Start-Backend
        Start-Frontend
        Write-Host "`nProyecto reiniciado exitosamente!" -ForegroundColor Green
        Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    }
    default {
        Show-Usage
    }
}