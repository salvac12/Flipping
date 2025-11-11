'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Property } from '@prisma/client';
import { MADRID_ZONES } from '@/lib/utils/zones';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: string;
}

export function PropertyMap({
  properties,
  onPropertyClick,
  selectedPropertyId,
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Inicializar mapa centrado en Madrid
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-3.7038, 40.4168], // Madrid centro
      zoom: 12,
    });

    // Añadir controles de navegación
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Esperar a que el mapa cargue
    map.current.on('load', () => {
      setMapLoaded(true);

      // Añadir círculos de zonas prioritarias
      Object.values(MADRID_ZONES).forEach((zone) => {
        const el = document.createElement('div');
        el.className = 'zone-marker';
        el.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        el.style.border = '2px solid #3b82f6';
        el.style.borderRadius = '50%';
        el.style.width = '20px';
        el.style.height = '20px';

        new mapboxgl.Marker({ element: el })
          .setLngLat([zone.longitude, zone.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <h3 class="font-semibold">${zone.displayName}</h3>
                <p class="text-sm text-gray-600">${zone.description}</p>
              </div>`
            )
          )
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Actualizar markers cuando cambian las propiedades
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remover markers existentes
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Añadir nuevos markers
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      // Crear elemento del marker con color basado en score
      const el = document.createElement('div');
      el.className = 'property-marker';

      const scoreColor =
        property.score >= 80
          ? '#22c55e'
          : property.score >= 60
          ? '#eab308'
          : property.score >= 40
          ? '#f97316'
          : '#ef4444';

      el.style.backgroundColor = scoreColor;
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      if (selectedPropertyId === property.id) {
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.border = '4px solid #3b82f6';
      }

      // Crear popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="font-semibold mb-2">${property.title || property.address}</div>
          <div class="text-lg font-bold text-blue-600 mb-1">
            ${new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            }).format(property.price)}
          </div>
          <div class="text-sm text-gray-600 mb-2">
            ${property.m2}m² • ${property.rooms || '?'} hab.
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Score: ${property.score}/100</span>
            <span class="inline-block px-2 py-1 text-xs rounded" style="background-color: ${scoreColor}; color: white;">
              ${property.portal.replace('_', '.')}
            </span>
          </div>
        </div>
      `);

      // Crear marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([property.longitude, property.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Manejar click en marker
      el.addEventListener('click', () => {
        onPropertyClick?.(property);
      });

      markers.current.push(marker);
    });

    // Ajustar zoom para mostrar todas las propiedades
    if (properties.length > 0) {
      const validProperties = properties.filter(
        (p) => p.latitude && p.longitude
      );

      if (validProperties.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();

        validProperties.forEach((property) => {
          bounds.extend([property.longitude!, property.latitude!]);
        });

        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      }
    }
  }, [properties, mapLoaded, selectedPropertyId, onPropertyClick]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-semibold mb-2">Puntuación</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>80-100 (Excelente)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>60-79 (Buena)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>40-59 (Regular)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>&lt;40 (Baja)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
