# Checklist de Produccion - Teleconsulta IPS

## Seguridad
- [ ] Cambiar JWT_SECRET y JWT_REFRESH_SECRET por valores seguros (min 64 caracteres aleatorios)
- [ ] Configurar HTTPS/TLS (certificado SSL)
- [ ] Configurar CORS con dominio de produccion exacto
- [ ] Revisar rate limiting para produccion
- [ ] Configurar Content Security Policy (CSP) en Helmet
- [ ] Deshabilitar morgan en produccion o usar formato 'combined'
- [ ] Asegurar que .env NO se suba al repositorio (.gitignore)

## Base de Datos
- [ ] Crear usuario MySQL dedicado (no usar root)
- [ ] Configurar password fuerte para MySQL
- [ ] Habilitar SSL para conexion MySQL si es remota
- [ ] Configurar backups automaticos
- [ ] Revisar indices de tablas para rendimiento

## Email (SMTP)
- [ ] Configurar credenciales SMTP reales
- [ ] Verificar dominio del remitente (SPF, DKIM, DMARC)
- [ ] Probar envio de emails en produccion

## Infraestructura
- [ ] Configurar proceso con PM2 o similar (no usar node --watch)
- [ ] Configurar proxy reverso (Nginx/Apache)
- [ ] Configurar build de produccion del frontend: npm run build
- [ ] Servir frontend como archivos estaticos desde Nginx
- [ ] Configurar logs persistentes
- [ ] Configurar monitoreo (uptime, errores)

## WebRTC
- [ ] Configurar servidor TURN para NAT traversal en produccion
- [ ] Evaluar servidores STUN propios o de pago
- [ ] Probar conectividad desde diferentes redes

## Datos
- [ ] Cambiar password del usuario admin por defecto
- [ ] Eliminar datos de seed/ejemplo
- [ ] Configurar politica de retencion de audit_logs

## Cumplimiento (Colombia)
- [ ] Revisar Ley 1581 de 2012 (Proteccion de Datos Personales)
- [ ] Implementar aviso de privacidad
- [ ] Revisar Resolucion 2654 de 2019 (Telemedicina)
- [ ] Documentar consentimiento informado del paciente
- [ ] Configurar retencion de datos segun normativa

## Comandos de Despliegue
```bash
# Backend
cd backend
npm install --production
node migrations/run.js
node seeds/seed.js  # Solo primera vez
NODE_ENV=production node src/app.js

# Frontend
cd frontend
npm install
npm run build
# Servir carpeta dist/ con Nginx
```
