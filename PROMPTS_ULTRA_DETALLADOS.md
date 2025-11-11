# PROMPTS ULTRA DETALLADOS - House Flipper Pro

Documentación exhaustiva con TODOS los detalles visuales, textos, botones, parámetros y comportamientos de cada sección.

---

# PROMPT 1: CALCULADORA DE INVERSIÓN (DASHBOARD PRINCIPAL)

## CONTEXTO TÉCNICO COMPLETO

### Stack Tecnológico
```yaml
Framework: Next.js 15.5.6
React: 19.0.0
Node: >= 18.17.0
TypeScript: 5.3.3
Styling: TailwindCSS 3.4.1
UI Components: shadcn/ui (Card, Button, Input, Label, Tabs)
Icons: lucide-react 0.263.1
Database: PostgreSQL + Prisma 5.8.1
Auth: NextAuth.js v5 (beta)
```

### Estructura de Carpetas
```
house-flipper-agent/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                 ← PÁGINA PRINCIPAL QUE VAMOS A MODIFICAR
│   │   └── layout.tsx
├── components/
│   ├── house-flipping/
│   │   ├── InputPanel.tsx           ← YA EXISTE (3 tabs)
│   │   ├── CostBreakdown.tsx        ← YA EXISTE
│   │   ├── ResultsSummary.tsx       ← YA EXISTE
│   │   └── AdvancedParameters.tsx   ← NUEVO COMPONENTE A CREAR
│   └── ui/                          ← shadcn/ui components
│       ├── card.tsx
│       ├── button.tsx
│       ├── input.tsx
│       └── label.tsx
├── hooks/
│   └── useHouseFlippingCalculator.ts ← HOOK PRINCIPAL (YA EXISTE)
└── lib/
    └── utils.ts
```

---

## PARTE 1: HOOK DE ESTADO (YA EXISTE)

**Archivo:** `hooks/useHouseFlippingCalculator.ts`

Este hook YA ESTÁ implementado y NO debes modificarlo. Solo necesitas entenderlo para usarlo correctamente.

### Estructura Completa del Hook

