'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Percent,
  Euro,
  Clock,
  Target
} from 'lucide-react';

interface ResultsSummaryProps {
  calculations: {
    salePrice: number;
    totalInvestment: number;
    grossProfit: number;
    corporateTax: number;
    netProfit: number;
    roi: number;
    annualizedROI: number;
    breakEvenPrice: number;
    safetyMargin: number;
  };
  projectDuration: number;
}

export function ResultsSummary({ calculations, projectDuration }: ResultsSummaryProps) {
  const isViable = calculations.roi > 15; // Consideramos viable si ROI > 15%
  const isExcellent = calculations.roi > 25;
  const isRisky = calculations.safetyMargin < 10;

  const getROIColor = (roi: number) => {
    if (roi > 25) return 'text-green-600';
    if (roi > 15) return 'text-yellow-600';
    if (roi > 0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getViabilityBadge = () => {
    if (isExcellent) return <Badge className="bg-green-500">Excelente Oportunidad</Badge>;
    if (isViable) return <Badge className="bg-yellow-500">Viable</Badge>;
    if (calculations.roi > 0) return <Badge className="bg-orange-500">Margen Ajustado</Badge>;
    return <Badge variant="destructive">No Viable</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Resumen de Resultados</CardTitle>
          {getViabilityBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resultado Principal */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Beneficio Neto</span>
            {calculations.netProfit > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className={`text-3xl font-bold ${calculations.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(calculations.netProfit)}
          </div>
        </div>

        {/* Métricas Clave */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Percent className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">ROI</span>
            </div>
            <div className={`text-2xl font-bold ${getROIColor(calculations.roi)}`}>
              {calculations.roi.toFixed(1)}%
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">ROI Anualizado</span>
            </div>
            <div className={`text-2xl font-bold ${getROIColor(calculations.annualizedROI)}`}>
              {calculations.annualizedROI.toFixed(1)}%
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Punto de Equilibrio</span>
            </div>
            <div className="text-xl font-semibold">
              {formatCurrency(calculations.breakEvenPrice)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Margen Seguridad</span>
            </div>
            <div className={`text-xl font-semibold ${isRisky ? 'text-red-600' : 'text-green-600'}`}>
              {calculations.safetyMargin.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Flujo de Caja */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">Flujo de Caja</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Precio de venta</span>
              <span className="font-medium">{formatCurrency(calculations.salePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">- Inversión total</span>
              <span className="font-medium text-red-600">-{formatCurrency(calculations.totalInvestment)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="font-semibold">= Beneficio bruto</span>
              <span className="font-semibold">{formatCurrency(calculations.grossProfit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">- Impuesto sociedades (25%)</span>
              <span className="font-medium text-red-600">-{formatCurrency(calculations.corporateTax)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="font-bold">= Beneficio neto</span>
              <span className={`font-bold ${calculations.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculations.netProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* Indicadores de Viabilidad */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">Análisis de Viabilidad</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {calculations.roi > 15 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                ROI {calculations.roi > 15 ? 'supera' : 'no alcanza'} el mínimo recomendado (15%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {calculations.safetyMargin > 10 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">
                Margen de seguridad {calculations.safetyMargin > 10 ? 'adecuado' : 'ajustado'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {projectDuration <= 6 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">
                Duración del proyecto: {projectDuration} meses
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}