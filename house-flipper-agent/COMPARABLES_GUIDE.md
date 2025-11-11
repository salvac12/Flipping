# 🔍 Guía Completa para Obtener Comparables

## Resumen Ejecutivo

Para que el sistema de estimación de precios sea preciso, necesitas **50-100 propiedades vendidas por zona**. Aquí están todas las opciones ordenadas por efectividad:

---

## 📊 OPCIÓN 1: Idealista Data API (RECOMENDADA) ⭐⭐⭐⭐⭐

### ✅ Ventajas
- **Datos oficiales y 100% fiables**
- Histórico de ventas reales
- Información completa (precio venta, características, fechas)
- Legal, sin riesgo de bloqueo
- Actualizaciones automáticas

### 💰 Coste
**~50-80€/mes** según plan

### 📞 Cómo Obtenerlo

1. **Contactar a Idealista Data:**
   - Web: https://www.idealista.com/info/idealista-data
   - Email: data@idealista.com
   - Teléfono: +34 911 23 25 25

2. **Pedir específicamente:**
   - "API de ventas históricas para Madrid"
   - "Datos de propiedades vendidas en los últimos 12 meses"
   - Zonas: Guindalera, Delicias, Pacífico, Prosperidad, Retiro, Argüelles

3. **Documentación:**
   - Te enviarán credenciales (API Key + Secret)
   - Documentación de endpoints
   - Ejemplos de uso

### 📥 Datos que Proporciona

```json
{
  "propertyCode": "12345678",
  "address": "Calle Francisco Silvela, 82",
  "latitude": 40.4335,
  "longitude": -3.6625,
  "price": 495000,
  "priceByArea": 4500,
  "size": 110,
  "rooms": 3,
  "bathrooms": 2,
  "floor": 4,
  "exterior": true,
  "hasLift": true,
  "buildYear": 1975,
  "status": "sold",
  "saleDate": "2024-10-20",
  "listingDate": "2024-08-15",
  "daysOnMarket": 66,
  "detailedType": {
    "typology": "flat",
    "subTypology": "reformed"
  }
}
```

### 💻 Implementación

Ya tienes la función lista en `lib/scraper/sold-properties-scraper.ts`:

```typescript
import { fetchFromIdealistaDataAPI } from '@/lib/scraper/sold-properties-scraper';

// Ejecutar una vez obtengas la API key
const apiKey = 'TU_API_KEY_AQUI';
const properties = await fetchFromIdealistaDataAPI('guindalera', apiKey);
```

---

## 🌐 OPCIÓN 2: Web Scraping de Idealista ⭐⭐⭐

### ✅ Ventajas
- Gratis (si usas tu propia infraestructura)
- Flexibilidad total

### ❌ Desventajas
- **Requiere cuenta premium de Idealista (~50€/mes)** para ver "vendidos"
- Riesgo de bloqueo IP
- Datos menos completos que API
- Mantenimiento (si cambian HTML)

### 💰 Coste
- **Opción A:** Cuenta premium Idealista (50€/mes) + ScraperAPI (40€/mes) = **90€/mes**
- **Opción B:** Solo infraestructura propia = **0€** (más trabajo)

### 🔗 URLs de Interés

```
// Propiedades vendidas por zona
https://www.idealista.com/venta-viviendas/madrid-madrid/guindalera/con-vendidos/
https://www.idealista.com/venta-viviendas/madrid-madrid/delicias/con-vendidos/
https://www.idealista.com/venta-viviendas/madrid-madrid/pacifico/con-vendidos/
```

### 💻 Implementación

```bash
# Instalar dependencias
npm install playwright cheerio

# Ejecutar scraper
npx tsx scripts/scrape-sold-properties.ts
```

**Script de ejemplo:**

```typescript
import { scrapeIdealistaSoldProperties, saveSoldProperties } from '@/lib/scraper/sold-properties-scraper';

async function main() {
  // Scraping de 3 páginas por zona
  const zones = ['guindalera', 'delicias', 'pacifico', 'prosperidad', 'retiro', 'arguelles'];

  for (const zone of zones) {
    const properties = await scrapeIdealistaSoldProperties(zone, 3);
    await saveSoldProperties(properties);

    console.log(`✅ ${zone}: ${properties.length} propiedades`);

    // Delay entre zonas (evitar bloqueo)
    await new Promise(r => setTimeout(r, 5000));
  }
}

main();
```

### ⚠️ IMPORTANTE: Limitaciones del Scraping

**Idealista bloquea el acceso a "vendidos" sin cuenta premium.** Opciones:

1. **Obtener cookies de sesión premium:**
   ```typescript
   await page.context().addCookies([
     { name: 'session', value: 'TU_SESSION_COOKIE', domain: '.idealista.com' }
   ]);
   ```

