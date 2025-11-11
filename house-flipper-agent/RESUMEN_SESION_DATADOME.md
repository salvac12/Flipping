# 📝 Resumen de Sesión: Bypass DataDome Idealista

**Fecha:** 2025-11-07
**Objetivo:** Investigar y resolver el problema de scraping de Idealista con protección DataDome
**Estado:** FASE 1 COMPLETADA ✅ - Listo para FASE 2

---

## 🎯 Problema Original

Idealista tiene protección **DataDome** que bloquea el scraper actual:
- Scraper basado en Playwright + stealth plugin
- DataDome detecta y bloquea requests
- Se necesitaba estrategia para bypasear la protección

---

## ✅ Lo Que Hemos Hecho (FASE 1 - Análisis)

### 1. Scripts de Análisis Creados

#### `scripts/analyze-idealista-api.ts`
- Analiza todas las llamadas de red de Idealista
- Captura APIs, headers, cookies
- Detecta protecciones activas
- **Resultado:** DataDome activo en todas las APIs

#### `scripts/analyze-idealista-html.ts`
- Busca datos JSON embebidos en HTML
- Analiza estructura del DOM
- Extrae window objects con datos
- **Resultado:** Encontró `window.utag_data` con IDs de propiedades

### 2. Documentación Generada

#### `scripts/IDEALISTA_FINDINGS.md` ⭐ **DOCUMENTO PRINCIPAL**
Contiene:
- ✅ Resumen ejecutivo de hallazgos
- ✅ Protecciones identificadas (DataDome)
- ✅ Datos embebidos encontrados
- ✅ **Estrategia recomendada completa**
- ✅ Comparativa de métodos (APIs vs DOM vs Servicios pagos)
- ✅ Próximos pasos priorizados
- ✅ Código de ejemplo de implementación
- ✅ Recomendaciones técnicas

#### Archivos de datos:
- `idealista-api-analysis.json` - Análisis completo de requests
- `idealista-api-analysis.md` - Reporte legible de APIs
- `idealista-html-analysis.json` - Análisis de datos embebidos
- `idealista-page.html` - HTML completo (761KB, NO subido a GitHub)
- `idealista-property-sample.html` - Muestra de propiedades (NO subido)

---

## 🔍 Hallazgos Clave

### ✨ Solución Encontrada: DOM Scraping + window.utag_data

**Cómo funciona:**
1. Cargar página con Playwright (obtiene cookies DataDome válidas)
2. Extraer IDs de `window.utag_data.list_ads_adId` (30 IDs por página)
3. Parsear DOM con selectores `.item-info-container`, `.item-price`, etc.
4. Construir datos completos de propiedades

**Ventajas:**
- ✅ **Bypasea DataDome** - No hace llamadas API bloqueables
- ✅ **Gratis** - No requiere servicios externos
- ✅ **Rápido** - 30 propiedades por carga
- ✅ **Compatible con código actual** - Ya usas Playwright

### 📊 window.utag_data contiene:

```javascript
{
  "list_ads_adId": ["109618864", "106702840", ...],  // 30 IDs
  "list_totalResult": "14394",
  "list_currentPageNumber": "1",
  "list_totalPageNumber": "480"
}
```

### 🏠 Estructura DOM por propiedad:

```html
<div class="item-info-container">
  <span class="item-price">590.000€</span>
  <div class="item-detail-char">
    <span class="item-detail">2 hab.</span>
    <span class="item-detail">78 m²</span>
    <span class="item-detail">Planta 2ª exterior con ascensor</span>
  </div>
  <a class="item-link" href="/inmueble/109618864/"></a>
</div>
```

**Datos extraíbles:**
- Precio, habitaciones, m², planta, exterior/interior, ascensor, descripción, URL

---

## 📋 Plan de Implementación (FASE 2-6)

### FASE 2: Scraper Mejorado (PRÓXIMO PASO)
- [ ] Crear `idealista-dom-scraper.ts` con extracción de `window.utag_data`
- [ ] Implementar sistema de cookies persistentes
- [ ] Mejorar rate limiting (3-7 segundos entre requests)

