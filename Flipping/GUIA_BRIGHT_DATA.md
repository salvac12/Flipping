# 🌐 Guía Completa: Configurar Bright Data para Scraping de Idealista

## 📋 Resumen

Bright Data proporciona proxies residenciales que te permiten bypasear DataDome y hacer scraping sin bloqueos.

**Beneficios:**
- ✅ $5 de crédito gratis (sin tarjeta)
- ✅ IPs residenciales reales de España
- ✅ Rotación automática de IPs
- ✅ Sin bloqueos de DataDome

---

## 🚀 Paso 1: Registrarte en Bright Data

### 1.1 Crear Cuenta

1. Ve a: https://brightdata.com/
2. Click en **"Start free trial"**
3. Regístrate con:
   - Email
   - Google
   - GitHub
4. Completa tu perfil básico
5. **Recibirás $5 de crédito automáticamente**

### 1.2 Verificar Crédito

1. Ve a tu dashboard
2. Busca "Balance" o "Credits"
3. Deberías ver: **$5.00 USD**

---

## 🔧 Paso 2: Crear Zona de Proxy Residencial

### 2.1 Acceder a Proxies

1. En el dashboard, ve a:
   ```
   Proxies & Scraping Infrastructure → Residential proxies
   ```

2. Click en **"Add zone"** o **"Create new zone"**

### 2.2 Configurar la Zona

Usa esta configuración exacta:

| Campo | Valor |
|-------|-------|
| **Zone name** | `idealista-scraper` |
| **Proxy type** | Residential |
| **Country** | Spain (ES) 🇪🇸 |
| **City** (opcional) | Madrid |
| **IP rotation** | Rotating (default) |

### 2.3 Guardar Configuración

Click en **"Save"** o **"Create zone"**

---

## 🔑 Paso 3: Obtener Credenciales

### 3.1 Ubicar Access Parameters

1. Click en la zona recién creada (`idealista-scraper`)
2. Busca la sección **"Access parameters"**
3. Verás algo como esto:

```
Host: brd.superproxy.io
Port: 22225
Username: brd-customer-hl_XXXXXX-zone-idealista-scraper
Password: XXXXXXXXXXXXXXXX
```

### 3.2 Copiar Credenciales

**IMPORTANTE**: Copia exactamente estos valores:

- **Host + Port** → `http://brd.superproxy.io:22225`
- **Username** → `brd-customer-hl_XXXXX-zone-idealista-scraper`
- **Password** → `XXXXXXXX`

---

## ⚙️ Paso 4: Configurar el Proyecto

### 4.1 Editar .env

Abre tu archivo `.env` y añade estas líneas:

```bash
# Bright Data Proxy
PROXY_SERVER=http://brd.superproxy.io:22225
PROXY_USERNAME=brd-customer-hl_XXXXX-zone-idealista-scraper
PROXY_PASSWORD=XXXXXXXX
```

**Reemplaza** los valores con tus credenciales reales.

### 4.2 Verificar .env

Tu `.env` completo debería verse así:

```bash
# Database
DATABASE_URL="your-database-connection-string"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk..."

# Bright Data Proxy (NUEVO)
PROXY_SERVER=http://brd.superproxy.io:22225
PROXY_USERNAME=brd-customer-hl_XXXXXX-zone-idealista-scraper
PROXY_PASSWORD=XXXXXXXXXXXXXXXX

# Cron Secret
CRON_SECRET="dev-cron-secret"
```

---

## 🧪 Paso 5: Probar el Proxy

### 5.1 Ejecutar Test de Conexión

```bash
npx tsx test-proxy.ts
```

### 5.2 Salida Esperada

Deberías ver algo como:

```
🧪 Probando conexión con proxy de Bright Data...

✅ Variables de proxy encontradas:
   Server: http://brd.superproxy.io:22225
   Username: brd-customer-hl_abc12345-zone-idealista-scraper
   Password: ****************

🚀 Lanzando navegador con proxy...

📍 Test 1: Verificando IP pública...
   ✅ Tu IP a través del proxy: 185.123.45.67

🌍 Test 2: Verificando geolocalización...
   ✅ País: Spain
   ✅ Ciudad: Madrid
   ✅ ISP: Telefonica

🏠 Test 3: Accediendo a Idealista...
   📄 Título de página: idealista - Compra, venta y alquiler
   ✅ Acceso exitoso a Idealista!
   ✅ DataDome NO bloqueó la conexión
   ✅ Propiedades cargadas correctamente

✅ Prueba de proxy completada exitosamente!
```

---

## 🏃‍♂️ Paso 6: Ejecutar el Scraper con Proxy

### 6.1 Scraper de Prueba

```bash
npx tsx test-scraper-guindalera.ts
```