2. **Usar ScraperAPI con rotación de IPs:**
   ```typescript
   const response = await fetch(`http://api.scraperapi.com?api_key=YOUR_KEY&url=${encodedUrl}`);
   ```

---

## 🏢 OPCIÓN 3: Fuentes Institucionales (GRATIS) ⭐⭐

### A) Catastro

**URL:** https://www.sedecatastro.gob.es/

**Datos disponibles:**
- Valor de referencia catastral
- Superficie, año construcción
- Fecha última transmisión (pero NO precio)

**API:**
```bash
curl "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC"
```

**Utilidad:** Complementar datos (superficie, año) pero NO proporciona precio de venta.

---

### B) Registradores de la Propiedad

**URL:** https://www.registradores.org/

**Datos:**
- Estadísticas agregadas de precios por zona
- Número de transacciones
- Evolución temporal

**API:**
```
https://www.registradores.org/documents/estadisticas-registrales
```

**Utilidad:** Validar tendencias generales, NO datos individuales.

---

## 🌍 OPCIÓN 4: APIs de Terceros ⭐⭐⭐⭐

### A) Bright Data (Datos de Inmobiliarias)

**Coste:** Desde 70€/mes

**URL:** https://brightdata.com/products/web-scraper/real-estate

**Ventajas:**
- Datos de múltiples portales (Idealista, Fotocasa, Pisos.com)
- Scraping gestionado (no te preocupas por bloqueos)
- Datos históricos disponibles

---

### B) Scrapfly (Alternativa)

**Coste:** Desde 40€/mes

**URL:** https://scrapfly.io/

**Ventajas:**
- Más barato que Bright Data
- Anti-bot evasion incluido

---

## 📋 OPCIÓN 5: Combinación Óptima (RECOMENDADA) 💎

Para tu presupuesto de **100€/mes**, te recomiendo:

### Plan A: Máxima Calidad
```
Idealista Data API (60€) + Catastro (gratis) + Registradores (gratis) = 60€/mes
```

### Plan B: Balance Precio/Calidad
```
Bright Data (70€) + APIs gratuitas = 70€/mes
```

### Plan C: Máximo Ahorro
```
ScraperAPI (40€) + Cuenta premium Idealista (50€) + trabajo manual = 90€/mes
```

---

## 🚀 Plan de Acción Recomendado

### Semana 1: Setup Inicial
1. ✅ **Contactar Idealista Data** (espera respuesta 2-3 días)
2. ✅ Mientras tanto, usar scraper con datos de prueba
3. ✅ Configurar base de datos

### Semana 2: Carga Inicial
1. ✅ Recibir API key de Idealista Data
2. ✅ Ejecutar script de carga masiva
3. ✅ Objetivo: **50 comparables por zona** (300 total)

### Semana 3: Validación
1. ✅ Probar estimaciones con datos reales
2. ✅ Calcular error vs precios de mercado
3. ✅ Ajustar algoritmo si necesario

### Semana 4: Automatización
1. ✅ Cronjob semanal para actualizar comparables
2. ✅ Alertas si hay comparables nuevos
3. ✅ Dashboard de métricas

---

## 📊 Script de Ejecución Rápida

He creado un script listo para usar:

```bash
# 1. Configurar API key (cuando la obtengas)
export IDEALISTA_API_KEY="your_key_here"

# 2. Cargar comparables desde API
npm run scrape:sold-api

# O desde web scraping (requiere cuenta premium)
npm run scrape:sold-web

# 3. Ver estadísticas
npm run stats:comparables
```

---

## 🎯 Resumen: ¿Qué Hacer AHORA?

### Acción Inmediata (HOY):
1. **Enviar email a data@idealista.com** pidiendo presupuesto
2. Mientras tanto, usar los **14 comparables de ejemplo** que ya tienes
3. Probar el sistema con: `curl http://localhost:3001/api/pricing/estimate`

### Próximos 7 días:
1. Recibir respuesta de Idealista Data
2. Decidir entre API oficial (60€) o scraping (90€)
3. Implementar solución elegida

### Meta a 30 días:
- ✅ **300 comparables** en BD (50 por zona)
- ✅ Sistema funcionando con **<7% error**
- ✅ Actualizaciones automáticas semanales

---

## 💡 Consejo Profesional

**La mejor inversión es Idealista Data API oficial** porque:

1. ✅ Datos 100% fiables (precio de venta REAL)
2. ✅ Sin riesgo de bloqueo
3. ✅ Sin mantenimiento de scrapers
4. ✅ Actualizaciones automáticas
5. ✅ Legal y ético

Con 60€/mes en Idealista Data API + 40€ sobrantes para otras herramientas (geocoding, etc.), tendrás el mejor sistema posible.

---

## 📞 Contactos Útiles

- **Idealista Data:** data@idealista.com | +34 911 23 25 25
- **Bright Data:** https://brightdata.com/contact-sales
- **ScraperAPI:** https://www.scraperapi.com/pricing/

---

¿Necesitas ayuda para implementar alguna de estas opciones? Dime cuál prefieres y te ayudo a configurarla.