```typescript
export function useHouseFlippingCalculator() {
  // ============================================
  // ESTADO 1: PROPERTY DATA (Datos básicos)
  // ============================================
  const [propertyData, setPropertyData] = useState({
    purchasePrice: 0,      // Precio de compra en euros
    surface: 0,            // Superficie en m²
    salePrice: 0,          // Precio de venta estimado en euros
    projectDuration: 12,   // Duración del proyecto en meses
    location: '',          // Ubicación (barrio, distrito)
  });

  // ============================================
  // ESTADO 2: PARAMETERS (48 parámetros)
  // ============================================
  const [parameters, setParameters] = useState({

    // ───────────────────────────────────────
    // CATEGORÍA 1: COMPRA (9 parámetros)
    // ───────────────────────────────────────
    itpRate: 10,
    // Nombre: "ITP"
    // Descripción: "Impuesto de Transmisiones Patrimoniales"
    // Tipo: Porcentaje
    // Rango: 6-11%
    // Default: 10% (Madrid 2025)
    // Aplicado sobre: purchasePrice

    notaryPurchaseRate: 0.5,
    // Nombre: "Notaría Compra"
    // Descripción: "Gastos de notaría en la compra"
    // Tipo: Porcentaje
    // Rango: 0.2-0.5%
    // Default: 0.5%
    // Aplicado sobre: purchasePrice

    notaryPurchaseMin: 600,
    // Nombre: "Notaría Mínimo"
    // Descripción: "Coste mínimo de notaría"
    // Tipo: Cantidad fija en euros
    // Rango: 400-800€
    // Default: 600€

    registryRate: 0.5,
    // Nombre: "Registro de la Propiedad"
    // Descripción: "Gastos de registro de propiedad"
    // Tipo: Porcentaje
    // Rango: 0.3-0.5%
    // Default: 0.5%
    // Aplicado sobre: purchasePrice

    registryMin: 400,
    // Nombre: "Registro Mínimo"
    // Descripción: "Coste mínimo de registro"
    // Tipo: Cantidad fija en euros
    // Rango: 300-500€
    // Default: 400€

    managementFee: 300,
    // Nombre: "Gestoría"
    // Descripción: "Honorarios de gestoría administrativa"
    // Tipo: Cantidad fija en euros
    // Rango: 200-500€
    // Default: 300€

    valuationFee: 350,
    // Nombre: "Tasación"
    // Descripción: "Coste de tasación oficial del inmueble"
    // Tipo: Cantidad fija en euros
    // Rango: 250-500€
    // Default: 350€

    dueDiligenceFee: 500,
    // Nombre: "Due Diligence"
    // Descripción: "Auditoría legal y técnica del inmueble"
    // Tipo: Cantidad fija en euros
    // Rango: 300-1000€
    // Default: 500€
    // Nota: Solo se aplica si options.includeDueDiligence = true

    realEstateCommissionPurchaseRate: 3,
    // Nombre: "Comisión Inmobiliaria Compra"
    // Descripción: "Comisión de agencia inmobiliaria en compra"
    // Tipo: Porcentaje
    // Rango: 2-5%
    // Default: 3%
    // Aplicado sobre: purchasePrice
    // Nota: Solo se aplica si options.includeRealEstateCommissionPurchase = true

    // ───────────────────────────────────────
    // CATEGORÍA 2: REFORMA (5 parámetros)
    // ───────────────────────────────────────
    renovationPricePerM2: 800,
    // Nombre: "Precio Reforma por m²"
    // Descripción: "Coste de reforma por metro cuadrado"
    // Tipo: Euros por m²
    // Rango: 400-1500€/m²
    // Default: 800€/m² (reforma media-alta en Madrid)
    // Nota: Calidad baja 400-600, media 600-900, alta 900-1500

    renovationVatRate: 21,
    // Nombre: "IVA Reforma"
    // Descripción: "IVA aplicado a trabajos de reforma"
    // Tipo: Porcentaje
    // Rango: 10-21%
    // Default: 21% (tipo general)
    // Nota: 10% para vivienda habitual con más de 2 años

    constructionLicenseRate: 4,
    // Nombre: "Licencia de Obra"
    // Descripción: "Tasa municipal por licencia de obras"
    // Tipo: Porcentaje
    // Rango: 3-5%
    // Default: 4%
    // Aplicado sobre: presupuesto de reforma

    architectProjectRate: 3,
    // Nombre: "Proyecto de Arquitecto"
    // Descripción: "Honorarios de proyecto técnico"
    // Tipo: Porcentaje
    // Rango: 2-5%
    // Default: 3%
    // Aplicado sobre: presupuesto de reforma

    constructionInsuranceRate: 1.5,
    // Nombre: "Seguro de Obra"
    // Descripción: "Seguro decenal y responsabilidad civil"
    // Tipo: Porcentaje
    // Rango: 1-2%
    // Default: 1.5%
    // Aplicado sobre: presupuesto de reforma
    // Nota: Solo se aplica si options.includeConstructionInsurance = true

    // ───────────────────────────────────────
    // CATEGORÍA 3: MANTENIMIENTO (4 parámetros)
    // ───────────────────────────────────────
    communityFeeMonthly: 100,
    // Nombre: "Cuota Comunidad Mensual"
    // Descripción: "Gastos de comunidad de propietarios"
    // Tipo: Euros por mes
    // Rango: 30-300€/mes
    // Default: 100€/mes
    // Multiplicado por: projectDuration (meses)

    insuranceMonthly: 30,
    // Nombre: "Seguro Hogar Mensual"
    // Descripción: "Seguro de hogar durante proyecto"
    // Tipo: Euros por mes
    // Rango: 20-50€/mes
    // Default: 30€/mes
    // Multiplicado por: projectDuration (meses)

    utilitiesMonthly: 50,
    // Nombre: "Suministros Mensual"
    // Descripción: "Agua, luz, gas durante reforma"
    // Tipo: Euros por mes
    // Rango: 30-100€/mes
    // Default: 50€/mes
    // Multiplicado por: projectDuration (meses)

    ibiAnnualRate: 0.5,
    // Nombre: "IBI Anual"
    // Descripción: "Impuesto sobre Bienes Inmuebles"
    // Tipo: Porcentaje anual
    // Rango: 0.4-1.3%
    // Default: 0.5% (media Madrid)
    // Aplicado sobre: purchasePrice
    // Prorrateado por: projectDuration / 12

    // ───────────────────────────────────────
    // CATEGORÍA 4: VENTA (9 parámetros)
    // ───────────────────────────────────────
    realEstateCommissionSaleRate: 3,
    // Nombre: "Comisión Inmobiliaria Venta"
    // Descripción: "Comisión de agencia en la venta"
    // Tipo: Porcentaje
    // Rango: 2-5%
    // Default: 3%
    // Aplicado sobre: salePrice
    // Nota: Se suma IVA 21% a la comisión

    plusvaliaMunicipal: 1000,
    // Nombre: "Plusvalía Municipal"
    // Descripción: "Impuesto municipal sobre incremento de valor"
    // Tipo: Cantidad fija en euros
    // Rango: 500-5000€
    // Default: 1000€
    // Nota: Depende de años de tenencia y valor catastral

    notarySaleRate: 0.3,
    // Nombre: "Notaría Venta"
    // Descripción: "Gastos de notaría en la venta"
    // Tipo: Porcentaje
    // Rango: 0.2-0.4%
    // Default: 0.3%
    // Aplicado sobre: salePrice

    notarySaleMin: 800,
    // Nombre: "Notaría Venta Mínimo"
    // Descripción: "Coste mínimo de notaría en venta"
    // Tipo: Cantidad fija en euros
    // Rango: 600-1000€
    // Default: 800€

    managementSaleFee: 300,
    // Nombre: "Gestoría Venta"
    // Descripción: "Honorarios de gestoría en venta"
    // Tipo: Cantidad fija en euros
    // Rango: 200-500€
    // Default: 300€

    energyCertificate: 150,
    // Nombre: "Certificado Energético"
    // Descripción: "Certificado de eficiencia energética"
    // Tipo: Cantidad fija en euros
    // Rango: 100-300€
    // Default: 150€
    // Nota: Obligatorio para vender

    habitabilityCertificate: 200,
    // Nombre: "Cédula de Habitabilidad"
    // Descripción: "Certificado de habitabilidad"
    // Tipo: Cantidad fija en euros
    // Rango: 150-300€
    // Default: 200€
    // Nota: Obligatorio en algunas comunidades autónomas

    homeStagingFee: 2000,
    // Nombre: "Home Staging"
    // Descripción: "Puesta en escena del inmueble"
    // Tipo: Cantidad fija en euros
    // Rango: 1000-5000€
    // Default: 2000€
    // Nota: Solo se aplica si options.includeHomeStaging = true

    marketingFee: 500,
    // Nombre: "Marketing y Publicidad"
    // Descripción: "Fotografía profesional, anuncios, etc."
    // Tipo: Cantidad fija en euros
    // Rango: 300-1000€
    // Default: 500€

    // ───────────────────────────────────────
    // CATEGORÍA 5: IMPUESTOS (1 parámetro)
    // ───────────────────────────────────────
    corporateTaxRate: 25,
    // Nombre: "Impuesto de Sociedades"
    // Descripción: "Impuesto sobre beneficios"
    // Tipo: Porcentaje
    // Rango: 15-30%
    // Default: 25% (tipo general España)
    // Aplicado sobre: grossProfit (solo si positivo)
    // Nota: 15% para pequeñas empresas, 30% para grandes
  });

  // ============================================
  // ESTADO 3: OPTIONS (6 opciones booleanas)
  // ============================================
  const [options, setOptions] = useState({

    includeDueDiligence: false,
    // Nombre: "Incluir Due Diligence"
    // Descripción: "Auditoría legal y técnica del inmueble"
    // Default: false (no incluido)
    // Impacto: Añade dueDiligenceFee (500€) a costes de compra

    includeRealEstateCommissionPurchase: false,
    // Nombre: "Incluir Comisión Inmobiliaria Compra"
    // Descripción: "Comisión de agencia en la compra"
    // Default: false (no incluido)
    // Impacto: Añade 3% del purchasePrice a costes de compra

    includeFurniture: false,
    // Nombre: "Incluir Mobiliario"
    // Descripción: "Amueblar la propiedad"
    // Default: false (no incluido)
    // Impacto: Añade furnitureBudget a costes de reforma

    furnitureBudget: 5000,
    // Nombre: "Presupuesto Mobiliario"
    // Descripción: "Cantidad a invertir en muebles"
    // Tipo: Euros
    // Default: 5000€
    // Solo aplica si: includeFurniture = true

    includeConstructionInsurance: true,
    // Nombre: "Incluir Seguro de Obra"
    // Descripción: "Seguro decenal y RC durante obra"
    // Default: true (incluido)
    // Impacto: Añade 1.5% del presupuesto de reforma

    includeHomeStaging: false,
    // Nombre: "Incluir Home Staging"
    // Descripción: "Puesta en escena para venta"
    // Default: false (no incluido)
    // Impacto: Añade homeStagingFee (2000€) a costes de venta
  });

  // ============================================
  // ESTADO 4: CALCULATIONS (Auto-calculado)
  // ============================================
  const calculations = useMemo(() => {
    // Este cálculo se ejecuta automáticamente cada vez que
    // cambia propertyData, parameters u options

    const purchaseCosts = {
      itp: propertyData.purchasePrice * (parameters.itpRate / 100),
      notary: Math.max(
        propertyData.purchasePrice * (parameters.notaryPurchaseRate / 100),
        parameters.notaryPurchaseMin
      ),
      registry: Math.max(
        propertyData.purchasePrice * (parameters.registryRate / 100),
        parameters.registryMin
      ),
      management: parameters.managementFee,
      valuation: parameters.valuationFee,
      dueDiligence: options.includeDueDiligence ? parameters.dueDiligenceFee : 0,
      commissionPurchase: options.includeRealEstateCommissionPurchase
        ? propertyData.purchasePrice * (parameters.realEstateCommissionPurchaseRate / 100)
        : 0,
      total: 0 // Se calcula después
    };
    purchaseCosts.total = Object.values(purchaseCosts).reduce((a, b) => a + b, 0) - purchaseCosts.total;

    const renovationCosts = {
      budget: propertyData.surface * parameters.renovationPricePerM2,
      vat: 0, // Se calcula después
      license: 0, // Se calcula después
      architect: 0, // Se calcula después
      insurance: 0, // Se calcula después
      furniture: options.includeFurniture ? options.furnitureBudget : 0,
      total: 0
    };
    renovationCosts.vat = renovationCosts.budget * (parameters.renovationVatRate / 100);
    renovationCosts.license = renovationCosts.budget * (parameters.constructionLicenseRate / 100);
    renovationCosts.architect = renovationCosts.budget * (parameters.architectProjectRate / 100);
    renovationCosts.insurance = options.includeConstructionInsurance
      ? renovationCosts.budget * (parameters.constructionInsuranceRate / 100)
      : 0;
    renovationCosts.total = Object.values(renovationCosts).reduce((a, b) => a + b, 0) - renovationCosts.total;

    const maintenanceCosts = {
      community: parameters.communityFeeMonthly * propertyData.projectDuration,
      insurance: parameters.insuranceMonthly * propertyData.projectDuration,
      utilities: parameters.utilitiesMonthly * propertyData.projectDuration,
      ibi: (propertyData.purchasePrice * (parameters.ibiAnnualRate / 100)) * (propertyData.projectDuration / 12),
      total: 0
    };
    maintenanceCosts.total = Object.values(maintenanceCosts).reduce((a, b) => a + b, 0) - maintenanceCosts.total;

    const saleCosts = {
      commission: (propertyData.salePrice * (parameters.realEstateCommissionSaleRate / 100)) * 1.21, // +IVA
      plusvalia: parameters.plusvaliaMunicipal,
      notary: Math.max(
        propertyData.salePrice * (parameters.notarySaleRate / 100),
        parameters.notarySaleMin
      ),
      management: parameters.managementSaleFee,
      energyCertificate: parameters.energyCertificate,
      habitabilityCertificate: parameters.habitabilityCertificate,
      homeStaging: options.includeHomeStaging ? parameters.homeStagingFee : 0,
      marketing: parameters.marketingFee,
      total: 0
    };
    saleCosts.total = Object.values(saleCosts).reduce((a, b) => a + b, 0) - saleCosts.total;

    const totalInvestment = purchaseCosts.total + renovationCosts.total + maintenanceCosts.total + saleCosts.total;
    const grossProfit = propertyData.salePrice - totalInvestment;
    const corporateTax = grossProfit > 0 ? grossProfit * (parameters.corporateTaxRate / 100) : 0;
    const netProfit = grossProfit - corporateTax;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    const annualizedRoi = propertyData.projectDuration > 0 ? roi * (12 / propertyData.projectDuration) : 0;
    const viable = roi >= 15; // Umbral de viabilidad: 15% ROI

    return {
      purchaseCosts,
      renovationCosts,
      maintenanceCosts,
      saleCosts,
      totalInvestment,
      grossProfit,
      corporateTax,
      netProfit,
      roi,
      annualizedRoi,
      viable
    };
  }, [propertyData, parameters, options]);

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================
  return {
    propertyData,
    setPropertyData,
    parameters,
    setParameters,
    options,
    setOptions,
    calculations,
    resetToDefaults: () => {
      // Restaura todos los valores a los defaults de Madrid 2025
      setParameters({ /* valores arriba indicados */ });
      setOptions({ /* valores arriba indicados */ });
    }
  };
}
```

