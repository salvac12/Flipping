'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ParsedProperty {
  portal: string;
  url: string;
  title: string;
  price: number;
  surface: number;
  pricePerM2: number;
  address: string;
  zone?: string;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior: boolean;
  hasLift: boolean;
  buildYear?: number;
  condition?: string;
  wasReformed: boolean;
  reformQuality?: string;
  latitude?: number;
  longitude?: number;
}

export function PropertyInputForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedProperty, setParsedProperty] = useState<ParsedProperty | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleParseURL = async () => {
    if (!url.trim()) {
      setError('Por favor introduce una URL');
      return;
    }

    setLoading(true);
    setError(null);
    setParsedProperty(null);

    try {
      const response = await fetch('/api/manual/parse-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al parsear la URL');
      }

      setParsedProperty(data.property);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la URL');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperty = async () => {
    if (!parsedProperty) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/manual/parse-url', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ property: parsedProperty }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al guardar la propiedad');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setUrl('');
        setParsedProperty(null);
        setSaveSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Añadir Propiedad Manualmente</CardTitle>
          <CardDescription>
            Pega la URL de una propiedad de Idealista, Fotocasa, Pisos.com o Clikalia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">URL de la Propiedad</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://www.idealista.com/inmueble/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleParseURL();
                    }
                  }}
                  disabled={loading}
                />
                <Button
                  onClick={handleParseURL}
                  disabled={loading || !url.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    'Analizar'
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
                Propiedad guardada correctamente!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {parsedProperty && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>Verifica los datos extraídos antes de guardar</CardDescription>
              </div>
              <Badge variant={parsedProperty.wasReformed ? 'default' : 'secondary'}>
                {parsedProperty.wasReformed ? 'Reformado' : 'Sin Reformar'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label className="text-xs text-muted-foreground">Título</Label>
                <p className="text-sm font-medium">{parsedProperty.title}</p>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Precio</Label>
                  <p className="text-lg font-semibold">
                    {parsedProperty.price.toLocaleString()}€
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Superficie</Label>
                  <p className="text-lg font-semibold">{parsedProperty.surface}m²</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">€/m²</Label>
                  <p className="text-lg font-semibold">
                    {parsedProperty.pricePerM2.toLocaleString()}€
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Portal</Label>
                  <p className="text-sm font-medium">{parsedProperty.portal}</p>
                </div>
              </div>

              {/* Address and Zone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Dirección</Label>
                  <p className="text-sm">{parsedProperty.address}</p>
                </div>
                {parsedProperty.zone && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Zona</Label>
                    <p className="text-sm font-medium">{parsedProperty.zone}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {parsedProperty.rooms && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Habitaciones</Label>
                    <p className="text-sm">{parsedProperty.rooms}</p>
                  </div>
                )}
                {parsedProperty.bathrooms && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Baños</Label>
                    <p className="text-sm">{parsedProperty.bathrooms}</p>
                  </div>
                )}
                {parsedProperty.floor !== undefined && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Planta</Label>
                    <p className="text-sm">{parsedProperty.floor}º</p>
                  </div>
                )}
                {parsedProperty.buildYear && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Año</Label>
                    <p className="text-sm">{parsedProperty.buildYear}</p>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {parsedProperty.isExterior && <Badge variant="outline">Exterior</Badge>}
                {parsedProperty.hasLift && <Badge variant="outline">Ascensor</Badge>}
                {parsedProperty.condition && (
                  <Badge variant="outline">{parsedProperty.condition}</Badge>
                )}
                {parsedProperty.reformQuality && (
                  <Badge variant="outline">
                    Reforma {parsedProperty.reformQuality}
                  </Badge>
                )}
              </div>

              {/* Coordinates */}
              {parsedProperty.latitude && parsedProperty.longitude && (
                <div className="text-xs text-muted-foreground">
                  Coordenadas: {parsedProperty.latitude.toFixed(4)}, {parsedProperty.longitude.toFixed(4)}
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleSaveProperty}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar como Comparable'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
