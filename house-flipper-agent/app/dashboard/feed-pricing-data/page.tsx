'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Construction } from 'lucide-react';
import Link from 'next/link';

export default function FeedPricingDataPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Database className="w-8 h-8 text-primary" />
          Alimentar Base de Datos de Precios
        </h1>
        <p className="text-gray-600">Añade nuevas propiedades para mejorar los precios de referencia</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-center">
            <Construction className="w-6 h-6 text-yellow-600" />
            Página en Desarrollo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Database className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Próximamente Disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Esta página permitirá alimentar la base de datos de precios mediante:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Scrapers automáticos de 5 portales inmobiliarios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Entrada manual de propiedades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Importación desde URL de anuncio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Pegado de texto de anuncio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Estadísticas de la base de datos</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">
                Volver a Calculadora
              </Button>
            </Link>
            <Link href="/dashboard/pricing-reference">
              <Button className="bg-green-600 hover:bg-green-700">
                Consultar Precios
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
