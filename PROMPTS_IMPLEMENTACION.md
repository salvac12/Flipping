# Prompts de Implementación - House Flipper Pro

Este documento contiene prompts detallados para replicar la implementación completa del sistema House Flipper Pro usando agentes de IA.

---

## PROMPT 1: Calculadora de Inversión (Dashboard Principal)

### Contexto del Proyecto
Estás trabajando en **House Flipper Pro**, una aplicación Next.js 15 con App Router y React 19 para analizar rentabilidad de inversiones inmobiliarias (comprar → reformar → vender). La calculadora es el dashboard principal y debe exponer TODOS los parámetros de cálculo de forma organizada.

### Stack Tecnológico
- **Framework**: Next.js 15 (App Router) con React 19
- **Styling**: TailwindCSS
- **Componentes**: shadcn/ui (Card, Button, Input, Label)
- **Icons**: lucide-react
- **Base de datos**: PostgreSQL + Prisma
- **Autenticación**: NextAuth.js v5

### Estructura Actual del Proyecto

#### Hook Existente: `hooks/useHouseFlippingCalculator.ts`
Este hook ya existe y gestiona TODO el estado y cálculos. Contiene:

**Parameters (48 parámetros):**
```typescript
// COMPRA (9 parámetros)
itpRate: 10,                              // % ITP
notaryPurchaseRate: 0.5,                  // % Notaría
notaryPurchaseMin: 600,                   // € mínimo Notaría
registryRate: 0.5,                        // % Registro
registryMin: 400,                         // € mínimo Registro
managementFee: 300,                       // € Gestoría
valuationFee: 350,                        // € Tasación
dueDiligenceFee: 500,                     // € Due Diligence
realEstateCommissionPurchaseRate: 3,     // % Comisión compra

// REFORMA (5 parámetros)
renovationPricePerM2: 800,                // €/m² Reforma
renovationVatRate: 21,                    // % IVA Reforma
constructionLicenseRate: 4,               // % Licencia obra
architectProjectRate: 3,                  // % Proyecto arquitecto
constructionInsuranceRate: 1.5,           // % Seguro obra

// MANTENIMIENTO (4 parámetros)
communityFeeMonthly: 100,                 // € Comunidad/mes
insuranceMonthly: 30,                     // € Seguro/mes
utilitiesMonthly: 50,                     // € Suministros/mes
ibiAnnualRate: 0.5,                       // % IBI anual

// VENTA (9 parámetros)
realEstateCommissionSaleRate: 3,          // % Comisión venta
plusvaliaMunicipal: 1000,                 // € Plusvalía
notarySaleRate: 0.3,                      // % Notaría venta
notarySaleMin: 800,                       // € mínimo Notaría
managementSaleFee: 300,                   // € Gestoría venta
energyCertificate: 150,                   // € Certificado energético
habitabilityCertificate: 200,             // € Cédula habitabilidad
homeStagingFee: 2000,                     // € Home staging
marketingFee: 500,                        // € Marketing

// IMPUESTOS (1 parámetro)
corporateTaxRate: 25,                     // % Impuesto sociedades
```

**Options (6 booleanos):**
```typescript
includeDueDiligence: false,
includeRealEstateCommissionPurchase: false,
includeFurniture: false,
furnitureBudget: 5000,
includeConstructionInsurance: true,
includeHomeStaging: false,
```

**PropertyData:**
```typescript
purchasePrice: 0,
surface: 0,
salePrice: 0,
projectDuration: 12,  // meses
location: '',
```

**Calculations (calculados automáticamente):**
```typescript
purchaseCosts: { itp, notary, registry, management, ... }
renovationCosts: { budget, vat, license, ... }
maintenanceCosts: { community, insurance, utilities, ibi }
saleCosts: { commission, plusvalia, notary, ... }
totalInvestment
grossProfit
netProfit
roi
annualizedRoi
viable: boolean
```

**Métodos del hook:**
```typescript
setPropertyData(data)
setParameters(params)
setOptions(opts)
resetToDefaults()
```

#### Componentes Existentes

**1. `components/house-flipping/InputPanel.tsx`**
Ya implementado con 3 tabs (URL, Text, Manual) usando shadcn/ui Tabs. Maneja:
- Import desde URL de portales inmobiliarios
- Extracción de texto copiado/pegado
- Entrada manual de datos básicos (precio compra, superficie, precio venta, duración, ubicación)

**2. `components/house-flipping/CostBreakdown.tsx`**
Muestra el desglose de costes en 4 categorías collapsibles usando `calculations` del hook.

**3. `components/house-flipping/ResultsSummary.tsx`**
Muestra ROI, beneficio neto, viabilidad usando `calculations` del hook.

**4. `components/calculator/PriceEstimator.tsx`**
Componente para estimar precio de venta basado en comparables.

### Tarea: Crear AdvancedParameters Component

#### Ubicación
`components/house-flipping/AdvancedParameters.tsx`

#### Requisitos Funcionales

**1. Organización en 5 Categorías Collapsibles:**

Cada categoría debe tener:
- Header con icono + título + botón toggle (ChevronDown de lucide-react)
- Color de borde distintivo
- Estado collapsed/expanded independiente
- Grid de 2-3 columnas responsivo para los inputs

**Categoría 1: 💰 Costes de Compra** (border-blue-200)
- ITP (%)
- Notaría Compra (%) + Mínimo (€)
- Registro (%) + Mínimo (€)
- Gestoría (€)
- Tasación (€)
- Due Diligence (€) - solo si `options.includeDueDiligence`
- Comisión Inmobiliaria Compra (%) - solo si `options.includeRealEstateCommissionPurchase`

**Opciones (checkboxes):**
- Incluir Due Diligence
- Incluir Comisión Inmobiliaria Compra

**Categoría 2: 🔧 Costes de Reforma** (border-orange-200)
- Precio Reforma por m² (€/m²)
- IVA Reforma (%)
- Licencia de Obra (%)
- Proyecto Arquitecto (%)
- Seguro de Obra (%) - solo si `options.includeConstructionInsurance`

**Opciones (checkboxes):**
- Incluir Seguro de Obra
- Incluir Mobiliario + Input para presupuesto (€) si está checked

**Categoría 3: 🏠 Mantenimiento Durante Proyecto** (border-green-200)
- Cuota Comunidad Mensual (€/mes)
- Seguro Hogar Mensual (€/mes)
- Suministros Mensual (€/mes)
- IBI Anual (%)

**Categoría 4: 📈 Costes de Venta** (border-purple-200)
- Comisión Inmobiliaria Venta (%)
- Plusvalía Municipal (€)
- Notaría Venta (%) + Mínimo (€)
- Gestoría Venta (€)
- Certificado Energético (€)
- Cédula de Habitabilidad (€)
- Home Staging (€) - solo si `options.includeHomeStaging`
- Marketing (€)

**Opciones (checkboxes):**
- Incluir Home Staging

**Categoría 5: 💼 Impuestos** (border-red-200)
- Impuesto de Sociedades (%)

**2. Footer con Botón de Reset:**
Botón "Restaurar Valores por Defecto" (con icono RotateCcw) que llama a `onReset()`

#### Interface del Componente