---

## PARTE 2: COMPONENTE ADVANCEDPARAMETERS (NUEVO)

**Archivo a crear:** `components/house-flipping/AdvancedParameters.tsx`

### Diseño Visual Completo

```
┌────────────────────────────────────────────────────────────────────┐
│  ⚙️ Parámetros Avanzados de Cálculo                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ 💰 Costes de Compra                              ▼          │   │
│  └───────────────────────────────────────────────────────────┘   │
│  │                                                              │   │
│  │  [ITP (%)]  [Notaría (%)]  [Notaría Mín (€)]              │   │
│  │  [Registro (%)]  [Registro Mín (€)]  [Gestoría (€)]       │   │
│  │  [Tasación (€)]                                            │   │
│  │                                                              │   │
│  │  ☐ Incluir Due Diligence (500€)                            │   │
│  │  ☐ Incluir Comisión Inmobiliaria Compra (3%)               │   │
│  └──────────────────────────────────────────────────────────────┘
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ 🔧 Costes de Reforma                             ▶          │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ 🏠 Mantenimiento Durante Proyecto                ▶          │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ 📈 Costes de Venta                               ▶          │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ 💼 Impuestos                                     ▶          │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│  Valores por defecto configurados para Madrid 2025                 │
│                                  [↻ Restaurar Valores por Defecto] │
└────────────────────────────────────────────────────────────────────┘
```

