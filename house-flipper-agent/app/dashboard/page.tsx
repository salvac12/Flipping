'use client';

import { useState, useEffect } from 'react';
import { useHouseFlippingCalculator } from '@/hooks/useHouseFlippingCalculator';
import { InputPanel } from '@/components/house-flipping/InputPanel';
import { CostBreakdown } from '@/components/house-flipping/CostBreakdown';
import { ResultsSummary } from '@/components/house-flipping/ResultsSummary';
import { AdvancedParameters } from '@/components/house-flipping/AdvancedParameters';
import PriceEstimator from '@/components/calculator/PriceEstimator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Save,
  Download,
  Settings,
  Calculator,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Trash2,
  FolderOpen
} from 'lucide-react';

export default function HouseFlippingCalculatorPage() {
  const {
    propertyData,
    setPropertyData,
    parameters,
    setParameters,
    options,
    setOptions,
    calculations,
    resetToDefaults
  } = useHouseFlippingCalculator();

  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [priceEstimation, setPriceEstimation] = useState<any>(null);

  const handleEstimateComplete = (estimation: any) => {
    setPriceEstimation(estimation);
    // Actualizar precio de venta con la estimación promedio
    if (estimation?.avgPrice) {
      setPropertyData({
        ...propertyData,
        salePrice: estimation.avgPrice
      });
    }
  };

  const handleSaveAnalysis = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Análisis ${propertyData.location} - ${new Date().toLocaleDateString('es-ES')}`,
          notes: '',
          purchasePrice: propertyData.purchasePrice,
          salePrice: propertyData.salePrice,
          surface: propertyData.surface,
          duration: propertyData.projectDuration,
          location: propertyData.location,
          calculations,
          parameters,
          totalInvestment: calculations.totalInvestment,
          netProfit: calculations.netProfit,
          roi: calculations.roi,
          viable: calculations.viable
        })
      });

      if (response.ok) {
        const saved = await response.json();
        setCurrentAnalysisId(saved.analysis.id);
        alert('Análisis guardado correctamente');
        loadSavedAnalyses(); // Recargar lista
      } else {
        alert('Error al guardar el análisis');
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error al guardar el análisis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    // TODO: Implementar exportación a PDF
    alert('Exportación a PDF disponible próximamente');
  };

  const handleExportExcel = () => {
    // TODO: Implementar exportación a Excel
    alert('Exportación a Excel disponible próximamente');
  };

  const loadSavedAnalyses = async () => {
    setIsLoadingAnalyses(true);
    try {
      const response = await fetch('/api/analysis');
      if (response.ok) {
        const data = await response.json();
        setSavedAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  const loadAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}`);
      if (response.ok) {
        const data = await response.json();
        const analysis = data.analysis;

        // Cargar los datos en el formulario
        setPropertyData({
          purchasePrice: analysis.purchasePrice,
          surface: analysis.surface,
          salePrice: analysis.salePrice,
          projectDuration: analysis.duration,
          location: analysis.location
        });

        // Cargar parámetros si existen
        if (analysis.parameters) {
          setParameters(analysis.parameters);
        }

        setCurrentAnalysisId(analysisId);
        alert('Análisis cargado correctamente');
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      alert('Error al cargar el análisis');
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (!confirm('¿Estás seguro de eliminar este análisis?')) return;

    try {
      const response = await fetch(`/api/analysis/${analysisId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (currentAnalysisId === analysisId) {
          setCurrentAnalysisId(null);
        }
        loadSavedAnalyses();
        alert('Análisis eliminado');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert('Error al eliminar el análisis');
    }
  };

  // Cargar análisis guardados al montar el componente
  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="hidden sm:inline">Calculadora de Inversión Inmobiliaria</span>
            <span className="sm:hidden">Calculadora</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Analiza la rentabilidad de tu inversión inmobiliaria
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={handleSaveAnalysis}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Parámetros Avanzados */}
      <AdvancedParameters
        parameters={parameters}
        options={options}
        onParametersChange={setParameters}
        onOptionsChange={setOptions}
        onReset={resetToDefaults}
      />

      {/* Grid Principal - Stack en móvil, 2 columnas en desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Panel Izquierdo - Entrada de Datos */}
        <div className="space-y-6">
          <InputPanel
            propertyData={propertyData}
            onPropertyDataChange={setPropertyData}
          />

          <PriceEstimator
            propertyData={{
              surface: propertyData.surface,
              address: propertyData.location,
              zone: propertyData.location,
              // Agregar más datos cuando estén disponibles
            }}
            onEstimateComplete={handleEstimateComplete}
            analysisId={currentAnalysisId || undefined}
          />

          <CostBreakdown
            calculations={calculations}
          />
        </div>

        {/* Panel Derecho - Resultados */}
        <div className="space-y-6">
          <ResultsSummary
            calculations={calculations}
            projectDuration={propertyData.projectDuration}
          />

          {/* Acciones de Exportación */}
          <Card>
            <CardHeader>
              <CardTitle>Exportar Análisis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportPDF}
              >
                <FileText className="w-4 h-4 mr-2 text-red-500" />
                Descargar como PDF
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportExcel}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-500" />
                Descargar como Excel
              </Button>
            </CardContent>
          </Card>

          {/* Análisis Guardados */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Análisis Guardados</CardTitle>
                {isLoadingAnalyses && (
                  <span className="text-xs text-gray-500">Cargando...</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {savedAnalyses.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className={`flex justify-between items-center p-3 rounded-lg border ${
                        currentAnalysisId === analysis.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{analysis.name}</p>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          <span>{analysis.location}</span>
                          <span>•</span>
                          <span>ROI: {analysis.roi?.toFixed(1)}%</span>
                          <span>•</span>
                          <span className={analysis.viable ? 'text-green-600' : 'text-red-600'}>
                            {analysis.viable ? 'Viable' : 'No viable'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadAnalysis(analysis.id)}
                          title="Cargar análisis"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAnalysis(analysis.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar análisis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay análisis guardados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}