```typescript
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface AdvancedParametersProps {
  parameters: {
    // Compra
    itpRate: number;
    notaryPurchaseRate: number;
    notaryPurchaseMin: number;
    registryRate: number;
    registryMin: number;
    managementFee: number;
    valuationFee: number;
    dueDiligenceFee: number;
    realEstateCommissionPurchaseRate: number;
    // Reforma
    renovationPricePerM2: number;
    renovationVatRate: number;
    constructionLicenseRate: number;
    architectProjectRate: number;
    constructionInsuranceRate: number;
    // Mantenimiento
    communityFeeMonthly: number;
    insuranceMonthly: number;
    utilitiesMonthly: number;
    ibiAnnualRate: number;
    // Venta
    realEstateCommissionSaleRate: number;
    plusvaliaMunicipal: number;
    notarySaleRate: number;
    notarySaleMin: number;
    managementSaleFee: number;
    energyCertificate: number;
    habitabilityCertificate: number;
    homeStagingFee: number;
    marketingFee: number;
    // Impuestos
    corporateTaxRate: number;
  };
  options: {
    includeDueDiligence: boolean;
    includeRealEstateCommissionPurchase: boolean;
    includeFurniture: boolean;
    furnitureBudget: number;
    includeConstructionInsurance: boolean;
    includeHomeStaging: boolean;
  };
  onParametersChange: (params: typeof parameters) => void;
  onOptionsChange: (options: typeof options) => void;
  onReset: () => void;
}

export function AdvancedParameters({
  parameters,
  options,
  onParametersChange,
  onOptionsChange,
  onReset
}: AdvancedParametersProps) {
  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    compra: true,
    reforma: false,
    mantenimiento: false,
    venta: false,
    impuestos: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleParameterChange = (key: string, value: number) => {
    onParametersChange({
      ...parameters,
      [key]: value
    });
  };

  const handleOptionChange = (key: string, value: boolean) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* Título principal */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚙️ Parámetros Avanzados de Cálculo
        </h3>

        <div className="space-y-4">
          {/* SECCIÓN 1: Costes de Compra */}
          <div className="border-l-4 border-blue-200 pl-4">
            {/* Header clickeable */}
            {/* Grid de inputs cuando expandedSections.compra === true */}
            {/* Checkboxes de opciones */}
          </div>

          {/* SECCIÓN 2: Costes de Reforma */}
          {/* ... */}

          {/* SECCIÓN 3: Mantenimiento */}
          {/* ... */}

          {/* SECCIÓN 4: Costes de Venta */}
          {/* ... */}

          {/* SECCIÓN 5: Impuestos */}
          {/* ... */}
        </div>

        {/* Footer con botón de reset */}
        <div className="mt-6 pt-4 border-t flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Valores por defecto configurados para Madrid 2025
          </p>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Valores por Defecto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Detalles de Implementación

**Checkboxes:** Usar HTML nativo (NO shadcn Checkbox):
```tsx
<input
  type="checkbox"
  id="includeDueDiligence"
  checked={options.includeDueDiligence}
  onChange={(e) => handleOptionChange('includeDueDiligence', e.target.checked)}
  className="w-4 h-4 rounded border-gray-300"
/>
```

**Inputs numéricos:**
```tsx
<div>
  <Label htmlFor="itpRate" className="text-sm">ITP (%)</Label>
  <Input
    id="itpRate"
    type="number"
    step="0.1"
    value={parameters.itpRate}
    onChange={(e) => handleParameterChange('itpRate', parseFloat(e.target.value) || 0)}
    className="mt-1"
  />
</div>
```

**Grid responsivo:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
  {/* Inputs aquí */}
</div>
```

### Integración en Dashboard

#### Archivo: `app/dashboard/page.tsx`

**1. Importar el componente:**
```typescript
import { AdvancedParameters } from '@/components/house-flipping/AdvancedParameters';
```

**2. Reemplazar la sección antigua de parámetros (si existe) con:**
```tsx
{/* Parámetros Avanzados */}
<AdvancedParameters
  parameters={parameters}
  options={options}
  onParametersChange={setParameters}
  onOptionsChange={setOptions}
  onReset={resetToDefaults}
/>
```

**3. Ubicación:** Colocar DESPUÉS del header y ANTES del grid principal que contiene InputPanel y ResultsSummary.

**4. Eliminar botones redundantes:** Si el header tiene botones de "Parámetros" o "Restaurar", eliminarlos ya que ahora están integrados en AdvancedParameters.

### Estructura Final del Dashboard

```tsx
export default function HouseFlippingCalculatorPage() {
  const {
    propertyData,
    setPropertyData,
    parameters,
    setParameters,
    options,
    setOptions,
    calculations,
    resetToDefaults
  } = useHouseFlippingCalculator();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header con título y botón Guardar */}
      <div className="flex justify-between items-center mb-6">
        <h1>Calculadora de Inversión Inmobiliaria</h1>
        <Button onClick={handleSaveAnalysis}>Guardar</Button>
      </div>

      {/* Parámetros Avanzados - NUEVO */}
      <AdvancedParameters
        parameters={parameters}
        options={options}
        onParametersChange={setParameters}
        onOptionsChange={setOptions}
        onReset={resetToDefaults}
      />

      {/* Grid Principal - 2 columnas en desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          <InputPanel
            propertyData={propertyData}
            onPropertyDataChange={setPropertyData}
          />
          <PriceEstimator {...priceEstimatorProps} />
          <CostBreakdown calculations={calculations} />
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <ResultsSummary
            calculations={calculations}
            projectDuration={propertyData.projectDuration}
          />
          {/* Exportación, Análisis guardados, etc. */}
        </div>
      </div>
    </div>
  );
}
```

### Validaciones y Comportamiento

1. **Valores mínimos:** Los inputs numéricos no deben aceptar valores negativos
2. **Formateo:** Usar `step="0.1"` para porcentajes, `step="1"` para euros
3. **Actualización en tiempo real:** Los cálculos se actualizan automáticamente al cambiar cualquier parámetro
4. **Persistencia:** Los parámetros modificados permanecen hasta que se haga reset o se guarde el análisis
5. **Conditional rendering:** Mostrar inputs opcionales solo cuando su checkbox está activo

### Resultado Esperado

Al completar esta implementación, el usuario podrá:
- Ver y editar TODOS los 48 parámetros organizados por categoría
- Activar/desactivar costes opcionales con checkboxes
- Colapsar/expandir secciones para mejor organización visual
- Restaurar valores por defecto de Madrid 2025 con un clic
- Ver cálculos actualizados en tiempo real al modificar cualquier valor

---

## PROMPT 2: Página de Consulta de Precios de Referencia

### Contexto
Necesitas crear una página para consultar precios de referencia de propiedades reformadas y sin reformar en Madrid. Esta página permite seleccionar un barrio y aplicar ajustes premium basados en características de la propiedad.

### Ubicación
`app/dashboard/pricing-reference/page.tsx`

### Datos: 169 Barrios de Madrid

**Base de datos:** Tabla `ReferencePricing`
```prisma
model ReferencePricing {
  id                  String   @id @default(cuid())
  neighborhood        String   @unique
  district            String
  avgPriceReformed    Float    // €/m² reformado
  avgPriceUnreformed  Float    // €/m² sin reformar
  sampleSize          Int      // Número de propiedades en muestra
  lastUpdated         DateTime @default(now())
  createdAt           DateTime @default(now())
}
```