### Código Completo del Componente

```typescript
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════
// INTERFACE DE PROPS
// ═══════════════════════════════════════════════════════════
interface AdvancedParametersProps {
  parameters: {
    // Compra (9)
    itpRate: number;
    notaryPurchaseRate: number;
    notaryPurchaseMin: number;
    registryRate: number;
    registryMin: number;
    managementFee: number;
    valuationFee: number;
    dueDiligenceFee: number;
    realEstateCommissionPurchaseRate: number;
    // Reforma (5)
    renovationPricePerM2: number;
    renovationVatRate: number;
    constructionLicenseRate: number;
    architectProjectRate: number;
    constructionInsuranceRate: number;
    // Mantenimiento (4)
    communityFeeMonthly: number;
    insuranceMonthly: number;
    utilitiesMonthly: number;
    ibiAnnualRate: number;
    // Venta (9)
    realEstateCommissionSaleRate: number;
    plusvaliaMunicipal: number;
    notarySaleRate: number;
    notarySaleMin: number;
    managementSaleFee: number;
    energyCertificate: number;
    habitabilityCertificate: number;
    homeStagingFee: number;
    marketingFee: number;
    // Impuestos (1)
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
  onParametersChange: (params: any) => void;
  onOptionsChange: (options: any) => void;
  onReset: () => void;
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export function AdvancedParameters({
  parameters,
  options,
  onParametersChange,
  onOptionsChange,
  onReset
}: AdvancedParametersProps) {

  // ───────────────────────────────────────────────────────
  // ESTADO LOCAL: Secciones expandidas/colapsadas
  // ───────────────────────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState({
    compra: true,        // Por defecto: EXPANDIDA
    reforma: false,      // Por defecto: COLAPSADA
    mantenimiento: false,
    venta: false,
    impuestos: false
  });

  // ───────────────────────────────────────────────────────
  // FUNCIÓN: Toggle sección (expandir/colapsar)
  // ───────────────────────────────────────────────────────
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ───────────────────────────────────────────────────────
  // FUNCIÓN: Actualizar un parámetro individual
  // ───────────────────────────────────────────────────────
  const handleParameterChange = (key: string, value: number) => {
    onParametersChange({
      ...parameters,
      [key]: value
    });
  };

  // ───────────────────────────────────────────────────────
  // FUNCIÓN: Actualizar una opción individual
  // ───────────────────────────────────────────────────────
  const handleOptionChange = (key: string, value: boolean | number) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">

        {/* ═══════════════════════════════════════════════ */}
        {/* TÍTULO PRINCIPAL                                */}
        {/* ═══════════════════════════════════════════════ */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚙️ Parámetros Avanzados de Cálculo
        </h3>

        <div className="space-y-4">

          {/* ╔════════════════════════════════════════════╗ */}
          {/* ║  SECCIÓN 1: COSTES DE COMPRA               ║ */}
          {/* ╚════════════════════════════════════════════╝ */}
          <div className="border-l-4 border-blue-200 pl-4">

            {/* ─────────────────────────────────────────── */}
            {/* HEADER CLICKEABLE                           */}
            {/* ─────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection('compra')}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <h4 className="font-semibold text-gray-900">
                  Costes de Compra
                </h4>
                <span className="text-xs text-gray-500">
                  (9 parámetros)
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSections.compra ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* ─────────────────────────────────────────── */}
            {/* CONTENIDO EXPANDIBLE                        */}
            {/* ─────────────────────────────────────────── */}
            {expandedSections.compra && (
              <div className="mt-3 space-y-4">

                {/* Grid de inputs (3 columnas en desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* INPUT 1: ITP */}
                  <div>
                    <Label htmlFor="itpRate" className="text-sm font-medium">
                      ITP (%)
                    </Label>
                    <Input
                      id="itpRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={parameters.itpRate}
                      onChange={(e) => handleParameterChange('itpRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Impuesto Transmisiones Patrimoniales
                    </p>
                  </div>

                  {/* INPUT 2: Notaría Compra */}
                  <div>
                    <Label htmlFor="notaryPurchaseRate" className="text-sm font-medium">
                      Notaría Compra (%)
                    </Label>
                    <Input
                      id="notaryPurchaseRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={parameters.notaryPurchaseRate}
                      onChange={(e) => handleParameterChange('notaryPurchaseRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Gastos notariales en compra
                    </p>
                  </div>

                  {/* INPUT 3: Notaría Mínimo */}
                  <div>
                    <Label htmlFor="notaryPurchaseMin" className="text-sm font-medium">
                      Notaría Mínimo (€)
                    </Label>
                    <Input
                      id="notaryPurchaseMin"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.notaryPurchaseMin}
                      onChange={(e) => handleParameterChange('notaryPurchaseMin', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Coste mínimo de notaría
                    </p>
                  </div>

                  {/* INPUT 4: Registro */}
                  <div>
                    <Label htmlFor="registryRate" className="text-sm font-medium">
                      Registro de la Propiedad (%)
                    </Label>
                    <Input
                      id="registryRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={parameters.registryRate}
                      onChange={(e) => handleParameterChange('registryRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Inscripción en registro
                    </p>
                  </div>

                  {/* INPUT 5: Registro Mínimo */}
                  <div>
                    <Label htmlFor="registryMin" className="text-sm font-medium">
                      Registro Mínimo (€)
                    </Label>
                    <Input
                      id="registryMin"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.registryMin}
                      onChange={(e) => handleParameterChange('registryMin', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Coste mínimo de registro
                    </p>
                  </div>

                  {/* INPUT 6: Gestoría */}
                  <div>
                    <Label htmlFor="managementFee" className="text-sm font-medium">
                      Gestoría (€)
                    </Label>
                    <Input
                      id="managementFee"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.managementFee}
                      onChange={(e) => handleParameterChange('managementFee', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Honorarios gestoría
                    </p>
                  </div>

                  {/* INPUT 7: Tasación */}
                  <div>
                    <Label htmlFor="valuationFee" className="text-sm font-medium">
                      Tasación (€)
                    </Label>
                    <Input
                      id="valuationFee"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.valuationFee}
                      onChange={(e) => handleParameterChange('valuationFee', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tasación oficial del inmueble
                    </p>
                  </div>

                  {/* INPUT 8: Due Diligence (solo si checkbox activo) */}
                  {options.includeDueDiligence && (
                    <div>
                      <Label htmlFor="dueDiligenceFee" className="text-sm font-medium">
                        Due Diligence (€)
                      </Label>
                      <Input
                        id="dueDiligenceFee"
                        type="number"
                        step="50"
                        min="0"
                        value={parameters.dueDiligenceFee}
                        onChange={(e) => handleParameterChange('dueDiligenceFee', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Auditoría legal y técnica
                      </p>
                    </div>
                  )}

                  {/* INPUT 9: Comisión Compra (solo si checkbox activo) */}
                  {options.includeRealEstateCommissionPurchase && (
                    <div>
                      <Label htmlFor="realEstateCommissionPurchaseRate" className="text-sm font-medium">
                        Comisión Inmobiliaria Compra (%)
                      </Label>
                      <Input
                        id="realEstateCommissionPurchaseRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parameters.realEstateCommissionPurchaseRate}
                        onChange={(e) => handleParameterChange('realEstateCommissionPurchaseRate', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comisión de agencia
                      </p>
                    </div>
                  )}
                </div>

                {/* ─────────────────────────────────────── */}
                {/* CHECKBOXES DE OPCIONES                  */}
                {/* ─────────────────────────────────────── */}
                <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Opciones adicionales:
                  </p>

                  {/* CHECKBOX 1: Due Diligence */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeDueDiligence"
                      checked={options.includeDueDiligence}
                      onChange={(e) => handleOptionChange('includeDueDiligence', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="includeDueDiligence" className="text-sm cursor-pointer">
                      Incluir Due Diligence
                    </Label>
                  </div>

                  {/* CHECKBOX 2: Comisión Compra */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeRealEstateCommissionPurchase"
                      checked={options.includeRealEstateCommissionPurchase}
                      onChange={(e) => handleOptionChange('includeRealEstateCommissionPurchase', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="includeRealEstateCommissionPurchase" className="text-sm cursor-pointer">
                      Incluir Comisión de Compra
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ╔════════════════════════════════════════════╗ */}
          {/* ║  SECCIÓN 2: COSTES DE REFORMA              ║ */}
          {/* ╚════════════════════════════════════════════╝ */}
          <div className="border-l-4 border-orange-200 pl-4">

            {/* Header */}
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection('reforma')}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🔧</span>
                <h4 className="font-semibold text-gray-900">
                  Costes de Reforma
                </h4>
                <span className="text-xs text-gray-500">
                  (5 parámetros)
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSections.reforma ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Contenido */}
            {expandedSections.reforma && (
              <div className="mt-3 space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* INPUT 1: Precio Reforma por m² */}
                  <div>
                    <Label htmlFor="renovationPricePerM2" className="text-sm font-medium">
                      Precio Reforma por m² (€/m²)
                    </Label>
                    <Input
                      id="renovationPricePerM2"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.renovationPricePerM2}
                      onChange={(e) => handleParameterChange('renovationPricePerM2', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Coste de reforma por m²
                    </p>
                  </div>

                  {/* INPUT 2: IVA Reforma */}
                  <div>
                    <Label htmlFor="renovationVatRate" className="text-sm font-medium">
                      IVA Reforma (%)
                    </Label>
                    <Input
                      id="renovationVatRate"
                      type="number"
                      step="1"
                      min="0"
                      max="21"
                      value={parameters.renovationVatRate}
                      onChange={(e) => handleParameterChange('renovationVatRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      IVA sobre trabajos (10% o 21%)
                    </p>
                  </div>

                  {/* INPUT 3: Licencia de Obra */}
                  <div>
                    <Label htmlFor="constructionLicenseRate" className="text-sm font-medium">
                      Licencia de Obra (%)
                    </Label>
                    <Input
                      id="constructionLicenseRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={parameters.constructionLicenseRate}
                      onChange={(e) => handleParameterChange('constructionLicenseRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tasa municipal de obras
                    </p>
                  </div>

                  {/* INPUT 4: Proyecto Arquitecto */}
                  <div>
                    <Label htmlFor="architectProjectRate" className="text-sm font-medium">
                      Proyecto de Arquitecto (%)
                    </Label>
                    <Input
                      id="architectProjectRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={parameters.architectProjectRate}
                      onChange={(e) => handleParameterChange('architectProjectRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Honorarios proyecto técnico
                    </p>
                  </div>

                  {/* INPUT 5: Seguro de Obra (solo si checkbox activo) */}
                  {options.includeConstructionInsurance && (
                    <div>
                      <Label htmlFor="constructionInsuranceRate" className="text-sm font-medium">
                        Seguro de Obra (%)
                      </Label>
                      <Input
                        id="constructionInsuranceRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={parameters.constructionInsuranceRate}
                        onChange={(e) => handleParameterChange('constructionInsuranceRate', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Seguro decenal y RC
                      </p>
                    </div>
                  )}
                </div>

                {/* Opciones */}
                <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Opciones adicionales:
                  </p>

                  {/* CHECKBOX 3: Seguro de Obra */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeConstructionInsurance"
                      checked={options.includeConstructionInsurance}
                      onChange={(e) => handleOptionChange('includeConstructionInsurance', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="includeConstructionInsurance" className="text-sm cursor-pointer">
                      Incluir Seguro de Obra
                    </Label>
                  </div>

                  {/* CHECKBOX 4: Mobiliario */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeFurniture"
                      checked={options.includeFurniture}
                      onChange={(e) => handleOptionChange('includeFurniture', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="includeFurniture" className="text-sm cursor-pointer">
                      Incluir Mobiliario
                    </Label>
                  </div>

                  {/* INPUT CONDICIONAL: Presupuesto Mobiliario */}
                  {options.includeFurniture && (
                    <div className="ml-6 mt-2">
                      <Label htmlFor="furnitureBudget" className="text-sm font-medium">
                        Presupuesto Mobiliario (€)
                      </Label>
                      <Input
                        id="furnitureBudget"
                        type="number"
                        step="100"
                        min="0"
                        value={options.furnitureBudget}
                        onChange={(e) => handleOptionChange('furnitureBudget', parseFloat(e.target.value) || 0)}
                        className="mt-1 w-64"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ╔════════════════════════════════════════════╗ */}
          {/* ║  SECCIÓN 3: MANTENIMIENTO                  ║ */}
          {/* ╚════════════════════════════════════════════╝ */}
          <div className="border-l-4 border-green-200 pl-4">

            {/* Header */}
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection('mantenimiento')}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span>
                <h4 className="font-semibold text-gray-900">
                  Mantenimiento Durante Proyecto
                </h4>
                <span className="text-xs text-gray-500">
                  (4 parámetros)
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSections.mantenimiento ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Contenido */}
            {expandedSections.mantenimiento && (
              <div className="mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* INPUT 1: Cuota Comunidad */}
                  <div>
                    <Label htmlFor="communityFeeMonthly" className="text-sm font-medium">
                      Cuota Comunidad Mensual (€/mes)
                    </Label>
                    <Input
                      id="communityFeeMonthly"
                      type="number"
                      step="5"
                      min="0"
                      value={parameters.communityFeeMonthly}
                      onChange={(e) => handleParameterChange('communityFeeMonthly', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Gastos de comunidad
                    </p>
                  </div>

                  {/* INPUT 2: Seguro Hogar */}
                  <div>
                    <Label htmlFor="insuranceMonthly" className="text-sm font-medium">
                      Seguro Hogar Mensual (€/mes)
                    </Label>
                    <Input
                      id="insuranceMonthly"
                      type="number"
                      step="5"
                      min="0"
                      value={parameters.insuranceMonthly}
                      onChange={(e) => handleParameterChange('insuranceMonthly', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Seguro durante proyecto
                    </p>
                  </div>

                  {/* INPUT 3: Suministros */}
                  <div>
                    <Label htmlFor="utilitiesMonthly" className="text-sm font-medium">
                      Suministros Mensual (€/mes)
                    </Label>
                    <Input
                      id="utilitiesMonthly"
                      type="number"
                      step="5"
                      min="0"
                      value={parameters.utilitiesMonthly}
                      onChange={(e) => handleParameterChange('utilitiesMonthly', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Agua, luz, gas
                    </p>
                  </div>

                  {/* INPUT 4: IBI Anual */}
                  <div>
                    <Label htmlFor="ibiAnnualRate" className="text-sm font-medium">
                      IBI Anual (%)
                    </Label>
                    <Input
                      id="ibiAnnualRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="2"
                      value={parameters.ibiAnnualRate}
                      onChange={(e) => handleParameterChange('ibiAnnualRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Impuesto sobre Bienes Inmuebles
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ╔════════════════════════════════════════════╗ */}
          {/* ║  SECCIÓN 4: COSTES DE VENTA                ║ */}
          {/* ╚════════════════════════════════════════════╝ */}
          <div className="border-l-4 border-purple-200 pl-4">

            {/* Header */}
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection('venta')}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <h4 className="font-semibold text-gray-900">
                  Costes de Venta
                </h4>
                <span className="text-xs text-gray-500">
                  (9 parámetros)
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSections.venta ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Contenido */}
            {expandedSections.venta && (
              <div className="mt-3 space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* INPUT 1: Comisión Venta */}
                  <div>
                    <Label htmlFor="realEstateCommissionSaleRate" className="text-sm font-medium">
                      Comisión Inmobiliaria Venta (%)
                    </Label>
                    <Input
                      id="realEstateCommissionSaleRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={parameters.realEstateCommissionSaleRate}
                      onChange={(e) => handleParameterChange('realEstateCommissionSaleRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comisión + 21% IVA
                    </p>
                  </div>

                  {/* INPUT 2: Plusvalía */}
                  <div>
                    <Label htmlFor="plusvaliaMunicipal" className="text-sm font-medium">
                      Plusvalía Municipal (€)
                    </Label>
                    <Input
                      id="plusvaliaMunicipal"
                      type="number"
                      step="50"
                      min="0"
                      value={parameters.plusvaliaMunicipal}
                      onChange={(e) => handleParameterChange('plusvaliaMunicipal', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Impuesto municipal
                    </p>
                  </div>

                  {/* INPUT 3: Notaría Venta */}
                  <div>
                    <Label htmlFor="notarySaleRate" className="text-sm font-medium">
                      Notaría Venta (%)
                    </Label>
                    <Input
                      id="notarySaleRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={parameters.notarySaleRate}
                      onChange={(e) => handleParameterChange('notarySaleRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Gastos notariales
                    </p>
                  </div>

                  {/* INPUT 4: Notaría Venta Mínimo */}
                  <div>
                    <Label htmlFor="notarySaleMin" className="text-sm font-medium">
                      Notaría Venta Mínimo (€)
                    </Label>
                    <Input
                      id="notarySaleMin"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.notarySaleMin}
                      onChange={(e) => handleParameterChange('notarySaleMin', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Coste mínimo
                    </p>
                  </div>

                  {/* INPUT 5: Gestoría Venta */}
                  <div>
                    <Label htmlFor="managementSaleFee" className="text-sm font-medium">
                      Gestoría Venta (€)
                    </Label>
                    <Input
                      id="managementSaleFee"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.managementSaleFee}
                      onChange={(e) => handleParameterChange('managementSaleFee', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Honorarios gestoría
                    </p>
                  </div>

                  {/* INPUT 6: Certificado Energético */}
                  <div>
                    <Label htmlFor="energyCertificate" className="text-sm font-medium">
                      Certificado Energético (€)
                    </Label>
                    <Input
                      id="energyCertificate"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.energyCertificate}
                      onChange={(e) => handleParameterChange('energyCertificate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Obligatorio para vender
                    </p>
                  </div>

                  {/* INPUT 7: Cédula Habitabilidad */}
                  <div>
                    <Label htmlFor="habitabilityCertificate" className="text-sm font-medium">
                      Cédula de Habitabilidad (€)
                    </Label>
                    <Input
                      id="habitabilityCertificate"
                      type="number"
                      step="10"
                      min="0"
                      value={parameters.habitabilityCertificate}
                      onChange={(e) => handleParameterChange('habitabilityCertificate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Certificado de habitabilidad
                    </p>
                  </div>

                  {/* INPUT 8: Home Staging (solo si checkbox activo) */}
                  {options.includeHomeStaging && (
                    <div>
                      <Label htmlFor="homeStagingFee" className="text-sm font-medium">
                        Home Staging (€)
                      </Label>
                      <Input
                        id="homeStagingFee"
                        type="number"
                        step="100"
                        min="0"
                        value={parameters.homeStagingFee}
                        onChange={(e) => handleParameterChange('homeStagingFee', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Puesta en escena
                      </p>
                    </div>
                  )}

                  {/* INPUT 9: Marketing */}
                  <div>
                    <Label htmlFor="marketingFee" className="text-sm font-medium">
                      Marketing y Publicidad (€)
                    </Label>
                    <Input
                      id="marketingFee"
                      type="number"
                      step="50"
                      min="0"
                      value={parameters.marketingFee}
                      onChange={(e) => handleParameterChange('marketingFee', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Fotografía, anuncios, etc.
                    </p>
                  </div>
                </div>

                {/* Opciones */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Opciones adicionales:
                  </p>

                  {/* CHECKBOX 5: Home Staging */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeHomeStaging"
                      checked={options.includeHomeStaging}
                      onChange={(e) => handleOptionChange('includeHomeStaging', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="includeHomeStaging" className="text-sm cursor-pointer">
                      Incluir Home Staging
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ╔════════════════════════════════════════════╗ */}
          {/* ║  SECCIÓN 5: IMPUESTOS                      ║ */}
          {/* ╚════════════════════════════════════════════╝ */}
          <div className="border-l-4 border-red-200 pl-4">

            {/* Header */}
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection('impuestos')}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">💼</span>
                <h4 className="font-semibold text-gray-900">
                  Impuestos
                </h4>
                <span className="text-xs text-gray-500">
                  (1 parámetro)
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSections.impuestos ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Contenido */}
            {expandedSections.impuestos && (
              <div className="mt-3">
                <div className="max-w-md">

                  {/* INPUT ÚNICO: Impuesto Sociedades */}
                  <div>
                    <Label htmlFor="corporateTaxRate" className="text-sm font-medium">
                      Impuesto de Sociedades (%)
                    </Label>
                    <Input
                      id="corporateTaxRate"
                      type="number"
                      step="1"
                      min="0"
                      max="30"
                      value={parameters.corporateTaxRate}
                      onChange={(e) => handleParameterChange('corporateTaxRate', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Solo se aplica si hay beneficio positivo
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* FOOTER CON BOTÓN DE RESET                      */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Valores por defecto configurados para Madrid 2025
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Valores por Defecto
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
```

