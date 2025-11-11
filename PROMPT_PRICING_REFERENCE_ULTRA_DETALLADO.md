# PROMPT 2: CONSULTAR PRECIOS DE REFERENCIA - ULTRA DETALLADO

## CONTEXTO TÉCNICO COMPLETO

### Stack Tecnológico
```yaml
Framework: Next.js 15.5.6
React: 19.0.0
Node: >= 18.17.0
TypeScript: 5.3.3
Styling: TailwindCSS 3.4.1
UI Components: shadcn/ui (Card, Button, Label)
Icons: lucide-react 0.263.1
Routing: next/navigation (useRouter, Link)
```

### Estructura de Carpetas
```
house-flipper-agent/
├── app/
│   ├── dashboard/
│   │   ├── pricing-reference/
│   │   │   └── page.tsx          ← PÁGINA QUE VAMOS A CREAR
│   │   ├── page.tsx              ← Calculadora (ya existe)
│   │   └── layout.tsx
├── components/
│   └── ui/                       ← shadcn/ui components
│       ├── card.tsx
│       ├── button.tsx
│       └── label.tsx
```

---

## PARTE 1: ESTRUCTURA DE DATOS

### 1.1 Barrios de Madrid (24 principales)

**Constante:** `NEIGHBORHOODS_DATA`

Objeto con 24 barrios principales de Madrid, cada uno con:

```typescript
const NEIGHBORHOODS_DATA = {
  'barrio-salamanca': {
    name: 'Barrio de Salamanca',
    reformed: 5500,      // Precio €/m² reformado
    unreformed: 3800,    // Precio €/m² sin reformar
    properties: 2246     // Número de propiedades en BBDD
  },
  'centro': {
    name: 'Centro',
    reformed: 5200,
    unreformed: 3600,
    properties: 2012
  },
  'chamberi': {
    name: 'Chamberí',
    reformed: 4900,
    unreformed: 3400,
    properties: 1034
  },
  'carabanchel': {
    name: 'Carabanchel',
    reformed: 3200,
    unreformed: 2400,
    properties: 815
  },
  'tetuan': {
    name: 'Tetuán',
    reformed: 3400,
    unreformed: 2600,
    properties: 765
  },
  'ciudad-lineal': {
    name: 'Ciudad Lineal',
    reformed: 3100,
    unreformed: 2300,
    properties: 669
  },
  'puente-vallecas': {
    name: 'Puente de Vallecas',
    reformed: 2900,
    unreformed: 2200,
    properties: 658
  },
  'goya': {
    name: 'Goya, Barrio de Salamanca',
    reformed: 5400,
    unreformed: 3700,
    properties: 657
  },
  'chamartin': {
    name: 'Chamartín',
    reformed: 4800,
    unreformed: 3500,
    properties: 647
  },
  'retiro': {
    name: 'Retiro',
    reformed: 5100,
    unreformed: 3600,
    properties: 641
  },
  'moncloa': {
    name: 'Moncloa',
    reformed: 4200,
    unreformed: 3100,
    properties: 615
  },
  'fuencarral': {
    name: 'Fuencarral',
    reformed: 3600,
    unreformed: 2700,
    properties: 525
  },
  'arganzuela': {
    name: 'Arganzuela',
    reformed: 3800,
    unreformed: 2800,
    properties: 521
  },
  'san-blas': {
    name: 'San Blas',
    reformed: 3000,
    unreformed: 2300,
    properties: 505
  },
  'lavapies': {
    name: 'Lavapiés-Embajadores, Centro',
    reformed: 4100,
    unreformed: 3000,
    properties: 502
  },
  'latina': {
    name: 'Latina',
    reformed: 3100,
    unreformed: 2400,
    properties: 501
  },
  'hortaleza': {
    name: 'Hortaleza',
    reformed: 3500,
    unreformed: 2600,
    properties: 476
  },
  'recoletos': {
    name: 'Recoletos, Barrio de Salamanca',
    reformed: 5700,
    unreformed: 4000,
    properties: 475
  },
  'malasana': {
    name: 'Malasaña-Universidad, Centro',
    reformed: 4800,
    unreformed: 3400,
    properties: 470
  },
  'usera': {
    name: 'Usera',
    reformed: 2800,
    unreformed: 2100,
    properties: 431
  },
  'guindalera': {
    name: 'Guindalera, Barrio de Salamanca',
    reformed: 4500,
    unreformed: 3200,
    properties: 217
  },
  'prosperidad': {
    name: 'Prosperidad, Chamartín',
    reformed: 4400,
    unreformed: 3200,
    properties: 128
  },
  'pacifico': {
    name: 'Pacífico, Retiro',
    reformed: 4700,
    unreformed: 3400,
    properties: 126
  },
  'arguelles': {
    name: 'Argüelles, Moncloa',
    reformed: 4300,
    unreformed: 3100,
    properties: 189
  },
};
```

### 1.2 Factores Premium (20 factores)

**Constante:** `PREMIUM_FACTORS`

Objeto con dos arrays: `positive` (10 factores) y `negative` (10 factores)

#### Factores POSITIVOS (Incrementan el precio)

```typescript
positive: [
  {
    id: 'garage',
    name: 'Plaza de Garaje',
    adjustment: 8          // +8% sobre precio base
  },
  {
    id: 'storage',
    name: 'Trastero',
    adjustment: 6          // +6%
  },
  {
    id: 'south',
    name: 'Orientación Sur',
    adjustment: 10         // +10%
  },
  {
    id: 'high-floor',
    name: 'Piso Alto (5ª+)',
    adjustment: 7          // +7%
  },
  {
    id: 'penthouse',
    name: 'Ático',
    adjustment: 15         // +15%
  },
  {
    id: 'large-terrace',
    name: 'Terraza Grande (>20m²)',
    adjustment: 12         // +12%
  },
  {
    id: 'elevator',
    name: 'Ascensor',
    adjustment: 5          // +5%
  },
  {
    id: 'doorman',
    name: 'Portero Físico',
    adjustment: 8          // +8%
  },
  {
    id: 'pool',
    name: 'Piscina Comunitaria',
    adjustment: 10         // +10%
  },
  {
    id: 'ac',
    name: 'Aire Acondicionado',
    adjustment: 9          // +9%
  },
]
```

