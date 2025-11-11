"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, Plus, RefreshCw } from "lucide-react";

const NEIGHBORHOODS = [
  { id: 'retiro', name: 'Retiro', properties: 641 },
  { id: 'barrio-salamanca', name: 'Barrio de Salamanca', properties: 2246 },
  { id: 'centro', name: 'Centro', properties: 2012 },
  { id: 'chamberi', name: 'Chamberí', properties: 1034 },
  { id: 'chamartin', name: 'Chamartín', properties: 647 },
  { id: 'moncloa', name: 'Moncloa', properties: 615 },
  { id: 'carabanchel', name: 'Carabanchel', properties: 815 },
  { id: 'tetuan', name: 'Tetuán', properties: 765 },
  { id: 'ciudad-lineal', name: 'Ciudad Lineal', properties: 669 },
  { id: 'puente-vallecas', name: 'Puente de Vallecas', properties: 658 },
  { id: 'goya', name: 'Goya, Barrio de Salamanca', properties: 657 },
  { id: 'fuencarral', name: 'Fuencarral', properties: 525 },
  { id: 'arganzuela', name: 'Arganzuela', properties: 521 },
  { id: 'san-blas', name: 'San Blas', properties: 505 },
  { id: 'lavapies', name: 'Lavapiés-Embajadores, Centro', properties: 502 },
  { id: 'latina', name: 'Latina', properties: 501 },
  { id: 'hortaleza', name: 'Hortaleza', properties: 476 },
  { id: 'recoletos', name: 'Recoletos, Barrio de Salamanca', properties: 475 },
  { id: 'malasana', name: 'Malasaña-Universidad, Centro', properties: 470 },
  { id: 'usera', name: 'Usera', properties: 431 },
  { id: 'guindalera', name: 'Guindalera, Barrio de Salamanca', properties: 217 },
  { id: 'prosperidad', name: 'Prosperidad, Chamartín', properties: 128 },
  { id: 'pacifico', name: 'Pacífico, Retiro', properties: 126 },
  { id: 'arguelles', name: 'Argüelles, Moncloa', properties: 189 },
];

export default function FeedPricingPage() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("Madrid");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("retiro");
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-heading-1 text-text-primary">
          Alimentar Base de Datos de Precios
        </h1>
        <p className="text-body text-text-secondary">
          Añade nuevas propiedades para mejorar los precios de referencia
        </p>
      </div>

      {/* Main card */}
      <Card className="border-border shadow-card">
        <CardContent className="p-6 space-y-6">
          {/* Step 1: Select City and Neighborhood */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-body-sm font-bold text-primary">1</span>
            </div>
            <h2 className="text-heading-2 text-text-primary">
              Selecciona Ciudad y Barrio
            </h2>
          </div>

          {/* City and Neighborhood selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City selector */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-body-sm font-medium text-text-tertiary">
                Ciudad
              </Label>
              <button
                id="city"
                className="w-full h-10 px-3 flex items-center justify-between rounded-input border border-transparent bg-input text-body-sm text-foreground hover:bg-muted transition-colors"
              >
                <span>{selectedCity}</span>
                <svg
                  className="w-4 h-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Neighborhood selector */}
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-body-sm font-medium text-text-tertiary">
                Barrio
              </Label>
              <select
                id="neighborhood"
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="w-full h-10 px-3 flex items-center justify-between rounded-input border border-transparent bg-input text-body-sm text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {NEIGHBORHOODS.map(neighborhood => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name} ({neighborhood.properties})
                  </option>
                ))}
              </select>
              <p className="text-caption text-text-secondary">
                {NEIGHBORHOODS.length} barrios principales disponibles
              </p>
            </div>
          </div>

          {/* Database stats */}
          <div className="p-4 rounded-lg bg-accent border border-[#BEDBFF]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-body-sm text-text-tertiary">
                  Propiedades en Base de Datos
                </p>
                <p className="text-heading-1 text-primary">275</p>
                <p className="text-caption text-text-secondary">
                  111 reformadas • 164 sin reformar
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-body-sm text-text-tertiary">
                  Última actualización
                </p>
                <p className="text-body-sm text-text-primary">
                  Hace 1 semana
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              variant="default"
              className="flex-1 h-9 bg-success hover:bg-success/90 text-white"
              onClick={() => {
                const neighborhood = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood);
                router.push(`/dashboard/pricing/consult?neighborhood=${selectedNeighborhood}&name=${encodeURIComponent(neighborhood?.name || '')}`);
              }}
            >
              <Check className="w-4 h-4 mr-2" />
              Usar Existente
            </Button>
            <Button
              variant="default"
              className="flex-1 h-9 bg-primary hover:bg-primary-dark"
              disabled={isUpdating}
              onClick={async () => {
                setIsUpdating(true);
                try {
                  const response = await fetch('/api/scraper/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ neighborhood: selectedNeighborhood })
                  });
                  if (response.ok) {
                    alert('Scraper iniciado. Los datos se actualizarán en unos minutos.');
                  } else {
                    alert('Error al iniciar el scraper');
                  }
                } catch (error) {
                  alert('Error al iniciar el scraper');
                } finally {
                  setIsUpdating(false);
                }
              }}
            >
              {isUpdating ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Actualizando...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Añadir Más</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