---

## PARTE 3: INTEGRACIÓN EN DASHBOARD

**Archivo a modificar:** `app/dashboard/page.tsx`

### Paso 1: Importar el componente

```typescript
// ══════════════════════════════════════════════════════
// SECCIÓN DE IMPORTS (al inicio del archivo)
// ══════════════════════════════════════════════════════

'use client';

import { useState, useEffect } from 'react';
import { useHouseFlippingCalculator } from '@/hooks/useHouseFlippingCalculator';
import { InputPanel } from '@/components/house-flipping/InputPanel';
import { CostBreakdown } from '@/components/house-flipping/CostBreakdown';
import { ResultsSummary } from '@/components/house-flipping/ResultsSummary';
import { AdvancedParameters } from '@/components/house-flipping/AdvancedParameters'; // ← NUEVA LÍNEA
import PriceEstimator from '@/components/calculator/PriceEstimator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Save,
  Calculator,
  FileSpreadsheet,
  FileText,
  Trash2,
  FolderOpen
} from 'lucide-react';
```

### Paso 2: Modificar el JSX del componente

```typescript
export default function HouseFlippingCalculatorPage() {
  // ══════════════════════════════════════════════════════
  // HOOK PRINCIPAL (Ya existe, NO modificar)
  // ══════════════════════════════════════════════════════
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

  // Estados adicionales (ya existen)
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [priceEstimation, setPriceEstimation] = useState<any>(null);

  // ... resto de funciones existentes ...

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* ════════════════════════════════════════════════ */}
      {/* HEADER                                           */}
      {/* ════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="hidden sm:inline">Calculadora de Inversión Inmobiliaria</span>
            <span className="sm:hidden">Calculadora</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Analiza la rentabilidad de tu inversión inmobiliaria
          </p>
        </div>

        {/* Botón Guardar */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={handleSaveAnalysis}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* PARÁMETROS AVANZADOS - NUEVO COMPONENTE         */}
      {/* ════════════════════════════════════════════════ */}
      <AdvancedParameters
        parameters={parameters}
        options={options}
        onParametersChange={setParameters}
        onOptionsChange={setOptions}
        onReset={resetToDefaults}
      />

      {/* ════════════════════════════════════════════════ */}
      {/* GRID PRINCIPAL (Ya existe, NO modificar)        */}
      {/* ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">

        {/* Columna Izquierda */}
        <div className="space-y-6">
          <InputPanel
            propertyData={propertyData}
            onPropertyDataChange={setPropertyData}
          />

          <PriceEstimator
            propertyData={{
              surface: propertyData.surface,
              address: propertyData.location,
              zone: propertyData.location,
            }}
            onEstimateComplete={handleEstimateComplete}
            analysisId={currentAnalysisId || undefined}
          />

          <CostBreakdown
            calculations={calculations}
          />
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <ResultsSummary
            calculations={calculations}
            projectDuration={propertyData.projectDuration}
          />

          {/* Exportación (ya existe) */}
          {/* ... resto del código ... */}
        </div>
      </div>
    </div>
  );
}
```