**Lista completa de barrios** (formato: "slug: Nombre Display - Distrito"):
```
barrio-salamanca: Barrio Salamanca - Salamanca
centro: Centro - Centro
chamberi: Chamberí - Chamberí
retiro: Retiro - Retiro
... (los 169 barrios completos que ya te proporcioné antes)
```

### Estructura de la Página

#### 1. Header
```tsx
<div className="mb-6">
  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
    <DollarSign className="w-6 h-6 text-green-600" />
    Consultar Precios de Referencia
  </h1>
  <p className="text-sm text-gray-600 mt-1">
    Precios medios €/m² en Madrid con ajustes premium personalizables
  </p>
</div>
```

#### 2. Selector de Barrio (NeighborhoodSelector Component)

**Ubicación:** `components/pricing/NeighborhoodSelector.tsx`

```tsx
interface NeighborhoodSelectorProps {
  value: string;
  onChange: (neighborhood: string) => void;
  neighborhoods: Array<{
    slug: string;
    name: string;
    district: string;
    sampleSize: number;
  }>;
}

export function NeighborhoodSelector({ value, onChange, neighborhoods }: NeighborhoodSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seleccionar Barrio</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Select con buscador */}
        <div className="space-y-2">
          <Label>Barrio o Distrito</Label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Selecciona un barrio...</option>
            {neighborhoods.map(n => (
              <option key={n.slug} value={n.slug}>
                {n.name} - {n.district} ({n.sampleSize} propiedades)
              </option>
            ))}
          </select>
        </div>

        {/* Stats del barrio seleccionado */}
        {value && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Información del Barrio</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Distrito</p>
                <p className="font-medium">{selectedNeighborhood.district}</p>
              </div>
              <div>
                <p className="text-gray-600">Propiedades en muestra</p>
                <p className="font-medium">{selectedNeighborhood.sampleSize}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3. Factores Premium (PremiumFactors Component)

**Ubicación:** `components/pricing/PremiumFactors.tsx`

**20 Factores de Ajuste:**
```typescript
const PREMIUM_FACTORS = [
  // Positivos
  { id: 'atico', label: 'Ático', adjustment: 15 },
  { id: 'terraza', label: 'Terraza >20m²', adjustment: 12 },
  { id: 'orientacion-sur', label: 'Orientación Sur', adjustment: 10 },
  { id: 'vistas', label: 'Vistas Excepcionales', adjustment: 10 },
  { id: 'parking', label: 'Plaza Garaje Incluida', adjustment: 8 },
  { id: 'trastero', label: 'Trastero', adjustment: 5 },
  { id: 'portero', label: 'Portero Físico', adjustment: 5 },
  { id: 'piscina', label: 'Piscina Comunitaria', adjustment: 5 },
  { id: 'jardin-privado', label: 'Jardín Privado', adjustment: 15 },
  { id: 'ascensor-moderno', label: 'Ascensor Moderno', adjustment: 3 },
  { id: 'edificio-historico', label: 'Edificio Histórico Singular', adjustment: 12 },

  // Negativos
  { id: 'interior', label: 'Piso Interior', adjustment: -12 },
  { id: 'bajo', label: 'Planta Baja', adjustment: -10 },
  { id: 'sin-ascensor', label: 'Sin Ascensor (>2º)', adjustment: -15 },
  { id: 'orientacion-norte', label: 'Orientación Norte', adjustment: -8 },
  { id: 'ruido', label: 'Zona Ruidosa', adjustment: -10 },
  { id: 'edificio-deteriorado', label: 'Edificio Deteriorado', adjustment: -12 },
  { id: 'necesita-reforma-integral', label: 'Necesita Reforma Integral', adjustment: -20 },
  { id: 'vecindad-problematica', label: 'Vecindad Problemática', adjustment: -15 },
  { id: 'sin-calefaccion', label: 'Sin Calefacción Central', adjustment: -5 },
];
```

```tsx
interface PremiumFactorsProps {
  selectedFactors: string[];
  onFactorsChange: (factors: string[]) => void;
}

