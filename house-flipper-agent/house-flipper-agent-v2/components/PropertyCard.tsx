'use client';

import { Property } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, ExternalLink, MapPin, Ruler, Euro, TrendingUp } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import Link from 'next/link';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: boolean;
}

export function PropertyCard({ property, onFavorite, isFavorite = false }: PropertyCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPortalColor = (portal: string) => {
    switch (portal) {
      case 'IDEALISTA':
        return 'bg-yellow-500';
      case 'FOTOCASA':
        return 'bg-blue-500';
      case 'PISOS_COM':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0 relative">
        {/* Imagen principal */}
        <div className="relative h-48 bg-gray-200">
          {property.images && property.images.length > 0 ? (
            <>
              <img
                src={property.images[0]}
                alt={property.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setIsImageLoaded(true)}
              />
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sin imágenes
            </div>
          )}

          {/* Badges superiores */}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge className={getPortalColor(property.portal)}>
              {property.portal.replace('_', '.')}
            </Badge>
            {property.needsReform && (
              <Badge variant="destructive">Para Reformar</Badge>
            )}
          </div>

          {/* Score badge */}
          <div className="absolute top-2 right-2">
            <div
              className={`${getScoreColor(
                property.score
              )} text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg`}
            >
              {property.score}/100
            </div>
          </div>

          {/* Botón de favorito */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite?.(property.id);
            }}
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Precio y precio por m2 */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(property.price)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(property.pricePerM2)}/m²
            </div>
          </div>
          {property.scrapedAt && (
            <div className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(property.scrapedAt))}
            </div>
          )}
        </div>

        {/* Título/Dirección */}
        <h3 className="font-semibold text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
          {property.title || property.address}
        </h3>

        {/* Características */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1 text-sm">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <span>{property.m2}m²</span>
          </div>

          {property.rooms && (
            <div className="text-sm">
              <span className="font-medium">{property.rooms}</span> hab.
            </div>
          )}

          {property.floor !== null && property.floor !== undefined && (
            <div className="text-sm">
              Planta <span className="font-medium">{property.floor}º</span>
            </div>
          )}

          {property.isExterior && (
            <div className="text-sm">
              <span className="text-green-600 font-medium">Exterior</span>
            </div>
          )}
        </div>

        {/* Zona */}
        {property.zone && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span>{property.zone}</span>
          </div>
        )}

        {/* Scoring details preview */}
        {property.scoreDetails && typeof property.scoreDetails === 'object' && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>
              {(property.scoreDetails as any).breakdown?.isInPriorityZone
                ? 'Zona prioritaria'
                : 'Fuera de zona prioritaria'}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild className="flex-1" size="sm">
          <Link href={`/dashboard/properties/${property.id}`}>Ver Detalles</Link>
        </Button>

        <Button asChild variant="outline" size="sm">
          <a href={property.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
