# 🏘️ Guía de Scraping por Barrios de Madrid

Sistema completo para scrapear propiedades de Idealista por barrios específicos de Madrid usando ScraperAPI.

## 📋 Índice

- [¿Qué se ha implementado?](#qué-se-ha-implementado)
- [Barrios Disponibles](#barrios-disponibles)
- [Cómo Usar](#cómo-usar)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [API Endpoints](#api-endpoints)
- [Integración en tu Aplicación](#integración-en-tu-aplicación)

---

## ✅ ¿Qué se ha implementado?

### 1. **Sistema de Mapeo de Barrios** (`lib/utils/madrid-barrios.ts`)

- **42 barrios** de Madrid mapeados
- Organizados por **7 distritos** principales
- Cada barrio tiene:
  - Nombre oficial y display name
  - Slug de Idealista
  - Zona prioritaria asignada
  - Distrito

### 2. **Scraper Mejorado** (`lib/scraper/idealista-scraperapi.ts`)

- Función `scrapeIdealistaBarrio(barrioKey?)` que acepta:
  - **Con barrio**: Scrape ese barrio específico
  - **Sin barrio**: Scrape toda Madrid
- Usa ScraperAPI (bypass de DataDome automático)
- ~2-3 segundos por request

### 3. **API Endpoints Actualizados**

#### **POST /api/scraper/run** - Scraping Manual

```typescript
// Scrapear barrio específico
POST /api/scraper/run
Body: { "barrio": "GUINDALERA" }

// Scrapear toda Madrid
POST /api/scraper/run
Body: {}
```

#### **GET /api/scraper/barrios** - Listar Barrios

```typescript
// Todos los barrios
GET /api/scraper/barrios

// Filtrar por distrito
GET /api/scraper/barrios?distrito=Salamanca

// Filtrar por zona
GET /api/scraper/barrios?zona=RETIRO
```

---

## 🏘️ Barrios Disponibles

### Distrito Centro (6 barrios)
- **SOL** (Sol) - Zona: ARGUELLES
- **EMBAJADORES** (Embajadores) - Zona: DELICIAS
- **CORTES** (Cortes) - Zona: ARGUELLES
- **JUSTICIA** (Justicia) - Zona: ARGUELLES
- **UNIVERSIDAD** (Universidad) - Zona: ARGUELLES
- **PALACIO** (Palacio) - Zona: ARGUELLES

### Distrito Arganzuela (6 barrios)
- **DELICIAS** (Delicias) - Zona: DELICIAS ⭐
- **PACIFICO** (Pacífico) - Zona: PACIFICO ⭐
- **ATOCHA** (Atocha) - Zona: PACIFICO
- **CHOPERA** (Chopera) - Zona: DELICIAS
- **LEGAZPI** (Legazpi) - Zona: DELICIAS
- **ACACIAS** (Acacias) - Zona: DELICIAS

### Distrito Retiro (4 barrios)
- **RETIRO** (Retiro) - Zona: RETIRO ⭐
- **JERONIMOS** (Jerónimos) - Zona: RETIRO
- **IBIZA** (Ibiza) - Zona: RETIRO
- **NIÑO_JESUS** (Niño Jesús) - Zona: PACIFICO

### Distrito Salamanca (6 barrios)
- **RECOLETOS** (Recoletos) - Zona: RETIRO
- **GOYA** (Goya) - Zona: RETIRO
- **FUENTE_DEL_BERRO** (Fuente del Berro) - Zona: RETIRO
- **GUINDALERA** (Guindalera) - Zona: GUINDALERA ⭐
- **LISTA** (Lista) - Zona: GUINDALERA
- **CASTELLANA** (Castellana) - Zona: RETIRO

### Distrito Chamartín (4 barrios)
- **CIUDAD_JARDIN** (Ciudad Jardín) - Zona: PROSPERIDAD
- **HISPANOAMERICA** (Hispanoamérica) - Zona: PROSPERIDAD
- **NUEVA_ESPAÑA** (Nueva España) - Zona: PROSPERIDAD
- **PROSPERIDAD** (Prosperidad) - Zona: PROSPERIDAD ⭐

### Distrito Chamberí (6 barrios)
- **GAZTAMBIDE** (Gaztambide) - Zona: ARGUELLES
- **ARAPILES** (Arapiles) - Zona: ARGUELLES
- **TRAFALGAR** (Trafalgar) - Zona: ARGUELLES
- **ALMAGRO** (Almagro) - Zona: ARGUELLES
- **RIOS_ROSAS** (Ríos Rosas) - Zona: ARGUELLES
- **VALLEHERMOSO** (Vallehermoso) - Zona: ARGUELLES

### Distrito Moncloa-Aravaca (4 barrios)
- **ARGUELLES** (Argüelles) - Zona: ARGUELLES ⭐
- **CIUDAD_UNIVERSITARIA** (Ciudad Universitaria) - Zona: ARGUELLES
- **ARAVACA** (Aravaca) - Zona: MADRID_GENERAL
- **EL_PLANTIO** (El Plantío) - Zona: MADRID_GENERAL

⭐ = Zona prioritaria principal

---

## 🚀 Cómo Usar

### 1. **Programáticamente (TypeScript/JavaScript)**

```typescript
import { scrapeIdealistaBarrio } from '@/lib/scraper/idealista-scraperapi';
import { getAllBarrios, BARRIOS_MADRID } from '@/lib/utils/madrid-barrios';

// Scrapear barrio específico
const propiedades = await scrapeIdealistaBarrio('GUINDALERA');
console.log(`Encontradas ${propiedades.length} propiedades en Guindalera`);

// Scrapear toda Madrid
const todasPropiedades = await scrapeIdealistaBarrio();

// Listar todos los barrios disponibles
const barrios = getAllBarrios();
console.log(`Barrios disponibles: ${barrios.length}`);

// Obtener info de un barrio
const barrioInfo = BARRIOS_MADRID['RETIRO'];
console.log(barrioInfo.displayName); // "Retiro"
console.log(barrioInfo.zona); // "RETIRO"
```

### 2. **Vía API (HTTP Request)**

#### Listar barrios disponibles:

```bash
curl http://localhost:3000/api/scraper/barrios
```

Respuesta:
```json
{
  "success": true,
  "total": 42,
  "distritos": ["Centro", "Arganzuela", "Retiro", ...],
  "zonasPrioritarias": ["GUINDALERA", "DELICIAS", ...],
  "barrios": [
    {
      "key": "GUINDALERA",
      "displayName": "Guindalera",
      "slug": "guindalera",
      "zona": "GUINDALERA",
      "distrito": "Salamanca"
    },
    ...
  ],
  "barriosByDistrito": [...]
}
```

#### Scrapear barrio específico:

```bash
curl -X POST http://localhost:3000/api/scraper/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"barrio": "GUINDALERA"}'
```

Respuesta:
```json
{
  "success": true,
  "message": "Scraping de Guindalera completado",
  "barrio": {
    "key": "GUINDALERA",
    "displayName": "Guindalera",
    "zona": "GUINDALERA",
    "distrito": "Salamanca"
  },
  "results": {
    "total": 21,
    "saved": 21,
    "properties": [...]
  }
}
```

#### Scrapear toda Madrid:

```bash
curl -X POST http://localhost:3000/api/scraper/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Scrapear múltiples barrios en secuencia

```typescript
import { scrapeIdealistaBarrio } from '@/lib/scraper/idealista-scraperapi';
import { savePropertiesToDatabase } from '@/lib/scraper';

const barriosPrioritarios = ['GUINDALERA', 'DELICIAS', 'RETIRO', 'ARGUELLES'];

for (const barrio of barriosPrioritarios) {
  console.log(`Scrapeando ${barrio}...`);

  const propiedades = await scrapeIdealistaBarrio(barrio);
  console.log(`  ✅ ${propiedades.length} propiedades encontradas`);

  if (propiedades.length > 0) {
    const guardadas = await savePropertiesToDatabase(propiedades);
    console.log(`  💾 ${guardadas} propiedades guardadas en DB`);
  }

  // Delay para no saturar ScraperAPI
  await new Promise(resolve => setTimeout(resolve, 3000));
}
```

### Ejemplo 2: Scrapear por distrito

```typescript
import { getBarriosByDistrito } from '@/lib/utils/madrid-barrios';
import { scrapeIdealistaBarrio } from '@/lib/scraper/idealista-scraperapi';

// Obtener todos los barrios de Salamanca
const barriosSalamanca = getBarriosByDistrito('Salamanca');

console.log(`Scrapeando ${barriosSalamanca.length} barrios de Salamanca`);

for (const barrio of barriosSalamanca) {
  const propiedades = await scrapeIdealistaBarrio(barrio.nombre);
  console.log(`${barrio.displayName}: ${propiedades.length} propiedades`);
}
```

### Ejemplo 3: Buscar mejores oportunidades en zona específica

```typescript
import { scrapeIdealistaBarrio } from '@/lib/scraper/idealista-scraperapi';

// Scrapear Retiro
const propiedades = await scrapeIdealistaBarrio('RETIRO');

// Filtrar propiedades viables (score >= 60)
const viables = propiedades.filter(p => p.score >= 60);

// Ordenar por mejor score
const mejores = viables.sort((a, b) => b.score - a.score);

console.log(`Top 5 oportunidades en Retiro:`);
mejores.slice(0, 5).forEach((prop, idx) => {
  console.log(`${idx + 1}. ${prop.title}`);
  console.log(`   💰 ${prop.price.toLocaleString()}€`);
  console.log(`   ⭐ Score: ${prop.score}/100`);
});
```

---

## 🔧 Integración en tu Aplicación

### 1. **Crear selector de barrios en UI**

```typescript
// components/BarrioSelector.tsx
import { getAllBarrios } from '@/lib/utils/madrid-barrios';
import { useState } from 'react';

export function BarrioSelector() {
  const [selectedBarrio, setSelectedBarrio] = useState<string>('');
  const barrios = getAllBarrios();

  const handleScrape = async () => {
    const response = await fetch('/api/scraper/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barrio: selectedBarrio || undefined }),
    });

    const data = await response.json();
    console.log(data);
  };

  return (
    <div>
      <select
        value={selectedBarrio}
        onChange={(e) => setSelectedBarrio(e.target.value)}
      >
        <option value="">Toda Madrid</option>
        {barrios.map(b => (
          <option key={b.nombre} value={b.nombre}>
            {b.displayName} ({b.distrito})
          </option>
        ))}
      </select>

      <button onClick={handleScrape}>
        Scrapear {selectedBarrio ? BARRIOS_MADRID[selectedBarrio].displayName : 'Madrid'}
      </button>
    </div>
  );
}
```

### 2. **Cron job para scraping automático**

```typescript
// app/api/scraper/daily/route.ts
import { scrapeIdealistaBarrio } from '@/lib/scraper/idealista-scraperapi';
import { savePropertiesToDatabase } from '@/lib/scraper';

export async function GET(req: Request) {
  // Scrapear barrios prioritarios cada día
  const barriosPrioritarios = ['GUINDALERA', 'DELICIAS', 'RETIRO'];

  for (const barrio of barriosPrioritarios) {
    const propiedades = await scrapeIdealistaBarrio(barrio);
    await savePropertiesToDatabase(propiedades);
  }

  return Response.json({ success: true });
}
```

---

## 📊 URLs de Idealista Generadas

El sistema genera automáticamente las URLs correctas de Idealista:

| Barrio | URL Generada |
|--------|--------------|
| GUINDALERA | `https://www.idealista.com/venta-viviendas/guindalera-madrid/` |
| RETIRO | `https://www.idealista.com/venta-viviendas/retiro-madrid/` |
| DELICIAS | `https://www.idealista.com/venta-viviendas/delicias-madrid/` |
| Sin barrio | `https://www.idealista.com/venta-viviendas/madrid-madrid/` |

---

## ✅ Características del Sistema

- ✅ **42 barrios** disponibles de Madrid
- ✅ **Scraping selectivo** por barrio
- ✅ **ScraperAPI integrado** (bypass DataDome)
- ✅ **~2-3 segundos** por request
- ✅ **API REST completa**
- ✅ **Base de datos** automática
- ✅ **Sistema de scoring** integrado
- ✅ **TypeScript** type-safe
- ✅ **Listo para Vercel**

---

## 🎯 Uso Recomendado

### Para Development:
```typescript
// Scrapear barrio específico para probar
const props = await scrapeIdealistaBarrio('GUINDALERA');
```

### Para Production:
```typescript
// Cron job diario scrapeando barrios prioritarios
const prioritarios = ['GUINDALERA', 'DELICIAS', 'RETIRO', 'ARGUELLES'];
for (const barrio of prioritarios) {
  await scrapeIdealistaBarrio(barrio);
  await delay(5000); // 5s entre barrios
}
```

---

## 🆘 Soporte

### Archivos clave:
- `lib/utils/madrid-barrios.ts` - Mapeo de barrios
- `lib/scraper/idealista-scraperapi.ts` - Scraper con selección de barrios
- `app/api/scraper/run/route.ts` - Endpoint de scraping
- `app/api/scraper/barrios/route.ts` - Endpoint de listado

### Logs útiles:
```typescript
// Ver qué barrio se está scrapeando
console.log(`🔍 Scrapeando Idealista (ScraperAPI) - Barrio: Guindalera`);
console.log(`📡 Solicitando: https://www.idealista.com/venta-viviendas/guindalera-madrid/`);
console.log(`✅ HTML recibido: 462457 caracteres`);
console.log(`✅ Total propiedades extraídas: 21`);
```

---

**🎉 Sistema listo para usar!** Ahora puedes scrapear cualquier barrio de Madrid con solo especificar su nombre.
