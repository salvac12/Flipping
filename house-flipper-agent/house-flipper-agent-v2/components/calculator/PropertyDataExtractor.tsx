'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardPaste,
  FileText,
  Check,
  AlertCircle,
  Home,
  MapPin,
  Calendar,
  Wrench,
  Car,
  Droplets
} from 'lucide-react';
import { PropertyTextExtractor, ExtractedPropertyData } from '@/lib/utils/property-text-extractor';
import { formatCurrency } from '@/lib/utils/format';

interface PropertyDataExtractorProps {
  onDataExtracted: (data: ExtractedPropertyData) => void;
}

export default function PropertyDataExtractor({ onDataExtracted }: PropertyDataExtractorProps) {
  const [text, setText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedPropertyData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleExtract = () => {
    if (!text.trim()) {
      alert('Por favor, pega el texto del anuncio');
      return;
    }

    setIsExtracting(true);
    setTimeout(() => {
      const data = PropertyTextExtractor.extract(text);
      setExtractedData(data);
      setShowPreview(true);
      setIsExtracting(false);
    }, 500); // Pequeña demora para feedback visual
  };

  const handleApplyData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      // Limpiar después de aplicar
      setText('');
      setExtractedData(null);
      setShowPreview(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (error) {
      console.error('Error al pegar desde el portapapeles:', error);
      alert('No se pudo acceder al portapapeles. Por favor, pega manualmente con Ctrl+V o Cmd+V');
    }
  };

  const getConditionBadge = (condition?: string) => {
    switch (condition) {
      case 'reformed':
        return <Badge variant="outline" className="bg-green-50">Reformado</Badge>;
      case 'needs_reform':
        return <Badge variant="outline" className="bg-orange-50">Para reformar</Badge>;
      case 'good':
        return <Badge variant="outline" className="bg-blue-50">Buen estado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardPaste className="h-5 w-5 text-blue-600" />
          Importar desde Anuncio
        </CardTitle>
        <CardDescription>
          Copia y pega el texto completo del anuncio de Idealista, Fotocasa o Pisos.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePaste}
              className="mb-2"
            >
              <ClipboardPaste className="h-4 w-4 mr-2" />
              Pegar desde portapapeles
            </Button>
            {text && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setText('');
                  setExtractedData(null);
                  setShowPreview(false);
                }}
                className="mb-2 text-red-600"
              >
                Limpiar
              </Button>
            )}
          </div>
          <Textarea
            placeholder="Pega aquí el texto del anuncio...

Ejemplo:
Ático en venta en CL Francisco Silvela
Guindalera, Madrid
949.000 €
100 m²
3 hab.
Planta 11ª exterior con ascensor
..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] font-mono text-sm bg-white"
          />
        </div>

        {text && !showPreview && (
          <Button
            onClick={handleExtract}
            disabled={isExtracting}
            className="w-full"
          >
            {isExtracting ? (
              <>
                <FileText className="mr-2 h-4 w-4 animate-pulse" />
                Extrayendo datos...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Extraer Datos del Anuncio
              </>
            )}
          </Button>
        )}

        {showPreview && extractedData && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Datos Extraídos
              </h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {extractedData.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(extractedData.price)}
                    </span>
                  </div>
                )}

                {extractedData.surface && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{extractedData.surface} m²</span>
                  </div>
                )}

                {extractedData.rooms && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Habitaciones:</span>
                    <span className="font-semibold">{extractedData.rooms}</span>
                  </div>
                )}

                {extractedData.bathrooms && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Baños:</span>
                    <span className="font-semibold">{extractedData.bathrooms}</span>
                  </div>
                )}

                {extractedData.floor !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Planta:</span>
                    <span className="font-semibold">
                      {extractedData.floor === 0 ? 'Bajo' : `${extractedData.floor}ª`}
                    </span>
                  </div>
                )}

                {extractedData.buildYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{extractedData.buildYear}</span>
                  </div>
                )}
              </div>

              {/* Badges para características */}
              <div className="flex flex-wrap gap-2 mt-3">
                {extractedData.isPenthouse && (
                  <Badge variant="outline" className="bg-purple-50">Ático</Badge>
                )}
                {extractedData.isExterior && (
                  <Badge variant="outline" className="bg-green-50">Exterior</Badge>
                )}
                {extractedData.hasLift && (
                  <Badge variant="outline" className="bg-blue-50">Ascensor</Badge>
                )}
                {extractedData.hasGarage && (
                  <Badge variant="outline" className="bg-gray-100">
                    <Car className="h-3 w-3 mr-1" />
                    Garaje
                  </Badge>
                )}
                {extractedData.hasPool && (
                  <Badge variant="outline" className="bg-cyan-50">
                    <Droplets className="h-3 w-3 mr-1" />
                    Piscina
                  </Badge>
                )}
                {extractedData.hasStorage && (
                  <Badge variant="outline" className="bg-yellow-50">Trastero</Badge>
                )}
                {getConditionBadge(extractedData.condition)}
              </div>

              {/* Dirección y zona */}
              {(extractedData.address || extractedData.zone) && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      {extractedData.address && (
                        <p className="font-medium">{extractedData.address}</p>
                      )}
                      {extractedData.zone && (
                        <p className="text-gray-600">{extractedData.zone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Advertencia si faltan datos críticos */}
              {(!extractedData.price || !extractedData.surface) && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-yellow-800">
                      <p className="font-medium">Datos incompletos</p>
                      <p className="text-xs mt-1">
                        {!extractedData.price && 'No se pudo extraer el precio. '}
                        {!extractedData.surface && 'No se pudo extraer la superficie. '}
                        Deberás completar estos datos manualmente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleApplyData}
                className="flex-1"
                variant="default"
              >
                <Check className="mr-2 h-4 w-4" />
                Aplicar Datos a la Calculadora
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  setExtractedData(null);
                }}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}