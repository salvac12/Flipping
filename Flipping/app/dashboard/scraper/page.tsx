import { BarrioSelector } from '@/components/scraper/BarrioSelector';

export const metadata = {
  title: 'Scraper de Barrios - House Flipper Agent',
  description: 'Scrapea propiedades de Idealista por barrios de Madrid',
};

export default function ScraperPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Scraper de Propiedades
          </h1>
          <p className="text-gray-600">
            Scrapea propiedades de Idealista por barrios específicos de Madrid
          </p>
        </div>

        {/* Componente principal */}
        <BarrioSelector />

        {/* Estadísticas rápidas */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm text-gray-600 mb-1">Barrios Disponibles</p>
            <p className="text-2xl font-bold text-gray-900">42</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm text-gray-600 mb-1">Distritos</p>
            <p className="text-2xl font-bold text-gray-900">7</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm text-gray-600 mb-1">Zonas Prioritarias</p>
            <p className="text-2xl font-bold text-gray-900">6</p>
          </div>
        </div>

        {/* Guía rápida */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📚 Guía Rápida
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">1.</span>
              <p>
                <strong>Selecciona un barrio</strong> de Madrid del selector de arriba, o
                deja en blanco para scrapear toda la ciudad.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">2.</span>
              <p>
                <strong>Haz clic en "Scrapear"</strong> y espera 2-3 segundos mientras
                ScraperAPI obtiene las propiedades.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">3.</span>
              <p>
                <strong>Revisa los resultados</strong> debajo. Las propiedades se guardan
                automáticamente en la base de datos.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">4.</span>
              <p>
                <strong>Ve al Agente de Búsqueda</strong> para ver todas las propiedades
                guardadas y filtrar por criterios.
              </p>
            </div>
          </div>
        </div>

        {/* Zonas prioritarias */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            ⭐ Zonas Prioritarias
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            Estas zonas tienen mejor scoring para house flipping:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Guindalera',
              'Delicias',
              'Pacífico',
              'Retiro',
              'Prosperidad',
              'Argüelles',
            ].map((zona) => (
              <div
                key={zona}
                className="bg-white rounded-md px-3 py-2 text-sm font-medium text-gray-900 shadow-sm"
              >
                {zona}
              </div>
            ))}
          </div>
        </div>

        {/* Límites de uso */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">⚠️ Límites de Uso</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Plan gratuito de ScraperAPI: 1,000 requests/mes</li>
            <li>• Cada scraping consume 1 request</li>
            <li>• Recomendado: Scrapear barrios específicos en lugar de toda Madrid</li>
            <li>• Configura un cron job para scraping automático diario</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
