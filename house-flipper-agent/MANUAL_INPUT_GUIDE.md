# 📥 Guía: Sistema de Alimentación Manual + Clikalia

## 🎯 ¿Qué es este sistema?

Un sistema que te permite **alimentar el modelo de estimación de precios** de dos formas:

1. **Manual**: Pegando URLs de propiedades que encuentres
2. **Automático**: Scraping de Clikalia (propiedades reformadas profesionales)

## ✨ Beneficios

- 📈 **Mejora continua**: Cada propiedad añadida mejora las estimaciones
- 🎯 **Precios precisos**: Separación clara entre reformado vs sin reformar
- 🤖 **Automático**: El sistema extrae todos los datos de la URL
- 📊 **Estadísticas actualizadas**: Precios medios por zona se recalculan automáticamente
- 🏆 **Clikalia**: Fuente premium de propiedades reformadas

---

## 🚀 Cómo Usar

### Método 1: Entrada Manual de URLs

1. **Navega a:** `http://localhost:3001/dashboard/input-property`

2. **Pega una URL** de cualquiera de estos portales:
   - Idealista: `https://www.idealista.com/inmueble/...`
   - Fotocasa: `https://www.fotocasa.es/...`
   - Pisos.com: `https://www.pisos.com/...`
   - Clikalia: `https://clikalia.es/comprar/inmueble/...`

3. **Click en "Analizar"**
   - El sistema hará scraping automático
   - Extraerá: precio, m², habitaciones, baños, estado, reforma, etc.
   - Detectará si está reformado o no

4. **Revisa la Vista Previa**
   - Verifica que los datos sean correctos
   - Edita si es necesario (próxima versión)

5. **Click en "Guardar como Comparable"**
   - Se guarda en la BD con `dataSource: "manual"`
   - Las estadísticas de zona se actualizan automáticamente
   - Ya disponible para futuras estimaciones

### Método 2: Scraping Automático de Clikalia

#### Opción A: Desde la UI

1. **Navega a:** `http://localhost:3001/dashboard/input-property`
2. **Scroll hasta el final**
3. **Click en "Ejecutar Scraper de Clikalia"**
4. Espera 1-2 minutos
5. ¡Listo! ~50 propiedades reformadas añadidas

#### Opción B: Desde la API

```bash
curl -X POST http://localhost:3001/api/scraper/clikalia \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "zones": ["guindalera", "delicias", "pacifico"],
    "maxProperties": 50,
    "onlyReformed": true
  }'
```

#### Opción C: Cronjob Automático

Añadir a `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scraper/clikalia",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

Ejecutará scraping de Clikalia **cada domingo a medianoche**.

---

## 📊 Ver tus Comparables

**Navega a:** `http://localhost:3001/dashboard/comparables`

Verás:
- 📈 **Total de comparables** (reformados vs sin reformar)
- 🗺️ **Por zona** (cuántos en cada zona)
- 📊 **Precios medios** por zona:
  - General
  - Reformadas
  - Sin reformar
  - Diferencia porcentual
- 📋 **Últimos añadidos**

---

## 🎓 Ejemplos de Uso

### Ejemplo 1: Añadir Propiedad de Idealista

1. Encuentro esta propiedad en Idealista:
   ```
   https://www.idealista.com/inmueble/12345678/
   ```

2. La pego en el formulario

3. El sistema extrae:
   ```
   Título: Piso en Calle Francisco Silvela, 3 habitaciones
   Precio: 450,000€
   Superficie: 110m²
   €/m²: 4,091€
   Zona: GUINDALERA
   Estado: Reformado ✅
   ```

4. Click "Guardar" → Listo!

### Ejemplo 2: Scraping Masivo de Clikalia

1. Click en "Ejecutar Scraper de Clikalia"

2. Resultado:
   ```
   ✅ 52 propiedades encontradas
   ✅ 48 guardadas (4 duplicadas)

   Por zona:
   - Prosperidad: 12
   - Guindalera: 9
   - Argüelles: 8
   - Delicias: 7
   - Pacífico: 7
   - Retiro: 5
   ```

3. Estadísticas actualizadas automáticamente:
   ```
   GUINDALERA:
   - Reformadas: 4,650€/m² (antes: 4,500€/m²)
   - Sin reformar: 3,200€/m² (antes: 3,500€/m²)
   - Diferencia: +45% por reforma
   ```

---

## 🧠 ¿Cómo Mejora las Estimaciones?

### Antes (Sin Comparables)
```
Estimación para propiedad en Guindalera, 120m², reformada:
- Basado en: Precio medio estático (4,500€/m²)
- Confianza: 30%
- Rango: ±15%
```

### Después (Con 50+ Comparables)
```
Estimación para propiedad en Guindalera, 120m², reformada:
- Basado en: 8 comparables reformados similares
- Confianza: 88%
- Rango: ±6.5%

Comparables usados:
1. Calle López de Hoyos, 125m² - 4,640€/m² (similitud 94%)
2. Avenida de América, 115m² - 4,550€/m² (similitud 92%)
3. Francisco Silvela, 130m² - 4,700€/m² (similitud 90%)
...
```

