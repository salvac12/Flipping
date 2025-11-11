# 🔍 Hallazgos de Análisis: Idealista Anti-Scraping

**Fecha:** 2025-11-07
**Objetivo:** Identificar método para bypasear DataDome en Idealista

---

## 📋 Resumen Ejecutivo

✅ **SOLUCIÓN ENCONTRADA:** Extraer datos embebidos del DOM + window objects
⚡ **Bypasea DataDome:** SÍ - No requiere llamadas API externas
💰 **Costo:** GRATIS - Solo requiere Playwright
🚀 **Complejidad:** BAJA - Reutiliza código existente con mejoras

---

## 🛡️ Protecciones Identificadas

### DataDome Activo

```
Cookie: datadome=W2HByKertImXP8mTffhNw6epA24UVp5SENr8cqslHjudJKv3l~6WZBVvYxr4...
POST https://dd.idealista.com/js/
POST https://geo.captcha-delivery.com/interstitial/
```

**Impacto:**
- Bloquea llamadas API directas sin cookies válidas
- Detecta navegadores automatizados sin stealth
- Challenge JavaScript para validar navegador real

---

## ✨ Datos Embebidos Encontrados

### 1. window.utag_data (8,753 caracteres)

**Ubicación:** `<script>` inline en el HTML

**Contenido Clave:**
```javascript
{
  "list_ads_adId": [
    "109618864", "106702840", "109542443", // ...30 IDs total
  ],
  "list_totalResult": "14394",
  "list_currentPageNumber": "1",
  "list_totalPageNumber": "480",
  "list_ads_owner_type": ["2", "2", "2", ...],  // 2 = Agencia
  "search_geo_locationId": ["0-EU-ES-28-07-001-079"],  // Madrid
  ...
}
```

**Utilidad:**
- ✅ IDs de propiedades de la página actual
- ✅ Total de resultados y número de páginas
- ✅ Metadata de búsqueda
- ❌ No contiene precio/m2/dirección

### 2. DOM Estructurado (.item-info-container)

**Selector principal:** `.item-info-container`

**Estructura por propiedad:**
```html
<div class="item-info-container">
  <!-- Precio -->
  <span class="item-price h2-simulated">
    590.000<span class="txt-big">€</span>
  </span>

  <!-- Detalles -->
  <div class="item-detail-char">
    <span class="item-detail">2 hab.</span>
    <span class="item-detail">78 m²</span>
    <span class="item-detail">Planta 2ª exterior con ascensor</span>
  </div>

  <!-- Descripción -->
  <div class="item-description description">
    <p class="ellipsis">GILMAR Consulting Inmobiliario pone...</p>
  </div>

  <!-- URL (en link parent) -->
  <a class="item-link" href="/inmueble/109618864/"></a>
</div>
```

**Datos Extraíbles:**
- ✅ Precio
- ✅ Habitaciones
- ✅ Superficie (m²)
- ✅ Planta
- ✅ Exterior/Interior
- ✅ Ascensor
- ✅ Descripción
- ✅ URL completa con ID

---

## 🎯 Estrategia Recomendada

### Método: DOM Scraping + Playwright Stealth

**Ventajas:**
1. ✅ **Bypasea DataDome** - No hace llamadas API bloqueables
2. ✅ **Gratis** - No requiere servicios externos
3. ✅ **Rápido** - 30 propiedades por carga de página
4. ✅ **Confiable** - Datos ya están en el HTML

**Desventajas:**
1. ⚠️ Requiere navegador (más lento que APIs)
2. ⚠️ Puede ser detectado si es muy agresivo
3. ⚠️ Selectores pueden cambiar (bajo riesgo)

### Implementación

```typescript
// PASO 1: Cargar página con Playwright + Stealth
const page = await browser.newPage();
await page.goto('https://www.idealista.com/venta-viviendas/madrid-madrid/');

// PASO 2: Extraer IDs de window.utag_data
const propertyIds = await page.evaluate(() => {
  return window.utag_data?.list_ads_adId || [];
});

// PASO 3: Extraer datos del DOM
const properties = await page.$$eval('.item-info-container', (cards) => {
  return cards.map(card => {
    const price = card.querySelector('.item-price')?.textContent;
    const details = card.querySelectorAll('.item-detail');
    const url = card.querySelector('.item-link')?.href;

    return {
      price: parsePrice(price),
      rooms: parseInt(details[0]?.textContent),
      m2: parseInt(details[1]?.textContent),
      floor: parseFloor(details[2]?.textContent),
      url: url
    };
  });
});

// PASO 4: Combinar IDs con datos
const enrichedProperties = properties.map((prop, i) => ({
  ...prop,
  id: propertyIds[i]
}));
```