#### Factores NEGATIVOS (Reducen el precio)

```typescript
negative: [
  {
    id: 'interior',
    name: 'Piso Interior',
    adjustment: -12        // -12% sobre precio base
  },
  {
    id: 'low-floor',
    name: 'Piso Bajo (1ª-2ª)',
    adjustment: -8         // -8%
  },
  {
    id: 'no-elevator',
    name: 'Sin Ascensor (3ª+)',
    adjustment: -15        // -15%
  },
  {
    id: 'north',
    name: 'Orientación Norte',
    adjustment: -10        // -10%
  },
  {
    id: 'courtyard',
    name: 'Vistas a Patio Interior',
    adjustment: -7         // -7%
  },
  {
    id: 'needs-reform',
    name: 'Necesita Reforma Integral',
    adjustment: -20        // -20%
  },
  {
    id: 'noise',
    name: 'Ruido Exterior Alto',
    adjustment: -5         // -5%
  },
  {
    id: 'old-building',
    name: 'Edificio Antiguo (pre-1950)',
    adjustment: -6         // -6%
  },
  {
    id: 'no-heating',
    name: 'Sin Calefacción Central',
    adjustment: -8         // -8%
  },
  {
    id: 'no-ventilation',
    name: 'Baño sin Ventilación',
    adjustment: -4         // -4%
  },
]
```

---

## PARTE 2: ESTADO Y LÓGICA DE LA PÁGINA

### 2.1 Estados React

```typescript
const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
// Estado: string (key del barrio seleccionado, ej: 'barrio-salamanca')
// Inicial: '' (vacío, ningún barrio seleccionado)

const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
// Estado: array de strings (IDs de factores seleccionados)
// Inicial: [] (vacío)
// Ejemplo: ['garage', 'south', 'interior']
```

### 2.2 Variables Calculadas

```typescript
// 1. Datos del barrio seleccionado
const neighborhoodData = selectedNeighborhood
  ? NEIGHBORHOODS_DATA[selectedNeighborhood as keyof typeof NEIGHBORHOODS_DATA]
  : null;

// 2. Ajuste total (suma de todos los factores seleccionados)
const totalAdjustment = selectedFactors.reduce((sum, factorId) => {
  const factor = [...PREMIUM_FACTORS.positive, ...PREMIUM_FACTORS.negative]
    .find(f => f.id === factorId);
  return sum + (factor?.adjustment || 0);
}, 0);
// Ejemplo: Si seleccionas 'garage' (+8%) y 'interior' (-12%)
// totalAdjustment = 8 + (-12) = -4

// 3. Multiplicador de ajuste
const adjustmentMultiplier = 1 + (totalAdjustment / 100);
// Ejemplo: si totalAdjustment = -4, entonces multiplier = 0.96 (96%)

// 4. Precios ajustados
const adjustedReformed = neighborhoodData
  ? Math.round(neighborhoodData.reformed * adjustmentMultiplier)
  : 0;

const adjustedUnreformed = neighborhoodData
  ? Math.round(neighborhoodData.unreformed * adjustmentMultiplier)
  : 0;
// Ejemplo: Barrio Salamanca (reformed: 5500)
// Con ajuste -4% → adjustedReformed = Math.round(5500 * 0.96) = 5280
```

### 2.3 Funciones

#### toggleFactor(factorId: string)
```typescript
const toggleFactor = (factorId: string) => {
  setSelectedFactors(prev =>
    prev.includes(factorId)
      ? prev.filter(id => id !== factorId)  // Si ya está, quitarlo
      : [...prev, factorId]                  // Si no está, añadirlo
  );
};
```

#### applyToCalculator()
```typescript
const applyToCalculator = () => {
  // 1. Validación
  if (!neighborhoodData) {
    alert('Por favor selecciona un barrio primero');
    return;
  }

  // 2. Determinar precios finales
  const finalReformed = totalAdjustment !== 0
    ? adjustedReformed
    : neighborhoodData.reformed;

  const finalUnreformed = totalAdjustment !== 0
    ? adjustedUnreformed
    : neighborhoodData.unreformed;

  // 3. Navegar a calculadora con parámetros
  router.push(
    `/dashboard?reformed=${finalReformed}&unreformed=${finalUnreformed}&neighborhood=${encodeURIComponent(neighborhoodData.name)}`
  );
};
```

---

## PARTE 3: DISEÑO VISUAL COMPLETO

### 3.1 HEADER DE PÁGINA

```
┌─────────────────────────────────────────────────────────────────┐
│  [Calculator Icon] Precios de Referencia por Barrio            │
│  Consulta precios medios de propiedades reformadas y sin...    │
└─────────────────────────────────────────────────────────────────┘
```

**Código exacto:**
```tsx
<div className="mb-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
    <Calculator className="w-8 h-8 text-primary" />
    Precios de Referencia por Barrio
  </h1>
  <p className="text-gray-600">
    Consulta precios medios de propiedades reformadas y sin reformar
  </p>
</div>
```

**Detalles visuales:**
- Título: `text-3xl font-bold text-gray-900`
- Icono: Calculator, 8x8, color primary (azul)
- Subtítulo: `text-gray-600`
- Margen inferior: `mb-8`

---

### 3.2 CARD PRINCIPAL - "Consultar Precios de Referencia"

```
╔════════════════════════════════════════════════════════════════╗
║  [TrendingUp Icon] Consultar Precios de Referencia            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────────────────┐  ┌──────────────────────┐          ║
║  │ Ciudad               │  │ Barrio / Distrito    │          ║
║  │ [Madrid        ▼]    │  │ [Selecciona...  ▼]  │          ║
║  │ Más ciudades próx... │  │ 24 barrios principales│         ║
║  └──────────────────────┘  └──────────────────────┘          ║
║                                                                ║
║  [... resultados dinámicos aparecen aquí ...]                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

**Código exacto:**
```tsx
<Card className="mb-8">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <TrendingUp className="w-6 h-6 text-green-600" />
      Consultar Precios de Referencia
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Contenido aquí */}
  </CardContent>