---

## RESULTADO FINAL ESPERADO

Al completar esta implementación, tendrás:

### Funcionalidades

1. **Sección de Parámetros Completamente Expandible**
   - 5 categorías visuales con colores distintivos
   - 48 inputs numéricos editables
   - 6 checkboxes para opciones adicionales
   - Validación automática de rangos

2. **Interactividad Total**
   - Click en header para expandir/colapsar secciones
   - Animación suave del icono ChevronDown (rotación 180°)
   - Inputs condicionales que aparecen/desaparecen según checkboxes
   - Actualización en tiempo real de calculations

3. **Botón de Reset**
   - Restaura TODOS los 48 parámetros a valores Madrid 2025
   - Restaura las 6 opciones a sus defaults
   - Feedback visual inmediato

4. **Integración Perfecta**
   - Se coloca ANTES del grid principal
   - No afecta a componentes existentes
   - Comparte estado con toda la aplicación
   - Cambios reflejados instantáneamente en ResultsSummary y CostBreakdown

### Comportamiento Esperado

**Escenario 1: Usuario modifica ITP**
```
Usuario cambia ITP de 10% a 8%
↓
handleParameterChange('itpRate', 8)
↓
setParameters({...parameters, itpRate: 8})
↓
Hook recalcula calculations.purchaseCosts.itp
↓
ResultsSummary muestra nuevo ROI
↓
CostBreakdown muestra nuevo total de compra
```

