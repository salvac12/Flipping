'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Property, PropertyHistory, UserFavorite } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Heart, MapPin, Ruler, Euro, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import Link from 'next/link';

type PropertyWithRelations = Property & {
  history: PropertyHistory[];
  favorites: UserFavorite[];
};

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [property, setProperty] = useState<PropertyWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [resolvedParams.id]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${resolvedParams.id}`);
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Propiedad no encontrada</h2>
          <Button asChild>
            <Link href="/dashboard">Volver al Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const scoreColor =
    property.score >= 80
      ? 'bg-green-500'
      : property.score >= 60
      ? 'bg-yellow-500'
      : property.score >= 40
      ? 'bg-orange-500'
      : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{property.title || property.address}</h1>
              <p className="text-sm text-gray-600">{property.zone}, Madrid</p>
            </div>
            <div className={`${scoreColor} text-white font-bold px-4 py-2 rounded-full`}>
              {property.score}/100
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <Card>
              <CardContent className="p-0">
                {property.images && property.images.length > 0 ? (
                  <div>
                    <div className="relative h-96 bg-gray-200">
                      <img
                        src={property.images[currentImageIndex]}
                        alt={`Imagen ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {property.images.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                          {property.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full ${
                                idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {property.images.length > 1 && (
                      <div className="p-2 flex gap-2 overflow-x-auto">
                        {property.images.slice(0, 6).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-20 h-20 rounded border-2 ${
                              idx === currentImageIndex ? 'border-primary' : 'border-gray-200'
                            }`}
                          >
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-400">
                    Sin imágenes disponibles
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descripción */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Historial de precios */}
            {property.history && property.history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Precios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {property.history.map((record) => (
                      <div key={record.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm text-gray-600">
                          {formatRelativeTime(new Date(record.createdAt))}
                        </span>
                        <span className="font-semibold">{formatCurrency(record.price)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Precio y acciones */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatCurrency(property.price)}
                </div>
                <div className="text-gray-600 mb-4">{formatCurrency(property.pricePerM2)}/m²</div>

                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <a href={property.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver en {property.portal.replace('_', '.')}
                    </a>
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Agregar a Favoritos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Características */}
            <Card>
              <CardHeader>
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Superficie</span>
                  <span className="font-semibold">{property.m2}m²</span>
                </div>

                {property.rooms && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Habitaciones</span>
                    <span className="font-semibold">{property.rooms}</span>
                  </div>
                )}

                {property.bathrooms && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Baños</span>
                    <span className="font-semibold">{property.bathrooms}</span>
                  </div>
                )}

                {property.floor !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Planta</span>
                    <span className="font-semibold">{property.floor}º</span>
                  </div>
                )}

                {property.buildYear && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Año construcción</span>
                    <span className="font-semibold">{property.buildYear}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Exterior</span>
                  <span className="font-semibold">{property.isExterior ? 'Sí' : 'No'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Ascensor</span>
                  <span className="font-semibold">{property.hasLift ? 'Sí' : 'No'}</span>
                </div>

                {property.condition && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado</span>
                    <span className="font-semibold">{property.condition}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scoring details */}
            {property.scoreDetails && typeof property.scoreDetails === 'object' && (
              <Card>
                <CardHeader>
                  <CardTitle>Desglose de Puntuación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(property.scoreDetails as any).breakdown?.reasons.map((reason: string, idx: number) => (
                    <div key={idx} className="py-1 border-b last:border-0">
                      {reason}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
