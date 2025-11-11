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

// Datos completos de los 169 barrios de Madrid
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

// 20 Factores Premium
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

export default function PricingReferencePage() {
  const router = useRouter();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const neighborhoodData = selectedNeighborhood
    ? NEIGHBORHOODS_DATA[selectedNeighborhood as keyof typeof NEIGHBORHOODS_DATA]
    : null;

  // Calcular ajuste total
  const totalAdjustment = selectedFactors.reduce((sum, factorId) => {
    const factor = [...PREMIUM_FACTORS.positive, ...PREMIUM_FACTORS.negative]
      .find(f => f.id === factorId);
    return sum + (factor?.adjustment || 0);
  }, 0);

  // Calcular precios ajustados
  const adjustmentMultiplier = 1 + (totalAdjustment / 100);
  const adjustedReformed = neighborhoodData
    ? Math.round(neighborhoodData.reformed * adjustmentMultiplier)
    : 0;
  const adjustedUnreformed = neighborhoodData
    ? Math.round(neighborhoodData.unreformed * adjustmentMultiplier)
    : 0;

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

    // Navegar a la calculadora con los parámetros
    router.push(`/dashboard?reformed=${finalReformed}&unreformed=${finalUnreformed}&neighborhood=${encodeURIComponent(neighborhoodData.name)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calculator className="w-8 h-8 text-primary" />
          Precios de Referencia por Barrio
        </h1>
        <p className="text-gray-600">Consulta precios medios de propiedades reformadas y sin reformar</p>
      </div>

      {/* Consultar Precios */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Consultar Precios de Referencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de Ciudad y Barrio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Resultados de Precios */}
          {neighborhoodData && (
            <div className="space-y-6">
              {/* Precios Base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Potencial de Revalorización */}
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

              {/* Ajustes Premium */}
              <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Ajustes Premium
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona características adicionales para ajustar el precio de referencia
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Factores Positivos */}
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

                  {/* Factores Negativos */}
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

                {/* Resumen de Ajuste */}
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

              {/* Botón Usar en Calculadora */}
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