**Escenario 2: Usuario activa Due Diligence**
```
Usuario hace click en checkbox "Incluir Due Diligence"
↓
handleOptionChange('includeDueDiligence', true)
↓
setOptions({...options, includeDueDiligence: true})
↓
Aparece input de "Due Diligence (€)" con valor 500
↓
Hook añade 500€ a purchaseCosts
↓
ResultsSummary y CostBreakdown se actualizan
```

**Escenario 3: Usuario hace reset**
```
Usuario hace click en "Restaurar Valores por Defecto"
↓
onReset() se ejecuta
↓
Todos los parámetros vuelven a Madrid 2025 defaults
↓
Todas las secciones se recalculan
↓
UI muestra valores originales
```

---

## VALIDACIONES Y NOTAS IMPORTANTES

### Validaciones de Inputs

Cada input debe tener:
- `min="0"` para evitar valores negativos
- `max` apropiado cuando aplique (ej: ITP max 100%)
- `step` adecuado:
  - `0.01` para porcentajes pequeños (0.3%, 0.5%)
  - `0.1` para porcentajes normales (10%, 21%)
  - `1` para porcentajes enteros (25%)
  - `10` para euros pequeños (300€, 500€)
  - `50-100` para euros medianos (2000€, 5000€)

### Comportamiento de Checkboxes

