'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Home, MapPin, AlertCircle, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

interface PriceEstimatorProps {
  propertyData: {
    surface: number;
    rooms?: number;
    bathrooms?: number;
    floor?: number;
    isExterior?: boolean;
    hasLift?: boolean;
    condition?: string;
    address?: string;
    zone?: string;
    isPenthouse?: boolean;
  };
  onEstimateComplete?: (estimation: any) => void;
  analysisId?: string;
}

export default function PriceEstimator({
  propertyData,
  onEstimateComplete,
  analysisId
}: PriceEstimatorProps) {
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);
  const [showComparables, setShowComparables] = useState(false);

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/estimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propertyData,
          analysisId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error details:', data);
        throw new Error(data.details || data.error || 'Error al estimar el precio');
      }

      setEstimation(data);

      if (onEstimateComplete) {
        onEstimateComplete(data);
      }

      // Toast replacement with simple feedback
      console.log('Estimación completada con éxito');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al realizar la estimación');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta confianza';
    if (confidence >= 50) return 'Confianza media';
    return 'Baja confianza';
  };

  if (!propertyData.surface || !propertyData.zone) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <p>Completa los datos de superficie y zona para habilitar la estimación</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estimación Inteligente de Precio de Venta
          </CardTitle>
          <CardDescription>
            Análisis basado en comparables del mercado actual y características de la propiedad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Datos de entrada */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                <strong>{propertyData.surface}</strong> m²
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{propertyData.zone}</span>
            </div>
            {propertyData.floor !== undefined && (
              <div className="text-sm">
                <strong>Planta:</strong> {propertyData.floor === 0 ? 'Bajo' : `${propertyData.floor}º`}
              </div>
            )}
            {propertyData.isExterior !== undefined && (
              <div className="text-sm">
                {propertyData.isExterior ? (
                  <Badge variant="outline" className="bg-green-50">Exterior</Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50">Interior</Badge>
                )}
              </div>
            )}
            {propertyData.condition && (
              <div className="text-sm">
                <strong>Estado:</strong> {
                  propertyData.condition === 'reformed' ? 'Reformado' :
                  propertyData.condition === 'needs_reform' ? 'Para reformar' : 'Buen estado'
                }
              </div>
            )}
            {propertyData.isPenthouse && (
              <Badge variant="outline" className="bg-blue-50">Ático</Badge>
            )}
          </div>

          {!estimation ? (
            <Button
              onClick={handleEstimate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando mercado...
                </>
              ) : (
                'Estimar Precio de Venta'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Resultados de la estimación */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-green-600 font-medium">Precio Mínimo</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(estimation.minPrice)}
                    </p>
                    <p className="text-xs text-green-600">
                      {formatCurrency(estimation.minPricePerM2)}/m²
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-blue-600 font-medium">Precio Promedio</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(estimation.avgPrice)}
                    </p>
                    <p className="text-xs text-blue-600">
                      {formatCurrency(estimation.avgPricePerM2)}/m²
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-purple-600 font-medium">Precio Máximo</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {formatCurrency(estimation.maxPrice)}
                    </p>
                    <p className="text-xs text-purple-600">
                      {formatCurrency(estimation.maxPricePerM2)}/m²
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Indicadores de confianza */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Nivel de Confianza:</span>
                  <span className={`font-bold ${getConfidenceColor(estimation.confidence)}`}>
                    {estimation.confidence}%
                  </span>
                  <Badge variant="outline" className={getConfidenceColor(estimation.confidence)}>
                    {getConfidenceLabel(estimation.confidence)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {estimation.comparablesCount || 0} comparables analizados
                </div>
              </div>

              {/* Notas del sistema */}
              {estimation.notes && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> {estimation.notes}
                  </p>
                </div>
              )}

              {/* Comparables */}
              {estimation.comparables && estimation.comparables.length > 0 && (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowComparables(!showComparables)}
                    className="w-full"
                  >
                    {showComparables ? 'Ocultar' : 'Ver'} Comparables ({estimation.comparables.length})
                  </Button>

                  {showComparables && (
                    <div className="mt-4 space-y-2">
                      {estimation.comparables.slice(0, 5).map((comp: any, index: number) => (
                        <Card key={index} className="p-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Precio:</span>
                              <p className="font-semibold">{formatCurrency(comp.price)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Superficie:</span>
                              <p className="font-semibold">{comp.surface} m²</p>
                            </div>
                            <div>
                              <span className="text-gray-600">€/m²:</span>
                              <p className="font-semibold">{formatCurrency(comp.pricePerM2)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Distancia:</span>
                              <p className="font-semibold">{Math.round(comp.distance)} m</p>
                            </div>
                          </div>
                          {comp.adjustedPrice && (
                            <div className="mt-2 pt-2 border-t">
                              <span className="text-xs text-gray-600">Precio ajustado: </span>
                              <span className="text-sm font-semibold text-blue-600">
                                {formatCurrency(comp.adjustedPrice)}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                (peso: {Math.round(comp.weight * 100)}%)
                              </span>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Botón para recalcular */}
              <Button
                variant="outline"
                onClick={handleEstimate}
                disabled={loading}
                className="w-full"
              >
                Recalcular Estimación
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}