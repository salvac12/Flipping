'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Link } from 'lucide-react';

interface InputPanelProps {
  propertyData: {
    purchasePrice: number;
    surface: number;
    salePrice: number;
    projectDuration: number;
    location: string;
  };
  onPropertyDataChange: (data: any) => void;
}

export function InputPanel({ propertyData, onPropertyDataChange }: InputPanelProps) {
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleChange = (field: string, value: string) => {
    const numValue = field === 'location' ? value : parseFloat(value) || 0;
    onPropertyDataChange({
      ...propertyData,
      [field]: field === 'location' ? value : numValue
    });
  };

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      alert('Por favor, introduce una URL válida');
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch('/api/analysis/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Actualizar los datos con lo importado
        onPropertyDataChange({
          ...propertyData,
          purchasePrice: result.data.purchasePrice || propertyData.purchasePrice,
          surface: result.data.surface || propertyData.surface,
          location: result.data.location || propertyData.location,
          // Calcular precio de venta estimado (30% más sobre precio de compra + reforma)
          salePrice: result.data.purchasePrice ?
            Math.round(result.data.purchasePrice * 1.3 + (result.data.surface * 1200)) :
            propertyData.salePrice
        });

        if (result.data.fromDatabase) {
          alert('✅ Datos importados desde propiedad ya analizada');
        } else if (result.data.error) {
          alert('⚠️ Importación parcial. Revisa y ajusta los valores manualmente.');
        } else {
          alert('✅ Datos importados correctamente');
        }
      } else {
        alert(result.error || 'Error al importar datos');
      }
    } catch (error) {
      console.error('Error importing:', error);
      alert('Error al importar desde URL');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la Propiedad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Precio de Compra (€)</Label>
            <Input
              id="purchasePrice"
              type="number"
              value={propertyData.purchasePrice}
              onChange={(e) => handleChange('purchasePrice', e.target.value)}
              placeholder="150000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="surface">Superficie (m²)</Label>
            <Input
              id="surface"
              type="number"
              value={propertyData.surface}
              onChange={(e) => handleChange('surface', e.target.value)}
              placeholder="80"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice">Precio de Venta Estimado (€)</Label>
            <Input
              id="salePrice"
              type="number"
              value={propertyData.salePrice}
              onChange={(e) => handleChange('salePrice', e.target.value)}
              placeholder="250000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDuration">Duración del Proyecto (meses)</Label>
            <Input
              id="projectDuration"
              type="number"
              value={propertyData.projectDuration}
              onChange={(e) => handleChange('projectDuration', e.target.value)}
              placeholder="6"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">Ubicación/Zona</Label>
            <Input
              id="location"
              type="text"
              value={propertyData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Ej: Guindalera, Madrid"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            Importar desde portal inmobiliario
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Pegar URL de Idealista, Fotocasa o Pisos.com..."
              className="flex-1"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              disabled={isImporting}
            />
            <Button
              variant="outline"
              onClick={handleImportFromUrl}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Importa precio y superficie automáticamente desde Idealista, Fotocasa o Pisos.com
          </p>
        </div>
      </CardContent>
    </Card>
  );
}