'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Barrio {
  key: string;
  displayName: string;
  zona: string;
  distrito: string;
}

interface BarriosByDistrito {
  distrito: string;
  count: number;
  barrios: Barrio[];
}

interface ScrapeResult {
  success: boolean;
  message: string;
  barrio?: {
    key: string;
    displayName: string;
    zona: string;
    distrito: string;
  };
  results?: {
    total: number;
    saved: number;
    properties: any[];
  };
}

export function BarrioSelector() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [barriosByDistrito, setBarriosByDistrito] = useState<BarriosByDistrito[]>([]);
  const [selectedBarrio, setSelectedBarrio] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingBarrios, setLoadingBarrios] = useState(true);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  // Cargar barrios al montar
  useEffect(() => {
    async function loadBarrios() {
      try {
        const response = await fetch('/api/scraper/barrios');
        const data = await response.json();

        if (data.success) {
          setBarrios(data.barrios);
          setBarriosByDistrito(data.barriosByDistrito);
        }
      } catch (error) {
        console.error('Error cargando barrios:', error);
      } finally {
        setLoadingBarrios(false);
      }
    }

    loadBarrios();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);

    try {
      const body = selectedBarrio ? { barrio: selectedBarrio } : {};

      const response = await fetch('/api/scraper/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Error ejecutando scraper: ' + (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedBarrioInfo = selectedBarrio
    ? barrios.find((b) => b.key === selectedBarrio)
    : null;

  if (loadingBarrios) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Cargando barrios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Barrio */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Seleccionar Barrio
        </h2>

        <div className="space-y-4">
          {/* Select principal */}
          <div>
            <label
              htmlFor="barrio-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Barrio de Madrid
            </label>
            <select
              id="barrio-select"
              value={selectedBarrio}
              onChange={(e) => setSelectedBarrio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            >
              <option value="">🏙️ Toda Madrid ({barrios.length} barrios)</option>
              {barriosByDistrito.map((distrito) => (
                <optgroup key={distrito.distrito} label={`📍 ${distrito.distrito} (${distrito.count})`}>
                  {distrito.barrios.map((barrio) => (
                    <option key={barrio.key} value={barrio.key}>
                      {barrio.displayName} - Zona: {barrio.zona}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Info del barrio seleccionado */}
          {selectedBarrioInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedBarrioInfo.displayName}
                  </p>
                  <p className="text-sm text-blue-700">
                    Distrito: {selectedBarrioInfo.distrito}
                  </p>
                  <p className="text-sm text-blue-700">
                    Zona Prioritaria: {selectedBarrioInfo.zona}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón de scraping */}
          <Button
            onClick={handleScrape}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Scrapeando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Scrapear {selectedBarrio ? selectedBarrioInfo?.displayName : 'Toda Madrid'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resultados */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start gap-3 mb-4">
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? 'Scraping Completado' : 'Error'}
              </h3>
              <p
                className={`text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.message}
              </p>
            </div>
          </div>

          {result.success && result.barrio && result.results && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-600">Barrio</p>
                  <p className="font-semibold text-gray-900">
                    {result.barrio.displayName}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-600">Propiedades Encontradas</p>
                  <p className="font-semibold text-gray-900">
                    {result.results.total}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-600">Guardadas en DB</p>
                  <p className="font-semibold text-gray-900">
                    {result.results.saved}
                  </p>
                </div>
              </div>

              {/* Primeras propiedades */}
              {result.results.properties && result.results.properties.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Primeras {result.results.properties.length} propiedades:
                  </h4>
                  <div className="space-y-2">
                    {result.results.properties.map((prop, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-md p-3 text-sm"
                      >
                        <p className="font-medium text-gray-900 mb-1">
                          {prop.title?.substring(0, 80) || 'Sin título'}
                        </p>
                        <div className="flex flex-wrap gap-3 text-gray-600">
                          <span>💰 {prop.price?.toLocaleString('es-ES')}€</span>
                          <span>📐 {prop.m2}m²</span>
                          <span>💵 {prop.pricePerM2?.toLocaleString('es-ES')}€/m²</span>
                          <span>⭐ Score: {prop.score}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Scraping usando ScraperAPI (bypass DataDome automático)</li>
          <li>• Tiempo estimado: 2-3 segundos por barrio</li>
          <li>• Las propiedades se guardan automáticamente en la base de datos</li>
          <li>• {barrios.length} barrios disponibles en Madrid</li>
        </ul>
      </div>
    </div>
  );
}