**Mejora:** De ±15% a ±6.5% de margen de error ✅

---

## 📈 Estadísticas que se Actualizan

Cada vez que añades una propiedad, se recalcula automáticamente:

### Tabla `MarketZone`
- `avgPricePerM2`: Precio medio general
- `avgReformedPricePerM2`: Precio medio de reformadas
- `avgUnreformedPricePerM2`: Precio medio sin reformar
- `minPricePerM2` y `maxPricePerM2`
- `propertiesCount`: Total de comparables
- `lastUpdated`: Timestamp de última actualización

### Uso en Estimaciones
El algoritmo de `price-estimator.ts` usa automáticamente:
- Los nuevos comparables para matching
- Las estadísticas actualizadas como fallback
- La diferencia reformado/sin reformar para ajustes

---

## 🎯 Recomendaciones

### Cantidad Mínima Recomendada
- **Por zona:** 30-50 comparables
- **Reformadas:** 20+ por zona
- **Sin reformar:** 10+ por zona (para comparación)

### Calidad sobre Cantidad
✅ **Priorizar:**
- Propiedades vendidas recientemente (último año)
- Mismas zonas objetivo
- Datos completos (precio, m², reforma, fecha)
- Fuentes fiables (Clikalia > Idealista > otros)

❌ **Evitar:**
- Propiedades muy antiguas (>2 años)
- Datos incompletos
- Zonas fuera de Madrid
- Precios anómalos (outliers)

### Frecuencia de Actualización
- **Manual:** Añade 5-10 propiedades por semana que encuentres
- **Clikalia:** Ejecuta scraper una vez por semana/mes
- **Objetivo:** 200-300 comparables totales en 3 meses

---

## 🛠️ Solución de Problemas

### Error: "Could not parse property from URL"
**Causa:** El scraper no pudo extraer datos de esa página
**Solución:**
1. Verifica que la URL sea correcta
2. Intenta con otro portal
3. La página puede haber cambiado su estructura (reportar)

### Error: "Missing essential data"
**Causa:** Falta precio o superficie
**Solución:** Esa propiedad no tiene datos suficientes, prueba con otra

### Las estadísticas no se actualizan
**Causa:** Error en `updateZoneStatistics()`
**Solución:**
1. Verifica logs del servidor
2. Puede que la zona no exista en `MarketZone`
3. Ejecuta manualmente: `POST /api/pricing/update-zones`

### Clikalia devuelve 0 propiedades
**Causa:** El scraper puede estar bloqueado o la estructura cambió
**Solución:**
1. Verifica que https://clikalia.es/comprar/madrid funcione
2. Puede necesitar actualización de selectores
3. Usa entrada manual mientras tanto

---

## 📊 Métricas de Éxito

Puedes monitorear el progreso en `/dashboard/comparables`:

### Objetivo a 30 días:
- ✅ **150+ comparables totales**
- ✅ **50+ reformadas**
- ✅ **6 zonas cubiertas** (Guindalera, Delicias, etc.)
- ✅ **Margen de error <8%** (medido en validaciones)

### Objetivo a 90 días:
- ✅ **300+ comparables totales**
- ✅ **100+ reformadas**
- ✅ **Actualización semanal automática**
- ✅ **Margen de error <7%**

---

## 🚀 Próximas Mejoras

### Versión 2.0 (próximas semanas)
- [ ] Edición de datos antes de guardar
- [ ] Importación desde CSV
- [ ] Validación de duplicados más inteligente
- [ ] Más portales compatibles
- [ ] Detección automática de ventas (actualizar `saleDate`)

### Versión 3.0 (próximos meses)
- [ ] Machine Learning para mejorar parsing
- [ ] Scraping de históricos de ventas (Idealista Data API)
- [ ] Integración con Catastro
- [ ] Dashboard de métricas de precisión
- [ ] Alertas cuando hay nuevos comparables valiosos

---

## 🤝 Contribuir

¿Encontraste un bug o tienes una idea?

1. Reporta en GitHub Issues
2. O añade nota en `/dashboard/comparables` con feedback

---

## ✅ Checklist de Setup Inicial

- [ ] Navegar a `/dashboard/input-property`
- [ ] Probar añadiendo 1 propiedad manual de Idealista
- [ ] Ejecutar scraper de Clikalia
- [ ] Ver estadísticas en `/dashboard/comparables`
- [ ] Verificar que el contador de comparables aumentó
- [ ] Probar estimación con `POST /api/pricing/estimate`
- [ ] Confirmar que usa los nuevos comparables

---

**¡Listo para empezar a alimentar el sistema!** 🚀

Empieza con el scraper de Clikalia para obtener ~50 comparables en 2 minutos, y luego añade manualmente propiedades interesantes que encuentres.