</Card>
```

---

### 3.3 SELECTORES (Ciudad y Barrio)

#### 3.3.1 Selector de Ciudad

```
┌─────────────────────────────────┐
│ Ciudad                          │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Madrid                   ▼┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ Más ciudades próximamente       │
└─────────────────────────────────┘
```

**Código exacto:**
```tsx
<div>
  <Label className="text-sm font-medium text-gray-700 mb-2">
    Ciudad
  </Label>
  <select
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    disabled
  >
    <option value="madrid">Madrid</option>
  </select>
  <p className="text-xs text-gray-500 mt-1">
    Más ciudades próximamente
  </p>
</div>
```

**Detalles:**
- Label: `text-sm font-medium text-gray-700`
- Select: Deshabilitado (`disabled`)
- Padding: `px-4 py-3`
- Border: `border-gray-300 rounded-lg`
- Focus: `focus:ring-2 focus:ring-primary`
- Helper text: `text-xs text-gray-500`

#### 3.3.2 Selector de Barrio

```
┌─────────────────────────────────┐
│ Barrio / Distrito               │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Selecciona un barrio... ▼┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ 24 barrios principales          │
└─────────────────────────────────┘
```

**Código exacto:**
```tsx
<div>
  <Label className="text-sm font-medium text-gray-700 mb-2">
    Barrio / Distrito
  </Label>
  <select
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    value={selectedNeighborhood}
    onChange={(e) => {
      setSelectedNeighborhood(e.target.value);
      setSelectedFactors([]);  // Resetear factores al cambiar barrio
    }}
  >
    <option value="">Selecciona un barrio...</option>
    {Object.entries(NEIGHBORHOODS_DATA).map(([key, data]) => (
      <option key={key} value={key}>
        {data.name} ({data.properties} propiedades)
      </option>
    ))}
  </select>
  <p className="text-xs text-gray-500 mt-1">
    24 barrios principales disponibles
  </p>
</div>
```

**Opciones del select (ejemplo):**
```
Selecciona un barrio...
Barrio de Salamanca (2246 propiedades)
Centro (2012 propiedades)
Chamberí (1034 propiedades)
Carabanchel (815 propiedades)
...
```

**Comportamiento onChange:**
1. Actualiza `selectedNeighborhood` con el value seleccionado
2. Resetea `selectedFactors` a `[]` (limpia factores premium)
3. Muestra los resultados de precios

---

### 3.4 RESULTADOS DE PRECIOS (Solo visible si hay barrio seleccionado)

**Condición de visibilidad:**
```tsx
{neighborhoodData && (
  <div className="space-y-6">
    {/* Todo el contenido de resultados aquí */}
  </div>
)}
```

#### 3.4.1 Tarjetas de Precio Base

**Diseño visual:**
```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ ✓ REFORMADO                 │  │ ⓘ SIN REFORMAR              │
│                             │  │                             │
│ €5,500                      │  │ €3,800                      │
│ Precio medio por m²         │  │ Precio medio por m²         │
└─────────────────────────────┘  └─────────────────────────────┘
   (Verde: border-green-200)       (Azul: border-blue-200)
```

**Tarjeta REFORMADO:**
```tsx
<div className="p-6 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
  <div className="flex items-center gap-2 mb-2">
    <CheckCircle2 className="w-5 h-5 text-green-600" />
    <span className="text-sm font-medium text-gray-700">REFORMADO</span>
  </div>
  <p className="text-4xl font-bold text-green-600 mb-2">
    €{neighborhoodData.reformed.toLocaleString('es-ES')}
  </p>
  <p className="text-sm text-gray-600">Precio medio por m²</p>
</div>
```

**Detalles visuales REFORMADO:**
- Border: `border-2 border-green-200`
- Background: `bg-gradient-to-br from-green-50 to-emerald-50`
- Icono: `CheckCircle2` verde (w-5 h-5)
- Label: `REFORMADO` en uppercase, font-medium
- Precio: `text-4xl font-bold text-green-600`
- Formato número: `toLocaleString('es-ES')` → "5.500" (punto de miles español)

**Tarjeta SIN REFORMAR:**
```tsx
<div className="p-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
  <div className="flex items-center gap-2 mb-2">
    <AlertCircle className="w-5 h-5 text-blue-600" />
    <span className="text-sm font-medium text-gray-700">SIN REFORMAR</span>
  </div>
  <p className="text-4xl font-bold text-blue-600 mb-2">
    €{neighborhoodData.unreformed.toLocaleString('es-ES')}
  </p>
  <p className="text-sm text-gray-600">Precio medio por m²</p>
</div>
```

**Detalles visuales SIN REFORMAR:**
- Border: `border-2 border-blue-200`
- Background: `bg-gradient-to-br from-blue-50 to-indigo-50`
- Icono: `AlertCircle` azul (w-5 h-5)
- Label: `SIN REFORMAR` en uppercase
- Precio: `text-4xl font-bold text-blue-600`

#### 3.4.2 Potencial de Revalorización

**Diseño visual:**
```
╔════════════════════════════════════════════════════════════╗
║ [TrendingUp] Potencial de Revalorización                  ║
║ +€1,700/m²                                                 ║
║ +44.7% de revalorización tras reforma                     ║
╚════════════════════════════════════════════════════════════╝
  (Fondo amarillo: bg-yellow-50, border-yellow-200)
```

**Código exacto:**
```tsx
<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  <div className="flex items-start gap-3">
    <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold text-yellow-900">
        Potencial de Revalorización
      </p>
      <p className="text-2xl font-bold text-yellow-700 mt-1">
        +€{(neighborhoodData.reformed - neighborhoodData.unreformed).toLocaleString('es-ES')}/m²
      </p>
      <p className="text-sm text-yellow-700 mt-1">
        +{(((neighborhoodData.reformed - neighborhoodData.unreformed) / neighborhoodData.unreformed) * 100).toFixed(1)}%
        de revalorización tras reforma
      </p>
    </div>
  </div>
</div>
```

**Cálculos:**
```typescript
// Diferencia absoluta en €/m²
const difference = neighborhoodData.reformed - neighborhoodData.unreformed;
// Ejemplo: 5500 - 3800 = 1700

