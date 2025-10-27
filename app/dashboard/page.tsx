'use client';

import { useEffect, useState } from 'react';
import { Property } from '@prisma/client';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyMap } from '@/components/PropertyMap';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { RefreshCw, LogOut, Filter } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">House Flipper Agent</h1>
              <p className="text-sm text-gray-600">
                {properties.length} propiedades encontradas
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunScraper}
                disabled={scraping}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${scraping ? 'animate-spin' : ''}`} />
                {scraping ? 'Scrapeando...' : 'Scraper Manual'}
              </Button>

              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

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
    </div>
  );
}