export function PremiumFactors({ selectedFactors, onFactorsChange }: PremiumFactorsProps) {
  const handleToggle = (factorId: string) => {
    if (selectedFactors.includes(factorId)) {
      onFactorsChange(selectedFactors.filter(id => id !== factorId));
    } else {
      onFactorsChange([...selectedFactors, factorId]);
    }
  };

  // Calcular ajuste total
  const totalAdjustment = selectedFactors.reduce((sum, id) => {
    const factor = PREMIUM_FACTORS.find(f => f.id === id);
    return sum + (factor?.adjustment || 0);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Factores Premium</CardTitle>
        <p className="text-sm text-gray-600">
          Selecciona las características de la propiedad para ajustar el precio
        </p>
      </CardHeader>
      <CardContent>
        {/* Grid de checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PREMIUM_FACTORS.map(factor => (
            <div key={factor.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={factor.id}
                checked={selectedFactors.includes(factor.id)}
                onChange={() => handleToggle(factor.id)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor={factor.id} className="text-sm cursor-pointer flex-1">
                {factor.label}
              </Label>
              <span className={`text-sm font-semibold ${
                factor.adjustment > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {factor.adjustment > 0 ? '+' : ''}{factor.adjustment}%
              </span>
            </div>
          ))}
        </div>

        {/* Resumen de ajuste total */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Ajuste Total:</span>
            <span className={`text-xl font-bold ${
              totalAdjustment > 0 ? 'text-green-600' :
              totalAdjustment < 0 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {totalAdjustment > 0 ? '+' : ''}{totalAdjustment}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 4. Panel de Resultados

```tsx
<Card>
  <CardHeader>
    <CardTitle>Precios Estimados</CardTitle>
  </CardHeader>
  <CardContent>
    {selectedNeighborhood && (
      <div className="space-y-4">
        {/* Precio Reformado */}
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Precio Reformado
            </h3>
            <span className="text-xs text-gray-500">
              Base: {baseReformedPrice.toLocaleString()}€/m²
            </span>
          </div>
          <div className="text-3xl font-bold text-green-700">
            {adjustedReformedPrice.toLocaleString()}€/m²
          </div>
          {totalAdjustment !== 0 && (
            <p className="text-xs text-gray-600 mt-1">
              Ajuste aplicado: {totalAdjustment > 0 ? '+' : ''}{totalAdjustment}%
            </p>
          )}
        </div>

        {/* Precio Sin Reformar */}
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Precio Sin Reformar
            </h3>
            <span className="text-xs text-gray-500">
              Base: {baseUnreformedPrice.toLocaleString()}€/m²
            </span>
          </div>
          <div className="text-3xl font-bold text-orange-700">
            {adjustedUnreformedPrice.toLocaleString()}€/m²
          </div>
        </div>

        {/* Diferencial */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Diferencial Reforma
            </span>
            <span className="text-xl font-bold text-blue-700">
              {(adjustedReformedPrice - adjustedUnreformedPrice).toLocaleString()}€/m²
            </span>
          </div>
        </div>

        {/* Botón para aplicar a calculadora */}
        <Button
          className="w-full"
          onClick={handleApplyToCalculator}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Aplicar a Calculadora
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

### Lógica de Cálculo

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingReferencePage() {
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [pricing, setPricing] = useState<{
    avgPriceReformed: number;
    avgPriceUnreformed: number;
  } | null>(null);

  // Cargar barrios al montar
  useEffect(() => {
    fetch('/api/pricing/neighborhoods')
      .then(res => res.json())
      .then(data => setNeighborhoods(data.neighborhoods));
  }, []);

  // Cargar precios cuando se selecciona barrio
  useEffect(() => {
    if (selectedNeighborhood) {
      fetch(`/api/pricing/reference?neighborhood=${selectedNeighborhood}`)
        .then(res => res.json())
        .then(data => setPricing(data.pricing));
    }
  }, [selectedNeighborhood]);

  // Calcular ajuste total
  const totalAdjustment = selectedFactors.reduce((sum, id) => {
    const factor = PREMIUM_FACTORS.find(f => f.id === id);
    return sum + (factor?.adjustment || 0);
  }, 0);

  // Calcular precios ajustados
  const adjustmentMultiplier = 1 + (totalAdjustment / 100);
  const adjustedReformedPrice = pricing
    ? Math.round(pricing.avgPriceReformed * adjustmentMultiplier)
    : 0;
  const adjustedUnreformedPrice = pricing
    ? Math.round(pricing.avgPriceUnreformed * adjustmentMultiplier)
    : 0;

  // Aplicar a calculadora
  const handleApplyToCalculator = () => {
    const params = new URLSearchParams({
      reformed: adjustedReformedPrice.toString(),
      unreformed: adjustedUnreformedPrice.toString(),
      neighborhood: selectedNeighborhood
    });
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}

      {/* Grid 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Selector y Factores */}
        <div className="space-y-6">
          <NeighborhoodSelector {...} />
          <PremiumFactors {...} />
        </div>

        {/* Columna derecha: Resultados */}
        <div>
          {/* Panel de resultados */}
        </div>
      </div>
    </div>
  );
}
```

### API Endpoints Necesarios

#### 1. `app/api/pricing/neighborhoods/route.ts`
```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  const neighborhoods = await prisma.referencePricing.findMany({
    select: {
      neighborhood: true,
      district: true,
      sampleSize: true,
    },
    orderBy: [
      { district: 'asc' },
      { neighborhood: 'asc' }
    ]
  });

  return Response.json({ neighborhoods });
}
```

#### 2. `app/api/pricing/reference/route.ts`
```typescript
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const neighborhood = searchParams.get('neighborhood');

  if (!neighborhood) {
    return Response.json({ error: 'Neighborhood required' }, { status: 400 });
  }

  const pricing = await prisma.referencePricing.findUnique({
    where: { neighborhood }
  });

  if (!pricing) {
    return Response.json({ error: 'Neighborhood not found' }, { status: 404 });
  }

  return Response.json({ pricing });
}
```

### Integración con Calculadora

Cuando el usuario hace clic en "Aplicar a Calculadora", la página debe:

1. Construir URL con parámetros: `/dashboard?reformed=4500&unreformed=3200&neighborhood=chamberi`
2. Navegar a la calculadora
3. La calculadora debe leer estos parámetros en `useEffect`:

```typescript
// En app/dashboard/page.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const reformed = params.get('reformed');
  const unreformed = params.get('unreformed');
  const neighborhood = params.get('neighborhood');

  if (reformed && unreformed) {
    // Calcular precio de venta estimado basado en superficie
    const estimatedSalePrice = propertyData.surface * parseFloat(reformed);
    setPropertyData(prev => ({
      ...prev,
      salePrice: estimatedSalePrice,
      location: neighborhood || prev.location
    }));
  }
}, []);
```

---

## PROMPT 3: Página de Alimentación de Datos (Feed Pricing Data)

### Contexto
Necesitas crear una página administrativa para alimentar la base de datos de precios de referencia. Esta página permite ejecutar scrapers automáticos, importar URLs manualmente y extraer datos de texto copiado/pegado.

### Ubicación
`app/dashboard/feed-pricing-data/page.tsx`

### Funcionalidades

#### 1. Estadísticas de Base de Datos (Component: DatabaseStats)

**Ubicación:** `components/admin/DatabaseStats.tsx`

```tsx
interface DatabaseStatsProps {
  stats: {
    totalProperties: number;
    reformedCount: number;
    unreformedCount: number;
    lastUpdate: string;
    byDistrict: Array<{
      district: string;
      count: number;
    }>;
  };
}

export function DatabaseStats({ stats }: DatabaseStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de la Base de Datos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-700">
              {stats.totalProperties.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Total Propiedades
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-700">
              {stats.reformedCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Reformadas
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-700">
              {stats.unreformedCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Sin Reformar
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm font-semibold text-purple-700">
              Última actualización
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {new Date(stats.lastUpdate).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        {/* Top 5 distritos */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Top 5 Distritos</h4>
          <div className="space-y-2">
            {stats.byDistrict.slice(0, 5).map(d => (
              <div key={d.district} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{d.district}</span>
                <span className="text-sm font-semibold">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 2. Selector de Scrapers (Component: ScraperSelector)

**Ubicación:** `components/admin/ScraperSelector.tsx`

**5 Scrapers Activos:**
```typescript
const SCRAPERS = [
  {
    id: 'idealista',
    name: 'Idealista',
    icon: '🏘️',
    description: 'Portal líder en España',
    status: 'active',
    lastRun: '2025-01-15T08:00:00Z',
    propertiesScraped: 1250
  },
  {
    id: 'fotocasa',
    name: 'Fotocasa',
    icon: '🏠',
    description: 'Portal de referencia',
    status: 'active',
    lastRun: '2025-01-15T08:00:00Z',
    propertiesScraped: 980
  },
  {
    id: 'pisoscom',
    name: 'Pisos.com',
    icon: '🏢',
    description: 'Amplia base de datos',
    status: 'active',
    lastRun: '2025-01-15T08:00:00Z',
    propertiesScraped: 870
  },
  {
    id: 'clikalia',
    name: 'Clikalia',
    icon: '🔑',
    description: 'Especialista en reformados',
    status: 'active',
    lastRun: '2025-01-15T08:00:00Z',
    propertiesScraped: 450
  },
  {
    id: 'gilmar',
    name: 'Gilmar',
    icon: '⭐',
    description: 'Inmobiliaria premium',
    status: 'active',
    lastRun: '2025-01-14T08:00:00Z',
    propertiesScraped: 320
  }
];
```

```tsx
interface ScraperSelectorProps {
  selectedScrapers: string[];
  onScrapersChange: (scrapers: string[]) => void;
  onRunScrapers: () => void;
  isRunning: boolean;
}

export function ScraperSelector({
  selectedScrapers,
  onScrapersChange,
  onRunScrapers,
  isRunning
}: ScraperSelectorProps) {
  const handleToggle = (scraperId: string) => {
    if (selectedScrapers.includes(scraperId)) {
      onScrapersChange(selectedScrapers.filter(id => id !== scraperId));
    } else {
      onScrapersChange([...selectedScrapers, scraperId]);
    }
  };

  const handleSelectAll = () => {
    onScrapersChange(SCRAPERS.map(s => s.id));
  };

  const handleDeselectAll = () => {
    onScrapersChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Scrapers Automáticos</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Todos
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Ninguno
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {SCRAPERS.map(scraper => (
            <div
              key={scraper.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedScrapers.includes(scraper.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleToggle(scraper.id)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedScrapers.includes(scraper.id)}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{scraper.icon}</span>
                    <h4 className="font-semibold">{scraper.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scraper.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {scraper.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {scraper.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      Última ejecución: {new Date(scraper.lastRun).toLocaleDateString('es-ES')}
                    </span>
                    <span>
                      {scraper.propertiesScraped} propiedades
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="w-full mt-4"
          onClick={onRunScrapers}
          disabled={selectedScrapers.length === 0 || isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Ejecutando Scrapers...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Ejecutar Scrapers Seleccionados ({selectedScrapers.length})
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 3. Importación Manual (Component: ManualImport)

**Ubicación:** `components/admin/ManualImport.tsx`

```tsx
export function ManualImport() {
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImportUrl = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/pricing/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setUrlInput('');
      }
    } catch (error) {
      setResult({ success: false, error: 'Error al importar URL' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportText = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/pricing/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setTextInput('');
      }
    } catch (error) {
      setResult({ success: false, error: 'Error al extraer datos' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importación Manual</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs URL / Texto */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'url' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <Link2 className="w-4 h-4 mr-2" />
              Por URL
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="w-4 h-4 mr-2" />
              Por Texto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Label>URL de la Propiedad</Label>
              <Input
                placeholder="https://www.idealista.com/inmueble/12345678/"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleImportUrl}
              disabled={!urlInput || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Importando...' : 'Importar desde URL'}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div>
              <Label>Texto del Anuncio</Label>
              <textarea
                placeholder="Pega aquí el texto completo del anuncio..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={8}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <Button
              onClick={handleImportText}
              disabled={!textInput || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Extrayendo...' : 'Extraer Datos del Texto'}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Resultado */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <div>
                <h4 className="font-semibold text-green-800 mb-2">
                  ✓ Propiedad importada correctamente
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Barrio: {result.property.neighborhood}</p>
                  <p>Precio: {result.property.price.toLocaleString()}€</p>
                  <p>Superficie: {result.property.surface}m²</p>
                  <p>Reformado: {result.property.isReformed ? 'Sí' : 'No'}</p>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-red-800 mb-2">
                  ✗ Error al importar
                </h4>
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 4. Selector de Barrios para Scraping

**Ubicación:** `components/admin/NeighborhoodFilter.tsx`

```tsx
interface NeighborhoodFilterProps {
  selectedNeighborhoods: string[];
  onNeighborhoodsChange: (neighborhoods: string[]) => void;
  allNeighborhoods: string[];
}

export function NeighborhoodFilter({
  selectedNeighborhoods,
  onNeighborhoodsChange,
  allNeighborhoods
}: NeighborhoodFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNeighborhoods = allNeighborhoods.filter(n =>
    n.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (neighborhood: string) => {
    if (selectedNeighborhoods.includes(neighborhood)) {
      onNeighborhoodsChange(selectedNeighborhoods.filter(n => n !== neighborhood));
    } else {
      onNeighborhoodsChange([...selectedNeighborhoods, neighborhood]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtrar por Barrios</CardTitle>
        <p className="text-sm text-gray-600">
          Selecciona barrios específicos o deja vacío para todos
        </p>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Buscar barrio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
        />

        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredNeighborhoods.map(neighborhood => (
            <div key={neighborhood} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={neighborhood}
                checked={selectedNeighborhoods.includes(neighborhood)}
                onChange={() => handleToggle(neighborhood)}
                className="w-4 h-4"
              />
              <Label htmlFor={neighborhood} className="text-sm cursor-pointer">
                {neighborhood}
              </Label>
            </div>
          ))}
        </div>

        <div className="mt-3 text-sm text-gray-600">
          {selectedNeighborhoods.length} barrio(s) seleccionado(s)
        </div>
      </CardContent>
    </Card>
  );
}
```

### Lógica Principal de la Página

```typescript
'use client';

import { useState, useEffect } from 'react';
import { DatabaseStats } from '@/components/admin/DatabaseStats';
import { ScraperSelector } from '@/components/admin/ScraperSelector';
import { ManualImport } from '@/components/admin/ManualImport';
import { NeighborhoodFilter } from '@/components/admin/NeighborhoodFilter';

export default function FeedPricingDataPage() {
  const [stats, setStats] = useState(null);
  const [selectedScrapers, setSelectedScrapers] = useState<string[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [isRunningScrapers, setIsRunningScrapers] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState<any>(null);

  // Cargar estadísticas
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const response = await fetch('/api/pricing/stats');
    const data = await response.json();
    setStats(data.stats);
  };

  // Ejecutar scrapers
  const handleRunScrapers = async () => {
    setIsRunningScrapers(true);
    setScrapingProgress({ status: 'starting', message: 'Iniciando scrapers...' });

    try {
      const response = await fetch('/api/scraper/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scrapers: selectedScrapers,
          neighborhoods: selectedNeighborhoods.length > 0 ? selectedNeighborhoods : null
        })
      });

      const data = await response.json();

      if (data.success) {
        setScrapingProgress({
          status: 'completed',
          message: `Completado: ${data.results.totalScraped} propiedades procesadas`,
          results: data.results
        });
        loadStats(); // Recargar estadísticas
      } else {
        setScrapingProgress({
          status: 'error',
          message: data.error || 'Error al ejecutar scrapers'
        });
      }
    } catch (error) {
      setScrapingProgress({
        status: 'error',
        message: 'Error de conexión'
      });
    } finally {
      setIsRunningScrapers(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-600" />
          Alimentar Base de Datos de Precios
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Gestiona la captura y actualización de datos de precios de referencia
        </p>
      </div>

      {/* Estadísticas */}
      <div className="mb-6">
        {stats && <DatabaseStats stats={stats} />}
      </div>

      {/* Grid 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Scrapers y Filtros */}
        <div className="space-y-6">
          <ScraperSelector
            selectedScrapers={selectedScrapers}
            onScrapersChange={setSelectedScrapers}
            onRunScrapers={handleRunScrapers}
            isRunning={isRunningScrapers}
          />

          <NeighborhoodFilter
            selectedNeighborhoods={selectedNeighborhoods}
            onNeighborhoodsChange={setSelectedNeighborhoods}
            allNeighborhoods={ALL_NEIGHBORHOODS_ARRAY}
          />
        </div>

        {/* Columna derecha: Importación Manual */}
        <div className="space-y-6">
          <ManualImport />

          {/* Progress de scraping */}
          {scrapingProgress && (
            <Card>
              <CardHeader>
                <CardTitle>Progreso de Scraping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${
                  scrapingProgress.status === 'completed' ? 'bg-green-50' :
                  scrapingProgress.status === 'error' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                  <p className="text-sm font-medium">{scrapingProgress.message}</p>

                  {scrapingProgress.results && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-bold">{scrapingProgress.results.totalScraped}</div>
                        <div className="text-gray-600">Procesadas</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-bold">{scrapingProgress.results.saved}</div>
                        <div className="text-gray-600">Guardadas</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-bold">{scrapingProgress.results.errors}</div>
                        <div className="text-gray-600">Errores</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
```

### API Endpoints Necesarios

#### 1. `app/api/pricing/stats/route.ts`
```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  const totalProperties = await prisma.referencePricing.count();

  const reformedCount = await prisma.referencePricing.count({
    where: { avgPriceReformed: { gt: 0 } }
  });

  const unreformedCount = await prisma.referencePricing.count({
    where: { avgPriceUnreformed: { gt: 0 } }
  });

  const lastUpdate = await prisma.referencePricing.findFirst({
    orderBy: { lastUpdated: 'desc' },
    select: { lastUpdated: true }
  });

  const byDistrict = await prisma.referencePricing.groupBy({
    by: ['district'],
    _count: true,
    orderBy: { _count: { neighborhood: 'desc' } }
  });

  return Response.json({
    stats: {
      totalProperties,
      reformedCount,
      unreformedCount,
      lastUpdate: lastUpdate?.lastUpdated || new Date(),
      byDistrict: byDistrict.map(d => ({
        district: d.district,
        count: d._count
      }))
    }
  });
}
```

#### 2. `app/api/scraper/pricing/route.ts`
```typescript
import { runPricingScrapers } from '@/lib/scraper/pricing-orchestrator';

export async function POST(request: Request) {
  const { scrapers, neighborhoods } = await request.json();

  try {
    const results = await runPricingScrapers({
      scrapers,
      neighborhoods
    });

    return Response.json({
      success: true,
      results
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

#### 3. `app/api/pricing/import/route.ts`
```typescript
import { extractPropertyDataFromUrl } from '@/lib/extractors/url-extractor';
import { saveReferencePricing } from '@/lib/pricing/save-pricing';

export async function POST(request: Request) {
  const { url } = await request.json();

  try {
    const propertyData = await extractPropertyDataFromUrl(url);
    await saveReferencePricing(propertyData);

    return Response.json({
      success: true,
      property: propertyData
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}
```

#### 4. `app/api/pricing/extract/route.ts`
```typescript
import { extractPropertyDataFromText } from '@/lib/extractors/text-extractor';
import { saveReferencePricing } from '@/lib/pricing/save-pricing';

export async function POST(request: Request) {
  const { text } = await request.json();

  try {
    const propertyData = await extractPropertyDataFromText(text);
    await saveReferencePricing(propertyData);

    return Response.json({
      success: true,
      property: propertyData
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}
```

---

## PROMPT 4: Conexión e Integración entre Secciones

### Flujo de Datos Completo del Sistema

Este prompt explica cómo todas las secciones se conectan y comunican entre sí para crear un sistema cohesivo.

### 1. Arquitectura de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS (Prisma)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ReferencePricing                  Property                  │
│  ├─ neighborhood (unique)          ├─ url                    │
│  ├─ district                       ├─ price                  │
│  ├─ avgPriceReformed               ├─ m2                     │
│  ├─ avgPriceUnreformed             ├─ pricePerM2             │
│  ├─ sampleSize                     ├─ zone                   │
│  └─ lastUpdated                    ├─ needsReform            │
│                                    └─ wasReformed            │
│                                                               │
│  FlippingAnalysis                  User                      │
│  ├─ purchasePrice                  ├─ email                  │
│  ├─ salePrice                      └─ password (hashed)      │
│  ├─ parameters (JSON)                                        │
│  ├─ calculations (JSON)                                      │
│  └─ roi                                                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Flujo Usuario: Desde Feed Data hasta Análisis Final

#### PASO 1: Alimentación de Datos (Feed Pricing Data)

**Entrada:** Scrapers automáticos o importación manual

**Proceso:**
```typescript
// 1. Scraper captura propiedad de portal
const scrapedProperty = {
  url: 'https://www.idealista.com/inmueble/12345678/',
  price: 350000,
  surface: 85,
  pricePerM2: 4118,
  address: 'Calle Goya 45, Madrid',
  neighborhood: 'barrio-salamanca',
  district: 'Salamanca',
  wasReformed: true,
  // ... más datos
};

// 2. Se guarda en tabla Property
await prisma.property.create({
  data: scrapedProperty
});

// 3. Se actualiza ReferencePricing agregando esta propiedad
// Cálculo de nuevos promedios:
const currentAvg = await prisma.referencePricing.findUnique({
  where: { neighborhood: 'barrio-salamanca' }
});

const newAvg = calculateNewAverage(
  currentAvg.avgPriceReformed,
  currentAvg.sampleSize,
  scrapedProperty.pricePerM2
);

await prisma.referencePricing.update({
  where: { neighborhood: 'barrio-salamanca' },
  data: {
    avgPriceReformed: wasReformed ? newAvg : currentAvg.avgPriceReformed,
    avgPriceUnreformed: !wasReformed ? newAvg : currentAvg.avgPriceUnreformed,
    sampleSize: { increment: 1 },
    lastUpdated: new Date()
  }
});
```

**Salida:** Base de datos actualizada con nuevos precios de referencia

---

#### PASO 2: Consulta de Precios (Pricing Reference)

**Entrada:** Usuario selecciona barrio y características premium

**Proceso:**
```typescript
// 1. Usuario en /dashboard/pricing-reference
// Selecciona: Chamberí + Ático + Terraza

const neighborhood = 'chamberi';
const premiumFactors = ['atico', 'terraza'];

// 2. Obtener precios base de BBDD
const pricing = await prisma.referencePricing.findUnique({
  where: { neighborhood }
});
// pricing.avgPriceReformed = 4200 €/m²
// pricing.avgPriceUnreformed = 3000 €/m²

// 3. Aplicar ajustes premium
const adjustments = {
  'atico': 15,      // +15%
  'terraza': 12     // +12%
};
const totalAdjustment = 15 + 12 = 27%; // +27%

// 4. Calcular precios ajustados
const adjustedReformed = 4200 * 1.27 = 5334 €/m²
const adjustedUnreformed = 3000 * 1.27 = 3810 €/m²

// 5. Usuario hace clic en "Aplicar a Calculadora"
router.push(`/dashboard?reformed=5334&unreformed=3810&neighborhood=chamberi`);
```

**Salida:** Redirección a calculadora con parámetros en URL

---

#### PASO 3: Cálculo en Calculadora (Dashboard)

**Entrada:** URL con parámetros + datos de propiedad

**Proceso:**
```typescript
// 1. Calculadora lee parámetros de URL
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const reformed = params.get('reformed');      // 5334
  const unreformed = params.get('unreformed');  // 3810
  const neighborhood = params.get('neighborhood'); // chamberi

  if (reformed && unreformed) {
    // 2. Usuario ingresa superficie en InputPanel
    const surface = 85; // m²

    // 3. Calcular precio de venta estimado
    // Usar precio reformado para la venta
    const estimatedSalePrice = surface * parseFloat(reformed);
    // 85 * 5334 = 453,390 €

    // 4. Actualizar propertyData
    setPropertyData({
      purchasePrice: 0, // Usuario lo ingresará
      surface: 85,
      salePrice: 453390,
      projectDuration: 12,
      location: 'Chamberí, Madrid'
    });
  }
}, []);

// 5. Usuario ingresa precio de compra
// Por ejemplo: 320,000 €

// 6. Hook useHouseFlippingCalculator calcula automáticamente
const calculations = calculateAll({
  propertyData: {
    purchasePrice: 320000,
    surface: 85,
    salePrice: 453390,
    projectDuration: 12,
    location: 'Chamberí, Madrid'
  },
  parameters: { /* 48 parámetros */ },
  options: { /* 6 opciones */ }
});

// Resultado:
calculations = {
  purchaseCosts: {
    itp: 32000,              // 10% de 320k
    notary: 1600,            // 0.5% de 320k
    registry: 1600,
    management: 300,
    valuation: 350,
    total: 35850
  },
  renovationCosts: {
    budget: 68000,           // 85m² * 800€/m²
    vat: 14280,              // 21% de 68k
    license: 2720,           // 4% de 68k
    architect: 2040,         // 3% de 68k
    total: 87040
  },
  maintenanceCosts: {
    community: 1200,         // 100€/mes * 12 meses
    insurance: 360,          // 30€/mes * 12 meses
    utilities: 600,          // 50€/mes * 12 meses
    ibi: 1600,              // 0.5% anual de 320k
    total: 3760
  },
  saleCosts: {
    commission: 16524,       // 3% * 1.21 de 453,390
    plusvalia: 1000,
    notary: 1360,           // 0.3% de 453,390
    management: 300,
    certificates: 350,
    total: 19534
  },
  totalInvestment: 466184,  // Suma de todos los costes
  grossProfit: -12794,      // 453,390 - 466,184
  corporateTax: 0,          // No hay impuesto si no hay beneficio
  netProfit: -12794,
  roi: -2.74,              // (-12,794 / 466,184) * 100
  annualizedRoi: -2.74,     // ROI / (12 meses / 12)
  viable: false             // ROI < umbral mínimo
};
```

**Salida:** Dashboard muestra:
- ResultsSummary: ROI -2.74%, NO VIABLE (rojo)
- CostBreakdown: Desglose detallado de los 466,184€
- Recomendación: "Negociar precio de compra más bajo o aumentar precio de venta"

---

#### PASO 4: Guardar Análisis

**Proceso:**
```typescript
// Usuario hace clic en "Guardar"
const handleSaveAnalysis = async () => {
  const response = await fetch('/api/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Análisis Chamberí - ${new Date().toLocaleDateString()}`,
      notes: 'Ático con terraza, necesita negociación de precio',
      purchasePrice: 320000,
      salePrice: 453390,
      surface: 85,
      duration: 12,
      location: 'Chamberí, Madrid',
      calculations: calculations, // JSON completo
      parameters: parameters,     // JSON con los 48 parámetros
      totalInvestment: 466184,
      netProfit: -12794,
      roi: -2.74,
      viable: false
    })
  });

  // Se guarda en tabla FlippingAnalysis
  // Asociado al usuario actual (via session)
};
```

---

### 3. Integración de Componentes React

#### Flujo de Props y State

```
┌─────────────────────────────────────────────────┐
│          app/dashboard/page.tsx                  │
│  (Página contenedora principal)                  │
└─────────────────────────────────────────────────┘
                    │
                    │ useHouseFlippingCalculator()
                    ↓
    ┌───────────────────────────────────────┐
    │  Hook centralizado de estado           │
    │  ├─ propertyData                       │
    │  ├─ parameters (48)                    │
    │  ├─ options (6)                        │
    │  ├─ calculations (calculado)           │
    │  └─ métodos: set*, reset               │
    └───────────────────────────────────────┘
         │          │            │
         │          │            │
   ┌─────┴────┐  ┌─┴──────┐  ┌─┴─────────┐
   │          │  │        │  │           │
   ↓          ↓  ↓        ↓  ↓           ↓
┌────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐
│Input   │ │Advanced  │ │Cost    │ │Results  │
│Panel   │ │Parameters│ │Breakdown│ │Summary  │
└────────┘ └──────────┘ └────────┘ └─────────┘
    │            │            │           │
    │            │            │           │
    └────────────┴────────────┴───────────┘
              │
              ↓
    [Todos comparten el mismo estado]
    [Cambios en uno afectan a todos]
```

#### Comunicación Entre Páginas

**Método 1: URL Parameters (Pricing Reference → Calculator)**
```typescript
// En pricing-reference/page.tsx
const params = new URLSearchParams({
  reformed: '5334',
  unreformed: '3810',
  neighborhood: 'chamberi'
});
router.push(`/dashboard?${params.toString()}`);

// En dashboard/page.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const reformed = params.get('reformed');
  if (reformed) {
    setPropertyData(prev => ({
      ...prev,
      salePrice: prev.surface * parseFloat(reformed)
    }));
  }
}, []);
```

**Método 2: Database (Feed Data → Pricing Reference)**
```typescript
// Feed Data guarda en ReferencePricing
await prisma.referencePricing.update({
  where: { neighborhood: 'chamberi' },
  data: { avgPriceReformed: newAverage }
});

// Pricing Reference lee automáticamente
const pricing = await prisma.referencePricing.findUnique({
  where: { neighborhood: 'chamberi' }
});
```

**Método 3: API Endpoints (Cross-section communication)**
```typescript
// Cualquier página puede acceder a datos vía API
const pricing = await fetch('/api/pricing/reference?neighborhood=chamberi');
const properties = await fetch('/api/properties?zone=chamberi');
const analyses = await fetch('/api/analysis');
```

---

### 4. Header Navigation (Conexión Visual)

**Ubicación:** `components/layout/DashboardHeader.tsx`

```tsx
export function DashboardHeader() {
  const pathname = usePathname();

  const links = [
    {
      href: '/dashboard',
      label: 'Calculadora',
      icon: Calculator,
      description: 'Analizar inversiones'
    },
    {
      href: '/dashboard/pricing-reference',
      label: 'Precios de Referencia',
      icon: DollarSign,
      description: 'Consultar precios por barrio'
    },
    {
      href: '/dashboard/feed-pricing-data',
      label: 'Alimentar Datos',
      icon: Database,
      description: 'Gestionar base de datos',
      adminOnly: true
    },
    {
      href: '/dashboard/search-agent',
      label: 'Buscar Propiedades',
      icon: Search,
      description: 'Explorar oportunidades'
    }
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Home className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold">House Flipper Pro</h1>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition ${
                  pathname === link.href
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <link.icon className="w-4 h-4 inline mr-2" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

**Integración en Layout:**
```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main>{children}</main>
    </div>
  );
}
```

---

### 5. Data Flow Diagram Completo

```
┌──────────────────────────────────────────────────────────────┐
│                    INICIO: SCRAPERS                          │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  /dashboard/feed-pricing-data                                │
│  ├─ Seleccionar scrapers (Idealista, Fotocasa, etc)         │
│  ├─ Ejecutar scraping automático                            │
│  └─ O importar URLs/texto manualmente                        │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
                    [API: POST /api/scraper/pricing]
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  lib/scraper/pricing-orchestrator.ts                         │
│  ├─ Ejecuta scrapers seleccionados                          │
│  ├─ Extrae: price, surface, neighborhood, wasReformed       │
│  └─ Guarda en Property table                                │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
                    [Trigger: After Insert]
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  lib/pricing/update-averages.ts                             │
│  ├─ Recalcula promedios por barrio                          │
│  ├─ Separa reformado vs sin reformar                        │
│  └─ Actualiza ReferencePricing table                        │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  DATOS DISPONIBLES EN BBDD                                   │
│  ReferencePricing: 169 barrios con precios actualizados     │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  /dashboard/pricing-reference                                │
│  ├─ Usuario selecciona barrio: "Chamberí"                   │
│  ├─ Usuario selecciona factores: Ático + Terraza            │
│  ├─ Sistema calcula: 4200€/m² * 1.27 = 5334€/m²            │
│  └─ Botón: "Aplicar a Calculadora"                          │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
                    [URL Params Transfer]
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  /dashboard (Calculadora)                                    │
│  ├─ Lee params: reformed=5334, unreformed=3810              │
│  ├─ Usuario ingresa: superficie=85m², compra=320k€          │
│  ├─ Hook calcula automáticamente con 48 parámetros          │
│  └─ Muestra: ROI, costes, viabilidad                        │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
                    [Usuario satisfecho]
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  Botón "Guardar Análisis"                                   │
│  └─ POST /api/analysis                                       │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  FlippingAnalysis table                                      │
│  ├─ Guarda todos los datos del análisis                     │
│  ├─ Asocia al usuario actual                                │
│  └─ Permite cargar análisis previos                         │
└──────────────────────────────────────────────────────────────┘
```

---

### 6. Estados Compartidos y Sincronización

#### Patrón de Estado Centralizado

```typescript
// Todos los componentes comparten este estado vía props
const centralState = {
  // Datos básicos de propiedad
  propertyData: {
    purchasePrice: number,
    surface: number,
    salePrice: number,
    projectDuration: number,
    location: string
  },

  // 48 parámetros de cálculo
  parameters: {
    // Compra (9)
    itpRate, notaryPurchaseRate, ...
    // Reforma (5)
    renovationPricePerM2, ...
    // Mantenimiento (4)
    communityFeeMonthly, ...
    // Venta (9)
    realEstateCommissionSaleRate, ...
    // Impuestos (1)
    corporateTaxRate
  },

  // 6 opciones booleanas
  options: {
    includeDueDiligence,
    includeRealEstateCommissionPurchase,
    includeFurniture,
    furnitureBudget,
    includeConstructionInsurance,
    includeHomeStaging
  },

  // Cálculos (computed)
  calculations: {
    purchaseCosts: {...},
    renovationCosts: {...},
    maintenanceCosts: {...},
    saleCosts: {...},
    totalInvestment,
    grossProfit,
    netProfit,
    roi,
    viable
  }
};
```

#### Flujo de Actualización

```
Usuario modifica input
        ↓
setPropertyData() o setParameters() o setOptions()
        ↓
Hook recalcula calculations automáticamente
        ↓
React re-renderiza componentes afectados
        ↓
Usuario ve resultados actualizados en tiempo real
```

---

### 7. Casos de Uso Integrados

#### Caso 1: Análisis Completo desde Cero

1. **Admin alimenta datos** (Feed Pricing Data)
   - Ejecuta scrapers de Idealista + Fotocasa
   - 500 propiedades nuevas → actualiza promedios

2. **Usuario consulta precios** (Pricing Reference)
   - Selecciona "Retiro"
   - Añade factores: Ático + Parking
   - Ve: 5200€/m² reformado, 3800€/m² sin reformar

3. **Usuario aplica a calculadora** (Dashboard)
   - URL params transfieren datos
   - Ingresa: 95m², compra 350k€
   - Sistema calcula precio venta: 95 * 5200 = 494k€

4. **Usuario ajusta parámetros** (AdvancedParameters)
   - Reduce presupuesto reforma a 700€/m²
   - Activa "Incluir Mobiliario" con 8000€
   - Ve ROI actualizado en tiempo real

5. **Usuario guarda análisis** (API)
   - Análisis guardado con todos los datos
   - Puede cargarlo más tarde desde sidebar

#### Caso 2: Comparativa de Barrios

1. Usuario en Pricing Reference selecciona "Salamanca"
2. Aplica a calculadora → analiza inversión
3. Vuelve a Pricing Reference, selecciona "Chamberí"
4. Aplica a calculadora → compara ROI
5. Decide barrio más rentable

#### Caso 3: Actualización Continua de Mercado

1. Scrapers ejecutan automáticamente cada noche (cron job)
2. BBDD se actualiza con nuevas propiedades
3. Promedios se recalculan automáticamente
4. Usuario siempre ve datos actualizados al consultar

---

### 8. Puntos Críticos de Integración

#### A. URL Parameters

**Desde:** Pricing Reference
**Hacia:** Dashboard
**Método:** `router.push()` con query string
**Datos transferidos:** reformed, unreformed, neighborhood

#### B. Database

**Desde:** Feed Pricing Data
**Hacia:** Pricing Reference
**Método:** Prisma updates/queries
**Datos transferidos:** avgPriceReformed, avgPriceUnreformed, sampleSize

#### C. React Props

**Desde:** Dashboard page
**Hacia:** Todos los componentes hijos
**Método:** Props drilling del hook centralizado
**Datos transferidos:** Todo el estado + métodos

#### D. API Calls

**Desde:** Cualquier página
**Hacia:** Backend
**Método:** fetch() con REST API
**Datos transferidos:** JSON con datos específicos

---

### 9. Validación de Integración

Para verificar que todo está correctamente integrado:

```typescript
// Test 1: Feed → Reference
// 1. Añadir propiedad en Feed Data
// 2. Verificar en Pricing Reference que el promedio cambió

// Test 2: Reference → Calculator
// 1. Seleccionar barrio + factores en Reference
// 2. Hacer clic en "Aplicar"
// 3. Verificar que Dashboard muestra datos correctos

// Test 3: Calculator → Save → Load
// 1. Hacer análisis completo en Calculator
// 2. Guardar
// 3. Cargar desde lista
// 4. Verificar que todos los datos persisten

// Test 4: Parámetros → Cálculos
// 1. Modificar cualquier parámetro en AdvancedParameters
// 2. Verificar que calculations se actualiza
// 3. Verificar que ResultsSummary muestra nuevo ROI

// Test 5: End-to-End
// 1. Scraper captura propiedades
// 2. Actualiza BBDD
// 3. Usuario consulta precios
// 4. Aplica a calculadora
// 5. Modifica parámetros
// 6. Guarda análisis
// 7. Exporta a PDF
```

---

## Resumen Final

El sistema House Flipper Pro funciona como un ciclo cerrado:

1. **Datos entran** via scrapers/manual (Feed Pricing Data)
2. **Datos se procesan** y promedian por barrio (Backend)
3. **Usuarios consultan** precios ajustados (Pricing Reference)
4. **Usuarios analizan** inversiones con datos reales (Calculator)
5. **Usuarios guardan** análisis para comparar (Database)
6. **Ciclo se repite** con datos actualizados continuamente

Cada sección está **desacoplada pero conectada**:
- Pueden funcionar independientemente
- Se comunican via URL params, Database, o API
- Comparten diseño y patrones de UI consistentes
- Mantienen estado sincronizado en tiempo real

