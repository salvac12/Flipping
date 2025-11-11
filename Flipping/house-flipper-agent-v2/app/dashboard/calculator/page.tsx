'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Calculator,
  FileText,
  FileSpreadsheet,
  FolderOpen,
  Trash2
} from 'lucide-react';

function CalculatorContent() {
  const searchParams = useSearchParams();
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

  // Handle pricing data from URL parameters
  useEffect(() => {
    const reformed = searchParams.get('reformed');
    const unreformed = searchParams.get('unreformed');
    const neighborhood = searchParams.get('neighborhood');

    if (reformed && unreformed) {
      setPriceEstimation({
        reformedPrice: Number(reformed),
        unreformedPrice: Number(unreformed),
        avgPrice: Number(reformed)
      });

      setPropertyData(prev => ({
        ...prev,
        salePrice: Number(reformed) * prev.surface,
        location: neighborhood || prev.location
      }));
    }
  }, [searchParams, setPropertyData]);

  const handleEstimateComplete = (estimation: any) => {
    setPriceEstimation(estimation);
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
        loadSavedAnalyses();
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
    alert('Exportación a PDF disponible próximamente');
  };

  const handleExportExcel = () => {
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

        setPropertyData({
          purchasePrice: analysis.purchasePrice,
          surface: analysis.surface,
          salePrice: analysis.salePrice,
          projectDuration: analysis.duration,
          location: analysis.location
        });

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

  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-heading-1 text-text-primary flex items-center gap-2">
            <Calculator className="w-7 h-7 text-primary" />
            Calculadora de Inversión Inmobiliaria
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Analiza la rentabilidad de tu inversión inmobiliaria
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSaveAnalysis}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-dark"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Advanced Parameters */}
      <AdvancedParameters
        parameters={parameters}
        options={options}
        onParametersChange={setParameters}
        onOptionsChange={setOptions}
        onReset={resetToDefaults}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Panel - Input */}
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
            }}
            onEstimateComplete={handleEstimateComplete}
            analysisId={currentAnalysisId || undefined}
          />

          <CostBreakdown
            calculations={calculations}
          />
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          <ResultsSummary
            calculations={calculations}
            projectDuration={propertyData.projectDuration}
          />

          {/* Export Actions */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-heading-2">Exportar Análisis</CardTitle>
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

          {/* Saved Analyses */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-heading-2">Análisis Guardados</CardTitle>
                {isLoadingAnalyses && (
                  <span className="text-caption text-text-secondary">Cargando...</span>
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
                          ? 'border-primary bg-accent'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-body-sm font-medium text-text-primary">{analysis.name}</p>
                        <div className="flex gap-3 text-caption text-text-secondary mt-1">
                          <span>{analysis.location}</span>
                          <span>•</span>
                          <span>ROI: {analysis.roi?.toFixed(1)}%</span>
                          <span>•</span>
                          <span className={analysis.viable ? 'text-success' : 'text-destructive'}>
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
                          className="text-destructive hover:text-destructive"
                          title="Eliminar análisis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-text-secondary text-center py-4">
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

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