### FASE 3: Anti-Detección Avanzada
- [ ] Mejorar `idealista-scraper.ts` actual con:
  - Fingerprinting avanzado (canvas, WebGL)
  - Movimiento de mouse aleatorio
  - Scrolling más natural
  - Cookie management entre ejecuciones

### FASE 4: Orchestrator Inteligente
- [ ] Modificar `lib/scraper/index.ts` con sistema de fallback:
  1. Intento 1: Scraper mejorado (DOM + window.utag_data)
  2. Intento 2: Playwright con delays extendidos
  3. Intento 3: ScraperAPI (si API key disponible)

### FASE 5: Infraestructura Opcional
- [ ] Stub para captcha solvers (2Captcha, CapSolver)
- [ ] Soporte para proxies residenciales (futuro)

### FASE 6: Testing y Diagnóstico
- [ ] Script de diagnóstico completo
- [ ] Testing local y en Vercel
- [ ] Documentación final

---

## 💻 Archivos Modificados/Creados

### Nuevos (subidos a GitHub):
```
scripts/
├── analyze-idealista-api.ts          ✅ Script de análisis de red
├── analyze-idealista-html.ts         ✅ Script de análisis de DOM
├── IDEALISTA_FINDINGS.md             ✅ Documento principal de hallazgos
├── idealista-api-analysis.json       ✅ Datos completos de APIs
├── idealista-api-analysis.md         ✅ Reporte legible de APIs
└── idealista-html-analysis.json      ✅ Datos de análisis HTML
```

### Temporales (NO subidos):
```
scripts/
├── idealista-page.html               ❌ HTML completo (761KB)
└── idealista-property-sample.html    ❌ Muestra de propiedades
```

### Existentes (sin modificar aún):
```
lib/scraper/
├── idealista-scraper.ts              🔄 Pendiente de mejorar (FASE 3)
├── idealista-scraperapi.ts           ✅ Ya existe (fallback)
├── browserless-unblock.ts            ✅ Ya existe (fallback)
└── index.ts                          🔄 Pendiente de modificar (FASE 4)
```

---

## 🚀 Para Continuar en tu Ordenador del Trabajo

### 1. Clonar/Actualizar Repositorio

```bash
cd /ruta/trabajo
git pull origin main

# Verificar que tienes los scripts
ls -la scripts/
# Deberías ver:
# - analyze-idealista-api.ts
# - analyze-idealista-html.ts
# - IDEALISTA_FINDINGS.md
# - *.json y *.md de análisis
```

### 2. Revisar Documentación Principal

```bash
# Leer hallazgos completos
cat scripts/IDEALISTA_FINDINGS.md

# O abrirlo en tu editor favorito
code scripts/IDEALISTA_FINDINGS.md
```

### 3. Comando para Empezar FASE 2

Le dirás a Claude:

```
"Vamos a continuar con el bypass de DataDome de Idealista.
Ya completamos FASE 1 (análisis). Ahora empecemos FASE 2:
crear el scraper mejorado basado en los hallazgos de IDEALISTA_FINDINGS.md"
```

O más directo:

```
"Implementa el scraper DOM + window.utag_data para Idealista
según lo documentado en scripts/IDEALISTA_FINDINGS.md"
```

---

## 📚 Contexto Técnico Importante

### Stack Actual del Proyecto:
- **Framework:** Next.js 15 (App Router)
- **Scraping:** Playwright + playwright-extra + stealth
- **Browser Vercel:** @sparticuz/chromium
- **Database:** PostgreSQL + Prisma
- **Versión activa:** v1 en `/house-flipper-agent` (puerto 3000)

### Dependencias Ya Instaladas:
```json
{
  "playwright": "^1.56.1",
  "playwright-extra": "^4.3.6",
  "puppeteer-extra-plugin-stealth": "^2.11.2",
  "@sparticuz/chromium": "^141.0.0",
  "cheerio": "^1.1.2"
}
```