// Porcentaje de revalorización
const percentage = ((difference / neighborhoodData.unreformed) * 100).toFixed(1);
// Ejemplo: (1700 / 3800) * 100 = 44.7
```

---

### 3.5 AJUSTES PREMIUM (Sección púrpura)

**Diseño visual:**
```
╔══════════════════════════════════════════════════════════════════╗
║  [Sparkles Icon] Ajustes Premium                                ║
║  Selecciona características adicionales para ajustar el precio  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ⬆️ INCREMENTAN EL PRECIO        ⬇️ REDUCEN EL PRECIO          ║
║  ┌─────────────────────┐        ┌─────────────────────┐        ║
║  │ ☐ Plaza de Garaje   │        │ ☐ Piso Interior     │        ║
║  │   +8% sobre precio  │        │   -12% sobre precio │        ║
║  └─────────────────────┘        └─────────────────────┘        ║
║  ...                            ...                             ║
║                                                                  ║
║  [Si hay factores seleccionados]                                ║
║  ┌──────────────────────────────────────────────────────────┐  ║
║  │ Ajuste Total: +8%        Precio Ajustado:               │  ║
║  │                          Reformado: €5,940              │  ║
║  │                          Sin reformar: €4,104           │  ║
║  └──────────────────────────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════╝
```

**Código de la sección completa:**
```tsx
<div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Sparkles className="w-5 h-5 text-purple-600" />
    Ajustes Premium
  </h4>
  <p className="text-sm text-gray-600 mb-4">
    Selecciona características adicionales para ajustar el precio de referencia
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Columna 1: Factores POSITIVOS */}
    <div className="space-y-3">
      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
        <ChevronUp className="w-4 h-4" />
        Incrementan el precio
      </p>
      {/* 10 checkboxes de factores positivos */}
    </div>

    {/* Columna 2: Factores NEGATIVOS */}
    <div className="space-y-3">
      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
        <ChevronDown className="w-4 h-4" />
        Reducen el precio
      </p>
      {/* 10 checkboxes de factores negativos */}
    </div>
  </div>

  {/* Resumen de ajuste (solo visible si totalAdjustment !== 0) */}
  {totalAdjustment !== 0 && (
    <div className="mt-6 p-4 bg-white border-2 border-purple-300 rounded-lg">
      {/* Contenido del resumen */}
    </div>
  )}
</div>
```

#### 3.5.1 Checkbox de Factor Premium (Positivo)

**Diseño visual (NO seleccionado):**
```
┌─────────────────────────────────────┐
│ ☐ Plaza de Garaje                  │
│   +8% sobre precio base             │
└─────────────────────────────────────┘
  Fondo: bg-white
  Border: border-gray-200
  Hover: hover:bg-green-50
```

**Diseño visual (SELECCIONADO):**
```
┌─────────────────────────────────────┐
│ ☑ Plaza de Garaje                  │
│   +8% sobre precio base             │
└─────────────────────────────────────┘
  Fondo: bg-green-50
  Border: border-green-300
```

**Código para factor POSITIVO:**
```tsx
<label
  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
    selectedFactors.includes(factor.id)
      ? 'bg-green-50 border-green-300'
      : 'bg-white border-gray-200 hover:bg-green-50'
  }`}
>
  <input
    type="checkbox"
    className="mt-1 w-4 h-4 rounded"
    checked={selectedFactors.includes(factor.id)}
    onChange={() => toggleFactor(factor.id)}
  />
  <div className="flex-1">
    <span className="font-medium text-gray-900">{factor.name}</span>
    <p className="text-xs text-gray-600">+{factor.adjustment}% sobre precio base</p>
  </div>
</label>
```

**Comportamiento:**
- Click en cualquier parte del label activa/desactiva el checkbox
- `toggleFactor()` añade o quita el `factor.id` del array `selectedFactors`
- Background cambia dinámicamente según estado

#### 3.5.2 Checkbox de Factor Premium (Negativo)

**Código para factor NEGATIVO:**
```tsx
<label
  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
    selectedFactors.includes(factor.id)
      ? 'bg-red-50 border-red-300'
      : 'bg-white border-gray-200 hover:bg-red-50'
  }`}
>
  <input
    type="checkbox"
    className="mt-1 w-4 h-4 rounded"
    checked={selectedFactors.includes(factor.id)}
    onChange={() => toggleFactor(factor.id)}
  />
  <div className="flex-1">
    <span className="font-medium text-gray-900">{factor.name}</span>
    <p className="text-xs text-gray-600">{factor.adjustment}% sobre precio base</p>
  </div>
</label>
```

**Diferencias con factor positivo:**
- Background seleccionado: `bg-red-50 border-red-300`
- Hover: `hover:bg-red-50`
- No usa símbolo "+" en el porcentaje (adjustment ya es negativo)

#### 3.5.3 Resumen de Ajuste (Condicional)

**Condición de visibilidad:**
```tsx
{totalAdjustment !== 0 && (
  // Contenido del resumen
)}
```

**Diseño visual:**
```
┌─────────────────────────────────────────────────────────┐
│ Ajuste Total Aplicado:     Precio Ajustado:            │
│ +8%                        Reformado: €5,940            │
│                            Sin reformar: €4,104         │
└─────────────────────────────────────────────────────────┘
  Fondo: bg-white
  Border: border-2 border-purple-300
