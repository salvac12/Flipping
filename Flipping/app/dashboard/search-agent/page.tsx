'use client';

import { useEffect, useState } from 'react';
import { Property } from '@prisma/client';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyMap } from '@/components/PropertyMap';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('split');

  // Filtros
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    fetchProperties();
  }, [minScore]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        minScore: minScore.toString(),
        orderBy: 'score',
        order: 'desc',
        limit: '100',
      });

      const response = await fetch(`/api/properties?${params}`);
      const data = await response.json();

      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScraper = async () => {
    if (!confirm('¿Ejecutar scraping manual? Esto puede tardar varios minutos.')) {
      return;
    }

    try {
      setScraping(true);
      const response = await fetch('/api/scraper/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxPagesPerZone: 2 }),
      });

      const data = await response.json();

      if (data.success) {
        const message = `Scraping completado:\n\n` +
          `✅ Total encontradas: ${data.results.total}\n` +
          `📝 Nuevas guardadas: ${data.results.saved}\n` +
          `♻️ Ya existían: ${data.results.total - data.results.saved}\n` +
          `❌ Errores: ${data.results.errors}`;

        alert(message);
        fetchProperties();
      } else {
        alert('Error en scraping');
      }
    } catch (error) {
      console.error('Error running scraper:', error);
      alert('Error ejecutando scraper');
    } finally {
      setScraping(false);
    }
  };

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      // Podríamos actualizar el estado local aquí
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDebug = async () => {
    try {
      // Obtener todas las propiedades sin filtros de score
      // Límite aumentado a 1000 para obtener todas las propiedades
      const response = await fetch('/api/properties?limit=1000&minScore=0');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        alert(`Error del servidor (${response.status}):\n${errorText.substring(0, 200)}`);
        return;
      }

      const data = await response.json();

      if (!data.properties) {
        const errorMsg = data.error || 'Formato de respuesta inválido';
        const details = data.details ? JSON.stringify(data.details, null, 2) : '';
        console.error('Response:', data);
        alert(`Error: ${errorMsg}\n\nDetalles:\n${details}`);
        return;
      }

      const allProperties = data.properties;

      // Calcular estadísticas
      const stats = {
        total: allProperties.length,
        byStatus: {
          ACTIVE: allProperties.filter((p: any) => p.status === 'ACTIVE').length,
          SOLD: allProperties.filter((p: any) => p.status === 'SOLD').length,
          REMOVED: allProperties.filter((p: any) => p.status === 'REMOVED').length,
          ARCHIVED: allProperties.filter((p: any) => p.status === 'ARCHIVED').length,
        },
        byPortal: {
          IDEALISTA: allProperties.filter((p: any) => p.portal === 'IDEALISTA').length,
          FOTOCASA: allProperties.filter((p: any) => p.portal === 'FOTOCASA').length,
          PISOS_COM: allProperties.filter((p: any) => p.portal === 'PISOS_COM').length,
        },
        scoreDistribution: {
          score_0: allProperties.filter((p: any) => p.score === 0).length,
          score_1_20: allProperties.filter((p: any) => p.score > 0 && p.score <= 20).length,
          score_21_40: allProperties.filter((p: any) => p.score > 20 && p.score <= 40).length,
          score_41_60: allProperties.filter((p: any) => p.score > 40 && p.score <= 60).length,
          score_61_80: allProperties.filter((p: any) => p.score > 60 && p.score <= 80).length,
          score_81_100: allProperties.filter((p: any) => p.score > 80 && p.score <= 100).length,
        },
        avgScore: allProperties.length > 0
          ? (allProperties.reduce((sum: number, p: any) => sum + p.score, 0) / allProperties.length).toFixed(2)
          : 0,
      };

      console.log('🔍 DEBUG INFO:', { stats, properties: allProperties.slice(0, 10) });

      const message = `📊 Estadísticas de Base de Datos:\n\n` +
        `Total propiedades: ${stats.total}\n\n` +
        `Por Estado:\n` +
        `  ✅ ACTIVE: ${stats.byStatus.ACTIVE}\n` +
        `  ❌ SOLD: ${stats.byStatus.SOLD}\n` +
        `  🚫 REMOVED: ${stats.byStatus.REMOVED}\n` +
        `  📦 ARCHIVED: ${stats.byStatus.ARCHIVED}\n\n` +
        `Por Portal:\n` +
        `  🟡 Idealista: ${stats.byPortal.IDEALISTA}\n` +
        `  🔵 Fotocasa: ${stats.byPortal.FOTOCASA}\n` +
        `  🟢 Pisos.com: ${stats.byPortal.PISOS_COM}\n\n` +
        `Distribución de Scores:\n` +
        `  Score 0: ${stats.scoreDistribution.score_0}\n` +
        `  Score 1-20: ${stats.scoreDistribution.score_1_20}\n` +
        `  Score 21-40: ${stats.scoreDistribution.score_21_40}\n` +
        `  Score 41-60: ${stats.scoreDistribution.score_41_60}\n` +
        `  Score 61-80: ${stats.scoreDistribution.score_61_80}\n` +
        `  Score 81-100: ${stats.scoreDistribution.score_81_100}\n\n` +
        `Score Promedio: ${stats.avgScore}\n\n` +
        `Ver detalles en la consola del navegador (F12)`;

      alert(message);
    } catch (error) {
      console.error('Error en debug:', error);
      alert(`Error obteniendo datos de debug: ${error}`);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Agente de Búsqueda</h2>
              <p className="text-sm text-gray-600">
                {properties.length} propiedades encontradas
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebug}
              >
                🔍 Debug
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRunScraper}
                disabled={scraping}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${scraping ? 'animate-spin' : ''}`} />
                {scraping ? 'Scrapeando...' : 'Scraper Manual'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 items-center">
          <Filter className="w-5 h-5 text-gray-600" />

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Score Mínimo:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-semibold">{minScore}</span>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('split')}
            >
              Split
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              Mapa
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando propiedades...</p>
            </div>
          </div>
        ) : (
          <div
            className={`${
              viewMode === 'split'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                : 'grid grid-cols-1'
            }`}
          >
            {/* Mapa */}
            {(viewMode === 'map' || viewMode === 'split') && (
              <div className={viewMode === 'split' ? 'h-[600px]' : 'h-[800px]'}>
                <PropertyMap
                  properties={properties}
                  onPropertyClick={(property) => setSelectedProperty(property.id)}
                  selectedPropertyId={selectedProperty}
                />
              </div>
            )}

            {/* Grid de propiedades */}
            {(viewMode === 'grid' || viewMode === 'split') && (
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                {properties.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">
                      No hay propiedades que cumplan los criterios.
                    </p>
                    <Button onClick={handleRunScraper}>Ejecutar Scraper</Button>
                  </div>
                ) : (
                  properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onFavorite={handleToggleFavorite}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