### 6.2 Verificar en la Salida

Deberías ver esta línea al inicio:

```
🌐 Usando proxy: http://brd.superproxy.io:22225
```

### 6.3 Salida Exitosa

```
🚀 Iniciando scraping de Idealista - Zona: GUINDALERA

💻 Idealista: Usando Playwright-extra + stealth local...
  🌐 Usando proxy: http://brd.superproxy.io:22225
  🎭 User-Agent: Mozilla/5.0...

Scrapeando Idealista - Zona: GUINDALERA
  🌐 Paso 1: Navegando primero a Google...
  📡 Paso 2: Navegando a Idealista desde Google...
  ⏱️  Paso 3: Esperando carga completa...
  📜 Paso 4: Simulando scrolling humano...
  📄 Título de página: Casas y pisos en Madrid — idealista

  Encontradas 30 cards, procesando 10
  ✅ 1/10: Piso en Calle del Carril... - 1335000€ - 157m²
  ✅ 2/10: Chalet pareado en Aravaca... - 1350000€ - 250m²
  ...

✅ Scraping completado: 5 propiedades encontradas
```

---

## 📊 Paso 7: Monitorear Consumo

### 7.1 Ver Créditos Restantes

1. Ve al dashboard de Bright Data
2. Busca "Balance" o "Usage"
3. Verás cuánto has consumido

### 7.2 Consumo Estimado

| Actividad | Consumo Aproximado |
|-----------|-------------------|
| 1 scraping completo | ~5-10 MB |
| 10 scrapings | ~50-100 MB |
| 1 mes (diario) | ~300-600 MB |

**Con $5 de crédito ($8.40/GB):**
- Puedes hacer aproximadamente **600 MB** de scraping
- Eso es **~60-120 ejecuciones**
- O **2-4 semanas de scraping diario**

---

## ⚠️ Solución de Problemas

### Problema 1: "ERR_PROXY_CONNECTION_FAILED"

**Causas:**
- Credenciales incorrectas
- Proxy server mal configurado
- Créditos agotados

**Solución:**
1. Verifica que copiaste las credenciales exactamente
2. Revisa que el formato del PROXY_SERVER sea: `http://brd.superproxy.io:22225`
3. Verifica tu balance en Bright Data

### Problema 2: "DataDome bloqueó la conexión"

**Causas:**
- Primera conexión (normal)
- Demasiadas peticiones rápidas

**Solución:**
1. Espera 1-2 minutos
2. Vuelve a intentar
3. Si persiste, cambia la configuración de rotación de IP

### Problema 3: IP no es de España

**Causas:**
- País mal configurado en la zona

**Solución:**
1. Ve a tu zona en Bright Data
2. Edita la configuración
3. Asegúrate de seleccionar "Country: Spain"
4. Guarda cambios

---

## 💡 Tips y Mejores Prácticas

### 1. Optimizar Consumo

- ✅ Scrapea una vez al día (suficiente para datos actualizados)
- ✅ Limita a 10-20 propiedades por ejecución
- ✅ Usa filtros para evitar propiedades irrelevantes

### 2. Configuración Óptima de Bright Data

```
Zone Settings:
├─ IP rotation: Per request (cada petición nueva IP)
├─ Session duration: Short (1-5 min)
├─ Country: Spain
└─ City: Madrid (opcional, más caro pero mejor)
```

### 3. Monitoreo

- Revisa tu consumo diariamente
- Configura alertas en Bright Data cuando llegues a $3 restantes
- Ten un plan B (esperar sin proxy) si se agotan créditos

---

## 🎯 Próximos Pasos

Una vez que el proxy funcione correctamente:

1. **Configurar cron job** en Vercel para scraping automático diario
2. **Ampliar a más zonas** de Madrid (Delicias, Pacífico, etc.)
3. **Activar otros portales** (Fotocasa, Pisos.com)
4. **Monitorear ROI** del servicio de proxy vs valor de datos

---

## 📞 Soporte

**Bright Data:**
- Dashboard: https://brightdata.com/cp
- Docs: https://docs.brightdata.com/
- Support: support@brightdata.com

**Proyecto:**
- Issues: GitHub issues del proyecto
- Documentación: Ver README.md principal

---

## ✅ Checklist Final

Antes de usar en producción, verifica:

- [ ] Cuenta de Bright Data creada
- [ ] $5 de crédito disponible
- [ ] Zona `idealista-scraper` configurada con Spain/Madrid
- [ ] Variables en `.env` correctas
- [ ] Test de proxy exitoso (`npx tsx test-proxy.ts`)
- [ ] Scraper funcionando con proxy
- [ ] No hay bloqueos de DataDome
- [ ] Consumo monitoreado

---

**¡Listo para scrapear sin bloqueos!** 🚀