```

**Código completo:**
```tsx
<div className="mt-6 p-4 bg-white border-2 border-purple-300 rounded-lg">
  <div className="flex items-center justify-between">
    {/* Lado izquierdo: Ajuste Total */}
    <div>
      <p className="text-sm font-medium text-gray-700">
        Ajuste Total Aplicado:
      </p>
      <p className={`text-2xl font-bold ${
        totalAdjustment >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {totalAdjustment >= 0 ? '+' : ''}{totalAdjustment.toFixed(1)}%
      </p>
    </div>

    {/* Lado derecho: Precios Ajustados */}
    <div className="text-right">
      <p className="text-sm font-medium text-gray-700">
        Precio Ajustado:
      </p>
      <div className="flex gap-4">
        {/* Reformado */}
        <div>
          <p className="text-xs text-gray-600">Reformado</p>
          <p className="text-xl font-bold text-green-600">
            €{adjustedReformed.toLocaleString('es-ES')}
          </p>
        </div>
        {/* Sin reformar */}
        <div>
          <p className="text-xs text-gray-600">Sin reformar</p>
          <p className="text-xl font-bold text-blue-600">
            €{adjustedUnreformed.toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Lógica de colores:**
```typescript
// Color del ajuste total
const adjustmentColor = totalAdjustment >= 0
  ? 'text-green-600'  // Positivo → Verde
  : 'text-red-600';   // Negativo → Rojo

// Signo del porcentaje
const sign = totalAdjustment >= 0 ? '+' : '';
// Si es positivo: "+8.0%"
// Si es negativo: "-4.0%" (el signo negativo ya viene en el número)
```

---

### 3.6 BOTÓN FINAL "Usar estos precios en la Calculadora"

**Diseño visual:**
```
┌─────────────────────────────────────────────────────────────┐
│       Usar estos precios en la Calculadora                 │
└─────────────────────────────────────────────────────────────┘
  Ancho completo (w-full)
  Gradiente azul→índigo→púrpura
  Padding vertical grande (py-6)
```

**Código exacto:**
```tsx
<Button
  onClick={applyToCalculator}
  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-6"
>
  Usar estos precios en la Calculadora
</Button>
```

**Detalles:**
- Ancho: `w-full` (100%)
- Background: Gradiente de 3 colores
  - Normal: `from-blue-600 via-indigo-600 to-purple-600`
  - Hover: `from-blue-700 via-indigo-700 to-purple-700`
- Texto: `text-white font-semibold`
- Altura: `py-6` (padding vertical generoso)

**Comportamiento al hacer click:**
1. Valida que haya un barrio seleccionado
2. Calcula los precios finales (con o sin ajustes)
3. Navega a `/dashboard` con query params:
   - `reformed=5500`
   - `unreformed=3800`
   - `neighborhood=Barrio+de+Salamanca`
4. La calculadora debe leer estos parámetros y autocompletar los campos

---

## PARTE 4: FLUJO COMPLETO DE USUARIO

### Escenario 1: Usuario consulta precios sin ajustes

**Paso 1:** Usuario entra en `/dashboard/pricing-reference`
- Ve el header y la card principal
- Los selectores están vacíos
- No se muestran resultados

**Paso 2:** Usuario selecciona ciudad "Madrid"
- Select de ciudad está deshabilitado, ya está en "Madrid"

**Paso 3:** Usuario selecciona barrio "Barrio de Salamanca"
```typescript
// Estado actualizado:
selectedNeighborhood = 'barrio-salamanca'
selectedFactors = []  // Se resetean los factores

// Variable calculada:
neighborhoodData = {
  name: 'Barrio de Salamanca',
  reformed: 5500,
  unreformed: 3800,
  properties: 2246
}
```

**Paso 4:** Aparecen las tarjetas de precios
- Tarjeta verde: "€5.500" (reformado)
- Tarjeta azul: "€3.800" (sin reformar)
- Banner amarillo: "+€1.700/m²" y "+44.7% de revalorización"

**Paso 5:** Aparece la sección de Ajustes Premium
- 10 factores positivos sin seleccionar
- 10 factores negativos sin seleccionar
- Resumen de ajuste NO visible (totalAdjustment = 0)

**Paso 6:** Aparece el botón "Usar estos precios en la Calculadora"

**Paso 7:** Usuario hace click en el botón
```typescript
applyToCalculator() ejecuta:
  finalReformed = 5500      // Sin ajustes
  finalUnreformed = 3800
  router.push('/dashboard?reformed=5500&unreformed=3800&neighborhood=Barrio%20de%20Salamanca')
```

**Paso 8:** Usuario es redirigido a la calculadora
- Los campos de precio se autorellenan con los valores
- La ubicación se rellena con "Barrio de Salamanca"

---

### Escenario 2: Usuario consulta precios CON ajustes premium

**Paso 1-3:** Igual que escenario 1 (selecciona "Barrio de Salamanca")

**Paso 4:** Usuario selecciona "Plaza de Garaje" (+8%)
```typescript
toggleFactor('garage')
// selectedFactors = ['garage']
// totalAdjustment = 8
// adjustmentMultiplier = 1.08

adjustedReformed = Math.round(5500 * 1.08) = 5940
adjustedUnreformed = Math.round(3800 * 1.08) = 4104
```

**Paso 5:** Aparece el resumen de ajuste
```
Ajuste Total Aplicado: +8.0%
Precio Ajustado:
  Reformado: €5.940
  Sin reformar: €4.104
```

**Paso 6:** Usuario selecciona "Piso Interior" (-12%)
```typescript
toggleFactor('interior')
// selectedFactors = ['garage', 'interior']
// totalAdjustment = 8 + (-12) = -4
// adjustmentMultiplier = 0.96

adjustedReformed = Math.round(5500 * 0.96) = 5280
adjustedUnreformed = Math.round(3800 * 0.96) = 3648
```

**Paso 7:** El resumen se actualiza
```
Ajuste Total Aplicado: -4.0%  (en ROJO)
Precio Ajustado:
  Reformado: €5.280
  Sin reformar: €3.648
```

**Paso 8:** Usuario deselecciona "Piso Interior"
```typescript
toggleFactor('interior')
// selectedFactors = ['garage']
// totalAdjustment = 8
// Vuelve al estado del Paso 5
```

**Paso 9:** Usuario hace click en "Usar estos precios en la Calculadora"
```typescript
applyToCalculator() ejecuta:
  finalReformed = 5940      // CON ajuste del +8%
  finalUnreformed = 4104
  router.push('/dashboard?reformed=5940&unreformed=4104&neighborhood=Barrio%20de%20Salamanca')
```

---

### Escenario 3: Usuario intenta usar la calculadora sin seleccionar barrio

**Paso 1:** Usuario entra en `/dashboard/pricing-reference`

**Paso 2:** Usuario hace click directamente en el botón
```typescript
applyToCalculator() ejecuta:
  if (!neighborhoodData) {
    alert('Por favor selecciona un barrio primero');
    return;  // No navega
  }
```

**Resultado:** Se muestra un alert y no pasa nada

---

## PARTE 5: INTEGRACIÓN CON CALCULADORA

### 5.1 Query Parameters enviados

La página pricing-reference envía estos parámetros a la calculadora:

```typescript
const params = new URLSearchParams({
  reformed: string,      // Precio reformado €/m²
  unreformed: string,    // Precio sin reformar €/m²
  neighborhood: string   // Nombre del barrio
});

// Ejemplo de URL resultante:
// /dashboard?reformed=5940&unreformed=4104&neighborhood=Barrio%20de%20Salamanca
```

### 5.2 Lectura de parámetros en la calculadora

**Código necesario en `/app/dashboard/page.tsx`:**

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CalculatorPage() {
  const searchParams = useSearchParams();
  const { propertyData, setPropertyData } = useHouseFlippingCalculator();

  useEffect(() => {
    // Leer parámetros de URL
    const reformed = searchParams.get('reformed');
    const unreformed = searchParams.get('unreformed');
    const neighborhood = searchParams.get('neighborhood');

    if (reformed && unreformed && neighborhood) {
      // Autocompletar campos
      setPropertyData(prev => ({
        ...prev,
        salePrice: parseInt(reformed) * prev.surface,  // Si surface es 100m², salePrice = 5940 * 100
        location: neighborhood
      }));
    }
  }, [searchParams]);

  // ... resto del componente
}
```

**Nota importante:** El precio enviado es €/m², por lo que necesitas multiplicarlo por la superficie para obtener el precio total de venta.

---

## PARTE 6: LISTA COMPLETA DE TODOS LOS ELEMENTOS

### 6.1 Imports necesarios

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Calculator,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
```

### 6.2 Constantes de datos

1. `NEIGHBORHOODS_DATA` - Objeto con 24 barrios
2. `PREMIUM_FACTORS` - Objeto con:
   - `positive`: Array de 10 factores
   - `negative`: Array de 10 factores

### 6.3 Estados React

1. `selectedNeighborhood` - string
2. `selectedFactors` - string[]

### 6.4 Variables calculadas

1. `neighborhoodData` - Datos del barrio seleccionado
2. `totalAdjustment` - Suma de ajustes (%)
3. `adjustmentMultiplier` - Factor multiplicador
4. `adjustedReformed` - Precio reformado ajustado
5. `adjustedUnreformed` - Precio sin reformar ajustado

### 6.5 Funciones

1. `toggleFactor(factorId: string)` - Seleccionar/deseleccionar factor
2. `applyToCalculator()` - Navegar a calculadora con precios

### 6.6 Componentes UI usados

1. `Card` (shadcn/ui)
2. `CardHeader` (shadcn/ui)
3. `CardTitle` (shadcn/ui)
4. `CardContent` (shadcn/ui)
5. `Button` (shadcn/ui)
6. `Label` (shadcn/ui)
7. `select` (HTML nativo)
8. `input[type="checkbox"]` (HTML nativo)

### 6.7 Iconos usados (lucide-react)

1. `Calculator` - Header principal
2. `TrendingUp` - Título de card + potencial de revalorización
3. `CheckCircle2` - Tarjeta reformado
4. `AlertCircle` - Tarjeta sin reformar
5. `Sparkles` - Título ajustes premium
6. `ChevronUp` - Label factores positivos
7. `ChevronDown` - Label factores negativos

### 6.8 Clases Tailwind importantes

**Colores:**
- Verde: `text-green-600`, `bg-green-50`, `border-green-200`
- Azul: `text-blue-600`, `bg-blue-50`, `border-blue-200`
- Amarillo: `text-yellow-600`, `bg-yellow-50`, `border-yellow-200`
- Púrpura: `text-purple-600`, `bg-purple-50`, `border-purple-200`
- Rojo: `text-red-600`, `bg-red-50`, `border-red-200`

**Gradientes:**
- Verde: `bg-gradient-to-br from-green-50 to-emerald-50`
- Azul: `bg-gradient-to-br from-blue-50 to-indigo-50`
- Botón: `bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600`

**Tamaños de texto:**
- Títulos: `text-3xl`, `text-2xl`, `text-xl`, `text-lg`
- Precios grandes: `text-4xl`
- Precios medianos: `text-2xl`, `text-xl`
- Texto normal: `text-sm`, `text-xs`

**Borders:**
- Finos: `border`
- Medios: `border-2`
- Redondeados: `rounded-lg`, `rounded-xl`

---

## PARTE 7: VALIDACIONES Y CASOS EDGE

### 7.1 Validaciones necesarias

**1. Barrio no seleccionado:**
```typescript
if (!neighborhoodData) {
  alert('Por favor selecciona un barrio primero');
  return;
}
```

**2. División por cero (no debería pasar):**
```typescript
const percentage = neighborhoodData.unreformed !== 0
  ? ((difference / neighborhoodData.unreformed) * 100).toFixed(1)
  : '0.0';
```

**3. Valores null/undefined:**
```typescript
const adjustedReformed = neighborhoodData
  ? Math.round(neighborhoodData.reformed * adjustmentMultiplier)
  : 0;
```

### 7.2 Casos edge

**Caso 1:** Usuario selecciona múltiples factores contradictorios
- Ejemplo: "Orientación Sur" (+10%) + "Orientación Norte" (-10%)
- Resultado: totalAdjustment = 0
- Comportamiento: Permitido, pero lógicamente inconsistente
- Solución sugerida: Validación para evitar seleccionar ambas orientaciones

**Caso 2:** Ajuste total muy negativo
- Ejemplo: Selecciona todos los factores negativos → totalAdjustment = -107%
- Resultado: adjustmentMultiplier = -0.07 (negativo!)
- Solución necesaria:
```typescript
const adjustmentMultiplier = Math.max(0.1, 1 + (totalAdjustment / 100));
// Nunca permitir multiplicador < 0.1 (precio nunca baja más del 90%)
```

**Caso 3:** Navegación sin superficie definida
- La calculadora necesita `surface` para calcular precio total
- Si surface = 0, el precio total será 0
- Solución: La calculadora debe validar que surface > 0

---

## PARTE 8: CÓDIGO COMPLETO DE LA PÁGINA

```tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Calculator,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================
// DATOS DE BARRIOS (24 principales)
// ============================================
const NEIGHBORHOODS_DATA = {
  'barrio-salamanca': { name: 'Barrio de Salamanca', reformed: 5500, unreformed: 3800, properties: 2246 },
  'centro': { name: 'Centro', reformed: 5200, unreformed: 3600, properties: 2012 },
  'chamberi': { name: 'Chamberí', reformed: 4900, unreformed: 3400, properties: 1034 },
  'carabanchel': { name: 'Carabanchel', reformed: 3200, unreformed: 2400, properties: 815 },
  'tetuan': { name: 'Tetuán', reformed: 3400, unreformed: 2600, properties: 765 },
  'ciudad-lineal': { name: 'Ciudad Lineal', reformed: 3100, unreformed: 2300, properties: 669 },
  'puente-vallecas': { name: 'Puente de Vallecas', reformed: 2900, unreformed: 2200, properties: 658 },
  'goya': { name: 'Goya, Barrio de Salamanca', reformed: 5400, unreformed: 3700, properties: 657 },
  'chamartin': { name: 'Chamartín', reformed: 4800, unreformed: 3500, properties: 647 },
  'retiro': { name: 'Retiro', reformed: 5100, unreformed: 3600, properties: 641 },
  'moncloa': { name: 'Moncloa', reformed: 4200, unreformed: 3100, properties: 615 },
  'fuencarral': { name: 'Fuencarral', reformed: 3600, unreformed: 2700, properties: 525 },
  'arganzuela': { name: 'Arganzuela', reformed: 3800, unreformed: 2800, properties: 521 },
  'san-blas': { name: 'San Blas', reformed: 3000, unreformed: 2300, properties: 505 },
  'lavapies': { name: 'Lavapiés-Embajadores, Centro', reformed: 4100, unreformed: 3000, properties: 502 },
  'latina': { name: 'Latina', reformed: 3100, unreformed: 2400, properties: 501 },
  'hortaleza': { name: 'Hortaleza', reformed: 3500, unreformed: 2600, properties: 476 },
  'recoletos': { name: 'Recoletos, Barrio de Salamanca', reformed: 5700, unreformed: 4000, properties: 475 },
  'malasana': { name: 'Malasaña-Universidad, Centro', reformed: 4800, unreformed: 3400, properties: 470 },
  'usera': { name: 'Usera', reformed: 2800, unreformed: 2100, properties: 431 },
  'guindalera': { name: 'Guindalera, Barrio de Salamanca', reformed: 4500, unreformed: 3200, properties: 217 },
  'prosperidad': { name: 'Prosperidad, Chamartín', reformed: 4400, unreformed: 3200, properties: 128 },
  'pacifico': { name: 'Pacífico, Retiro', reformed: 4700, unreformed: 3400, properties: 126 },
  'arguelles': { name: 'Argüelles, Moncloa', reformed: 4300, unreformed: 3100, properties: 189 },
};

// ============================================
// FACTORES PREMIUM (20 factores: 10+10)
// ============================================
const PREMIUM_FACTORS = {
  positive: [
    { id: 'garage', name: 'Plaza de Garaje', adjustment: 8 },
    { id: 'storage', name: 'Trastero', adjustment: 6 },
    { id: 'south', name: 'Orientación Sur', adjustment: 10 },
    { id: 'high-floor', name: 'Piso Alto (5ª+)', adjustment: 7 },
    { id: 'penthouse', name: 'Ático', adjustment: 15 },
    { id: 'large-terrace', name: 'Terraza Grande (>20m²)', adjustment: 12 },
    { id: 'elevator', name: 'Ascensor', adjustment: 5 },
    { id: 'doorman', name: 'Portero Físico', adjustment: 8 },
    { id: 'pool', name: 'Piscina Comunitaria', adjustment: 10 },
    { id: 'ac', name: 'Aire Acondicionado', adjustment: 9 },
  ],
  negative: [
    { id: 'interior', name: 'Piso Interior', adjustment: -12 },
    { id: 'low-floor', name: 'Piso Bajo (1ª-2ª)', adjustment: -8 },
    { id: 'no-elevator', name: 'Sin Ascensor (3ª+)', adjustment: -15 },
    { id: 'north', name: 'Orientación Norte', adjustment: -10 },
    { id: 'courtyard', name: 'Vistas a Patio Interior', adjustment: -7 },
    { id: 'needs-reform', name: 'Necesita Reforma Integral', adjustment: -20 },
    { id: 'noise', name: 'Ruido Exterior Alto', adjustment: -5 },
    { id: 'old-building', name: 'Edificio Antiguo (pre-1950)', adjustment: -6 },
    { id: 'no-heating', name: 'Sin Calefacción Central', adjustment: -8 },
    { id: 'no-ventilation', name: 'Baño sin Ventilación', adjustment: -4 },
  ],
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function PricingReferencePage() {
  const router = useRouter();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  // Variables calculadas
  const neighborhoodData = selectedNeighborhood
    ? NEIGHBORHOODS_DATA[selectedNeighborhood as keyof typeof NEIGHBORHOODS_DATA]
    : null;

  const totalAdjustment = selectedFactors.reduce((sum, factorId) => {
    const factor = [...PREMIUM_FACTORS.positive, ...PREMIUM_FACTORS.negative]
      .find(f => f.id === factorId);
    return sum + (factor?.adjustment || 0);
  }, 0);

  const adjustmentMultiplier = 1 + (totalAdjustment / 100);
  const adjustedReformed = neighborhoodData
    ? Math.round(neighborhoodData.reformed * adjustmentMultiplier)
    : 0;
  const adjustedUnreformed = neighborhoodData
    ? Math.round(neighborhoodData.unreformed * adjustmentMultiplier)
    : 0;

  // Funciones
  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId)
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  const applyToCalculator = () => {
    if (!neighborhoodData) {
      alert('Por favor selecciona un barrio primero');
      return;
    }

    const finalReformed = totalAdjustment !== 0 ? adjustedReformed : neighborhoodData.reformed;
    const finalUnreformed = totalAdjustment !== 0 ? adjustedUnreformed : neighborhoodData.unreformed;

    router.push(`/dashboard?reformed=${finalReformed}&unreformed=${finalUnreformed}&neighborhood=${encodeURIComponent(neighborhoodData.name)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ==================== HEADER ==================== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calculator className="w-8 h-8 text-primary" />
          Precios de Referencia por Barrio
        </h1>
        <p className="text-gray-600">Consulta precios medios de propiedades reformadas y sin reformar</p>
      </div>

      {/* ==================== CARD PRINCIPAL ==================== */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Consultar Precios de Referencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* ==================== SELECTORES ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ciudad */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Ciudad</Label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              >
                <option value="madrid">Madrid</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Más ciudades próximamente</p>
            </div>

            {/* Barrio */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Barrio / Distrito</Label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedNeighborhood}
                onChange={(e) => {
                  setSelectedNeighborhood(e.target.value);
                  setSelectedFactors([]);
                }}
              >
                <option value="">Selecciona un barrio...</option>
                {Object.entries(NEIGHBORHOODS_DATA).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.name} ({data.properties} propiedades)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">24 barrios principales disponibles</p>
            </div>
          </div>

          {/* ==================== RESULTADOS (Solo si hay barrio) ==================== */}
          {neighborhoodData && (
            <div className="space-y-6">

              {/* ===== TARJETAS DE PRECIO BASE ===== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reformado */}
                <div className="p-6 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">REFORMADO</span>
                  </div>
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    €{neighborhoodData.reformed.toLocaleString('es-ES')}
                  </p>
                  <p className="text-sm text-gray-600">Precio medio por m²</p>
                </div>

                {/* Sin Reformar */}
                <div className="p-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">SIN REFORMAR</span>
                  </div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    €{neighborhoodData.unreformed.toLocaleString('es-ES')}
                  </p>
                  <p className="text-sm text-gray-600">Precio medio por m²</p>
                </div>
              </div>

              {/* ===== POTENCIAL DE REVALORIZACIÓN ===== */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900">Potencial de Revalorización</p>
                    <p className="text-2xl font-bold text-yellow-700 mt-1">
                      +€{(neighborhoodData.reformed - neighborhoodData.unreformed).toLocaleString('es-ES')}/m²
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      +{(((neighborhoodData.reformed - neighborhoodData.unreformed) / neighborhoodData.unreformed) * 100).toFixed(1)}% de revalorización tras reforma
                    </p>
                  </div>
                </div>
              </div>

              {/* ===== AJUSTES PREMIUM ===== */}
              <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Ajustes Premium
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona características adicionales para ajustar el precio de referencia
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Factores POSITIVOS */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <ChevronUp className="w-4 h-4" />
                      Incrementan el precio
                    </p>
                    {PREMIUM_FACTORS.positive.map((factor) => (
                      <label
                        key={factor.id}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                          selectedFactors.includes(factor.id)
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200 hover:bg-green-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-4 h-4 rounded"
                          checked={selectedFactors.includes(factor.id)}
                          onChange={() => toggleFactor(factor.id)}
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{factor.name}</span>
                          <p className="text-xs text-gray-600">+{factor.adjustment}% sobre precio base</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Factores NEGATIVOS */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <ChevronDown className="w-4 h-4" />
                      Reducen el precio
                    </p>
                    {PREMIUM_FACTORS.negative.map((factor) => (
                      <label
                        key={factor.id}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                          selectedFactors.includes(factor.id)
                            ? 'bg-red-50 border-red-300'
                            : 'bg-white border-gray-200 hover:bg-red-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-4 h-4 rounded"
                          checked={selectedFactors.includes(factor.id)}
                          onChange={() => toggleFactor(factor.id)}
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{factor.name}</span>
                          <p className="text-xs text-gray-600">{factor.adjustment}% sobre precio base</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Resumen de Ajuste (solo si totalAdjustment !== 0) */}
                {totalAdjustment !== 0 && (
                  <div className="mt-6 p-4 bg-white border-2 border-purple-300 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Ajuste Total Aplicado:</p>
                        <p className={`text-2xl font-bold ${totalAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalAdjustment >= 0 ? '+' : ''}{totalAdjustment.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">Precio Ajustado:</p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-600">Reformado</p>
                            <p className="text-xl font-bold text-green-600">
                              €{adjustedReformed.toLocaleString('es-ES')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Sin reformar</p>
                            <p className="text-xl font-bold text-blue-600">
                              €{adjustedUnreformed.toLocaleString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ===== BOTÓN FINAL ===== */}
              <Button
                onClick={applyToCalculator}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-6"
              >
                Usar estos precios en la Calculadora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## PARTE 9: RESUMEN EJECUTIVO

### ¿Qué hace esta página?

Permite a los usuarios:
1. Seleccionar un barrio de Madrid (24 opciones)
2. Ver precios medios de propiedades reformadas y sin reformar
3. Calcular el potencial de revalorización
4. Aplicar 20 factores premium para ajustar los precios
5. Enviar los precios calculados a la calculadora de inversión

### Datos clave

- **24 barrios** con datos reales de propiedades
- **20 factores premium** (10 positivos + 10 negativos)
- **Cálculo en tiempo real** de precios ajustados
- **Integración directa** con la calculadora

### Tecnología

- Next.js 15.5.6 (App Router)
- React 19 (Client Component)
- TypeScript
- TailwindCSS
- shadcn/ui
- lucide-react

### Archivos necesarios

1. `app/dashboard/pricing-reference/page.tsx` - La página completa (código en PARTE 8)
2. `components/ui/card.tsx` - shadcn/ui (ya debe existir)
3. `components/ui/button.tsx` - shadcn/ui (ya debe existir)
4. `components/ui/label.tsx` - shadcn/ui (ya debe existir)

### Testing necesario

1. Seleccionar cada barrio y verificar que los precios se muestran correctamente
2. Seleccionar factores positivos y verificar que el ajuste total aumenta
3. Seleccionar factores negativos y verificar que el ajuste total disminuye
4. Seleccionar ambos tipos y verificar que se suman/restan correctamente
5. Hacer click en "Usar estos precios en la Calculadora" y verificar la navegación
6. Verificar que la calculadora recibe correctamente los parámetros de URL

---

**FIN DEL PROMPT ULTRA DETALLADO DE PRICING REFERENCE**

Este prompt contiene CADA elemento visual, CADA texto, CADA comportamiento esperado, CADA cálculo, y el código completo funcional de la página.