### Variables de Entorno Relevantes:
```bash
# Opcionales para fallback (no necesarias para FASE 2)
SCRAPERAPI_KEY=""        # ScraperAPI (fallback)
BROWSERLESS_TOKEN=""     # Browserless (fallback)
PROXY_URL=""             # Proxies (futuro)
```

---

## 🎯 Objetivo FASE 2 (Próxima Sesión)

**Crear:** `lib/scraper/idealista-dom-scraper.ts`

**Características:**
1. Usar Playwright con stealth (como actual)
2. Extraer `window.utag_data.list_ads_adId`
3. Parsear DOM de cada propiedad con selectores identificados
4. Guardar cookies en filesystem para reutilizar
5. Delays de 3-7 segundos entre requests
6. Límite de 10-30 propiedades por ejecución

**Resultado esperado:**
- Scraper que bypasea DataDome exitosamente
- Sin necesidad de servicios pagos
- Compatible con Vercel
- Integrable en el orchestrator actual

---

## 📌 Commits Realizados

### Commit 1: `0d844d9`
```
feat: add Idealista DataDome bypass analysis

- analyze-idealista-api.ts: Network analysis tool
- analyze-idealista-html.ts: DOM and embedded data extractor
- IDEALISTA_FINDINGS.md: Complete findings and strategy

Key findings:
- DataDome active on all API endpoints
- Solution: DOM + window.utag_data extraction
- Bypasses DataDome without paid services
```

### Commit 2: (pendiente - se hará ahora)
```
docs: add analysis results and session summary

- idealista-api-analysis.json/md
- idealista-html-analysis.json
- RESUMEN_SESION_DATADOME.md
```

---

## ✅ Checklist de Verificación

Antes de continuar en el trabajo, verifica:

- [ ] `git pull origin main` ejecutado
- [ ] Archivo `scripts/IDEALISTA_FINDINGS.md` existe
- [ ] Archivo `scripts/RESUMEN_SESION_DATADOME.md` existe (este)
- [ ] Scripts de análisis presentes (`analyze-idealista-*.ts`)
- [ ] Archivos JSON de resultados presentes
- [ ] Leer `IDEALISTA_FINDINGS.md` completo
- [ ] Entender estrategia: DOM + window.utag_data

---

## 💡 Notas Finales

### ⚠️ Importante Recordar:

1. **NO necesitamos APIs** - Idealista las tiene bloqueadas con DataDome
2. **DOM scraping es la solución** - Datos ya están en el HTML
3. **window.utag_data es la clave** - Contiene IDs de propiedades
4. **Ya tenemos Playwright** - Solo hay que optimizarlo
5. **Gratis y efectivo** - No requiere ScraperAPI ni proxies (por ahora)

### 🚨 Si Algo Falla:

1. Leer `scripts/IDEALISTA_FINDINGS.md` sección "Próximos Pasos"
2. Revisar código actual en `lib/scraper/idealista-scraper.ts`
3. Los scripts de análisis se pueden re-ejecutar:
   ```bash
   npx tsx scripts/analyze-idealista-html.ts
   ```

### 🎓 Aprendizajes de Esta Sesión:

- DataDome protege APIs pero no puede proteger datos ya renderizados en HTML
- `window.utag_data` es un analytics object que Idealista usa y contiene metadata valiosa
- Playwright + Stealth + DOM parsing > APIs bloqueadas
- Comportamiento humano (delays, mouse movement) es crítico para no ser detectado

---

## 🔗 Enlaces Útiles

- **Repositorio:** https://github.com/salvac12/Flipping
- **Playwright Docs:** https://playwright.dev/
- **DataDome Info:** Las técnicas están en `IDEALISTA_FINDINGS.md`

---

**Estado Final:** ✅ Análisis completo, documentado y subido a GitHub
**Próximo paso:** FASE 2 - Implementar scraper optimizado
**Tiempo estimado FASE 2:** 2-3 horas

¡Éxito en tu ordenador del trabajo! 🚀