---

## 📊 Comparativa de Métodos

| Método | Bypasea DataDome | Costo | Velocidad | Confiabilidad |
|--------|------------------|-------|-----------|---------------|
| **APIs Internas** | ❌ NO | Gratis | ⚡ Rápido | ❌ Bloqueado |
| **DOM Scraping** (Recomendado) | ✅ SÍ | Gratis | 🐢 Medio | ✅ Alta |
| **ScraperAPI** | ✅ SÍ | ~$50/mes | ⚡ Rápido | ✅ Alta |
| **Browserless Unblock** | ✅ SÍ | ~$30/mes | ⚡ Rápido | ✅ Alta |
| **Proxies Residenciales** | 🟡 Parcial | ~$100/mes | 🐢 Lento | 🟡 Media |

---

## 🚀 Próximos Pasos

### Prioridad ALTA (Implementar primero)

1. **Mejorar scraper actual** (`idealista-scraper.ts`)
   - Ya usa Playwright + stealth ✅
   - Ya extrae datos del DOM ✅
   - Mejorar: Añadir extracción de `window.utag_data` para IDs
   - Mejorar: Gestión de cookies persistentes

2. **Optimizar comportamiento anti-detección**
   - Delays más largos (actual: 2-4s → sugerido: 3-7s)
   - Movimiento de mouse aleatorio
   - Scrolling más natural
   - Cookies persistentes entre ejecuciones

### Prioridad MEDIA (Si lo anterior no funciona)

3. **Implementar proxies residenciales**
   - Soportar `PROXY_URL` de .env
   - Rotación de IPs por request

4. **Integrar captcha solvers**
   - Detectar cuando DataDome muestra captcha
   - Enviar a 2Captcha/CapSolver si disponible

### Prioridad BAJA (Fallback)

5. **Activar servicios pagos**
   - ScraperAPI (ya integrado)
   - Browserless Unblock (ya integrado)

---

## 💡 Recomendaciones Técnicas

### Para Desarrollo Local

```bash
# El scraper actual ya debería funcionar
npx tsx lib/scraper/idealista-scraper.ts

# Si falla, verificar:
# 1. Playwright instalado: npx playwright install
# 2. Stealth plugin activo: playwright-extra + puppeteer-extra-plugin-stealth
# 3. Delays suficientes: randomDelay(2000, 4000)
```

### Para Producción (Vercel)

```typescript
// Usar @sparticuz/chromium (ya implementado)
import chromiumPkg from '@sparticuz/chromium';

const browser = await chromium.launch({
  executablePath: await chromiumPkg.executablePath(),
  args: chromiumPkg.args
});
```

### Rate Limiting Recomendado

```typescript
// CONSERVADOR (recomendado para producción)
- 1 request cada 5-10 segundos
- Máximo 10 propiedades por ejecución
- Ejecutar cron job cada 12 horas

// AGRESIVO (solo para testing local)
- 1 request cada 2-3 segundos
- Máximo 30 propiedades por ejecución
- Usar con precaución (puede causar ban)
```

---

## 🔐 Consideraciones Legales

⚠️ **IMPORTANTE:**
- Scraping puede violar los Términos de Servicio de Idealista
- Solo para uso personal/educativo
- Implementar rate limiting respetuoso
- No sobrecargar servidores de Idealista
- Considerar contactar Idealista para acceso API oficial

---

## 📁 Archivos Generados

- `idealista-api-analysis.json` - Análisis completo de requests de red
- `idealista-api-analysis.md` - Reporte legible de APIs
- `idealista-html-analysis.json` - Análisis de datos embebidos
- `idealista-page.html` - HTML completo de la página (761KB)
- `idealista-property-sample.html` - Muestra de 3 propiedades
- `IDEALISTA_FINDINGS.md` - Este documento

---

## ✅ Conclusión

**La solución óptima es:**

1. Continuar usando Playwright + Stealth (ya implementado)
2. Extraer datos del DOM (ya implementado)
3. Añadir extracción de `window.utag_data` para enriquecer metadata
4. Implementar cookies persistentes (nueva funcionalidad)
5. Mejorar comportamiento humano (delays, mouse movement)

**No necesitamos:**
- APIs internas (bloqueadas por DataDome)
- Servicios pagos externos (ScraperAPI/Browserless) por ahora
- Proxies residenciales por ahora

**Resultado esperado:**
- Bypass exitoso de DataDome
- Extracción de 10-30 propiedades por ejecución
- Sin costos adicionales
- Compatible con Vercel