- Si checkbox está **desmarcado**: input asociado NO se muestra
- Si checkbox se **activa**: input aparece con valor default
- Si checkbox se **desactiva**: valor se ignora en cálculos

### Performance

- `useMemo` en el hook asegura que calculations solo se recalcula cuando necesario
- Estado local de `expandedSections` no afecta cálculos
- Renderizado condicional evita crear inputs innecesarios

### Accesibilidad

- Todos los inputs tienen `<Label>` asociado con `htmlFor`
- Checkboxes tienen labels clicables
- Descripciones con `text-xs text-gray-500` para contexto
- Colores con suficiente contraste

---

## TESTING

Para verificar que todo funciona correctamente:

### Test 1: Modificar parámetro básico
1. Cambiar ITP de 10% a 6%
2. Verificar que ResultsSummary muestra ROI diferente
3. Verificar que CostBreakdown.purchaseCosts.itp cambió

### Test 2: Activar opción
1. Activar "Incluir Due Diligence"
2. Verificar que aparece input de 500€
3. Verificar que CostBreakdown suma 500€ a costes de compra

### Test 3: Desactivar opción
1. Desactivar "Incluir Due Diligence"
2. Verificar que input desaparece
3. Verificar que costes reducen 500€

### Test 4: Reset completo
1. Modificar varios parámetros
2. Click en "Restaurar Valores por Defecto"
3. Verificar que TODOS vuelven a defaults

### Test 5: Expandir/Colapsar
1. Click en header de "Costes de Reforma"
2. Verificar animación de ChevronDown
3. Verificar que contenido aparece/desaparece

---

Este es el prompt más detallado posible para la Calculadora. Contiene CADA elemento visual, CADA texto, CADA comportamiento esperado. ¿Continúo con los demás prompts al mismo nivel de detalle?

