'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface AdvancedParametersProps {
  parameters: {
    // Compra
    itpRate: number;
    notaryPurchaseRate: number;
    notaryPurchaseMin: number;
    registryRate: number;
    registryMin: number;
    managementFee: number;
    valuationFee: number;
    dueDiligenceFee: number;
    realEstateCommissionPurchaseRate: number;
    // Reforma
    renovationPricePerM2: number;
    renovationVatRate: number;
    constructionLicenseRate: number;
    architectProjectRate: number;
    constructionInsuranceRate: number;
    // Mantenimiento
    communityFeeMonthly: number;
    insuranceMonthly: number;
    utilitiesMonthly: number;
    ibiAnnualRate: number;
    // Venta
    realEstateCommissionSaleRate: number;
    plusvaliaMunicipal: number;
    notarySaleRate: number;
    notarySaleMin: number;
    managementSaleFee: number;
    energyCertificate: number;
    habitabilityCertificate: number;
    homeStagingFee: number;
    marketingFee: number;
    // Impuestos
    corporateTaxRate: number;
  };
  options: {
    includeDueDiligence: boolean;
    includeRealEstateCommissionPurchase: boolean;
    includeFurniture: boolean;
    furnitureBudget: number;
    includeConstructionInsurance: boolean;
    includeHomeStaging: boolean;
  };
  onParametersChange: (params: any) => void;
  onOptionsChange: (options: any) => void;
  onReset: () => void;
}

export function AdvancedParameters({
  parameters,
  options,
  onParametersChange,
  onOptionsChange,
  onReset
}: AdvancedParametersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleParameterChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onParametersChange({ ...parameters, [key]: numValue });
  };

  const handleOptionChange = (key: string, checked: boolean) => {
    onOptionsChange({ ...options, [key]: checked });
  };

  return (
    <Card className="border-2 border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Parámetros Completos de Cálculo
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <CardContent className="px-6 pb-6 space-y-6">

          {/* COMPRA */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🏠 Costes de Compra</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="itpRate" className="text-xs text-gray-600">ITP (%)</Label>
                <Input
                  id="itpRate"
                  type="number"
                  step="0.1"
                  value={parameters.itpRate}
                  onChange={(e) => handleParameterChange('itpRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notaryPurchaseRate" className="text-xs text-gray-600">Notaría Compra (%)</Label>
                <Input
                  id="notaryPurchaseRate"
                  type="number"
                  step="0.1"
                  value={parameters.notaryPurchaseRate}
                  onChange={(e) => handleParameterChange('notaryPurchaseRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notaryPurchaseMin" className="text-xs text-gray-600">Notaría Min (€)</Label>
                <Input
                  id="notaryPurchaseMin"
                  type="number"
                  value={parameters.notaryPurchaseMin}
                  onChange={(e) => handleParameterChange('notaryPurchaseMin', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="registryRate" className="text-xs text-gray-600">Registro (%)</Label>
                <Input
                  id="registryRate"
                  type="number"
                  step="0.1"
                  value={parameters.registryRate}
                  onChange={(e) => handleParameterChange('registryRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="registryMin" className="text-xs text-gray-600">Registro Min (€)</Label>
                <Input
                  id="registryMin"
                  type="number"
                  value={parameters.registryMin}
                  onChange={(e) => handleParameterChange('registryMin', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="managementFee" className="text-xs text-gray-600">Gestoría (€)</Label>
                <Input
                  id="managementFee"
                  type="number"
                  value={parameters.managementFee}
                  onChange={(e) => handleParameterChange('managementFee', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="valuationFee" className="text-xs text-gray-600">Tasación (€)</Label>
                <Input
                  id="valuationFee"
                  type="number"
                  value={parameters.valuationFee}
                  onChange={(e) => handleParameterChange('valuationFee', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dueDiligenceFee" className="text-xs text-gray-600">Due Diligence (€)</Label>
                <Input
                  id="dueDiligenceFee"
                  type="number"
                  value={parameters.dueDiligenceFee}
                  onChange={(e) => handleParameterChange('dueDiligenceFee', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="realEstateCommissionPurchaseRate" className="text-xs text-gray-600">Comisión Compra (%)</Label>
                <Input
                  id="realEstateCommissionPurchaseRate"
                  type="number"
                  step="0.1"
                  value={parameters.realEstateCommissionPurchaseRate}
                  onChange={(e) => handleParameterChange('realEstateCommissionPurchaseRate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeDueDiligence"
                  checked={options.includeDueDiligence}
                  onChange={(e) => handleOptionChange('includeDueDiligence', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="includeDueDiligence" className="text-sm cursor-pointer">
                  Incluir Due Diligence
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeRealEstateCommissionPurchase"
                  checked={options.includeRealEstateCommissionPurchase}
                  onChange={(e) => handleOptionChange('includeRealEstateCommissionPurchase', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="includeRealEstateCommissionPurchase" className="text-sm cursor-pointer">
                  Incluir Comisión de Compra
                </Label>
              </div>
            </div>
          </div>

          {/* REFORMA */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-bold text-gray-900 mb-3">🔨 Costes de Reforma</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="renovationPricePerM2" className="text-xs text-gray-600">Reforma (€/m²)</Label>
                <Input
                  id="renovationPricePerM2"
                  type="number"
                  value={parameters.renovationPricePerM2}
                  onChange={(e) => handleParameterChange('renovationPricePerM2', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="renovationVatRate" className="text-xs text-gray-600">IVA Reforma (%)</Label>
                <Input
                  id="renovationVatRate"
                  type="number"
                  step="0.1"
                  value={parameters.renovationVatRate}
                  onChange={(e) => handleParameterChange('renovationVatRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="constructionLicenseRate" className="text-xs text-gray-600">Licencia Obra (%)</Label>
                <Input
                  id="constructionLicenseRate"
                  type="number"
                  step="0.1"
                  value={parameters.constructionLicenseRate}
                  onChange={(e) => handleParameterChange('constructionLicenseRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="architectProjectRate" className="text-xs text-gray-600">Proyecto Arquitecto (%)</Label>
                <Input
                  id="architectProjectRate"
                  type="number"
                  step="0.1"
                  value={parameters.architectProjectRate}
                  onChange={(e) => handleParameterChange('architectProjectRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="constructionInsuranceRate" className="text-xs text-gray-600">Seguro Obra (%)</Label>
                <Input
                  id="constructionInsuranceRate"
                  type="number"
                  step="0.1"
                  value={parameters.constructionInsuranceRate}
                  onChange={(e) => handleParameterChange('constructionInsuranceRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="furnitureBudget" className="text-xs text-gray-600">Mobiliario (€)</Label>
                <Input
                  id="furnitureBudget"
                  type="number"
                  value={options.furnitureBudget}
                  onChange={(e) => onOptionsChange({ ...options, furnitureBudget: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeConstructionInsurance"
                  checked={options.includeConstructionInsurance}
                  onChange={(e) => handleOptionChange('includeConstructionInsurance', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="includeConstructionInsurance" className="text-sm cursor-pointer">
                  Incluir Seguro de Obra
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeFurniture"
                  checked={options.includeFurniture}
                  onChange={(e) => handleOptionChange('includeFurniture', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="includeFurniture" className="text-sm cursor-pointer">
                  Incluir Mobiliario
                </Label>
              </div>
            </div>
          </div>

          {/* MANTENIMIENTO */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-bold text-gray-900 mb-3">🏡 Mantenimiento Mensual</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="communityFeeMonthly" className="text-xs text-gray-600">Comunidad (€/mes)</Label>
                <Input
                  id="communityFeeMonthly"
                  type="number"
                  value={parameters.communityFeeMonthly}
                  onChange={(e) => handleParameterChange('communityFeeMonthly', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="insuranceMonthly" className="text-xs text-gray-600">Seguro (€/mes)</Label>
                <Input
                  id="insuranceMonthly"
                  type="number"
                  value={parameters.insuranceMonthly}
                  onChange={(e) => handleParameterChange('insuranceMonthly', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="utilitiesMonthly" className="text-xs text-gray-600">Suministros (€/mes)</Label>
                <Input
                  id="utilitiesMonthly"
                  type="number"
                  value={parameters.utilitiesMonthly}
                  onChange={(e) => handleParameterChange('utilitiesMonthly', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ibiAnnualRate" className="text-xs text-gray-600">IBI (% anual)</Label>
                <Input
                  id="ibiAnnualRate"
                  type="number"
                  step="0.01"
                  value={parameters.ibiAnnualRate}
                  onChange={(e) => handleParameterChange('ibiAnnualRate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* VENTA */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-bold text-gray-900 mb-3">💰 Costes de Venta</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="realEstateCommissionSaleRate" className="text-xs text-gray-600">Comisión Venta (%)</Label>
                <Input
                  id="realEstateCommissionSaleRate"
                  type="number"
                  step="0.1"
                  value={parameters.realEstateCommissionSaleRate}
                  onChange={(e) => handleParameterChange('realEstateCommissionSaleRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="plusvaliaMunicipal" className="text-xs text-gray-600">Plusvalía (€)</Label>
                <Input
                  id="plusvaliaMunicipal"
                  type="number"
                  value={parameters.plusvaliaMunicipal}
                  onChange={(e) => handleParameterChange('plusvaliaMunicipal', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notarySaleRate" className="text-xs text-gray-600">Notaría Venta (%)</Label>
                <Input
                  id="notarySaleRate"
                  type="number"
                  step="0.01"
                  value={parameters.notarySaleRate}
                  onChange={(e) => handleParameterChange('notarySaleRate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notarySaleMin" className="text-xs text-gray-600">Notaría Min (€)</Label>
                <Input
                  id="notarySaleMin"
                  type="number"
                  value={parameters.notarySaleMin}
                  onChange={(e) => handleParameterChange('notarySaleMin', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="managementSaleFee" className="text-xs text-gray-600">Gestoría Venta (€)</Label>
                <Input
                  id="managementSaleFee"
                  type="number"
                  value={parameters.managementSaleFee}
                  onChange={(e) => handleParameterChange('managementSaleFee', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="energyCertificate" className="text-xs text-gray-600">Cédula Energética (€)</Label>
                <Input
                  id="energyCertificate"
                  type="number"
                  value={parameters.energyCertificate}
                  onChange={(e) => handleParameterChange('energyCertificate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="habitabilityCertificate" className="text-xs text-gray-600">Cédula Habitabilidad (€)</Label>
                <Input
                  id="habitabilityCertificate"
                  type="number"
                  value={parameters.habitabilityCertificate}
                  onChange={(e) => handleParameterChange('habitabilityCertificate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="homeStagingFee" className="text-xs text-gray-600">Home Staging (€)</Label>
                <Input
                  id="homeStagingFee"
                  type="number"
                  value={parameters.homeStagingFee}
                  onChange={(e) => handleParameterChange('homeStagingFee', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="marketingFee" className="text-xs text-gray-600">Marketing (€)</Label>
                <Input
                  id="marketingFee"
                  type="number"
                  value={parameters.marketingFee}
                  onChange={(e) => handleParameterChange('marketingFee', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeHomeStaging"
                  checked={options.includeHomeStaging}
                  onChange={(e) => handleOptionChange('includeHomeStaging', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="includeHomeStaging" className="text-sm cursor-pointer">
                  Incluir Home Staging
                </Label>
              </div>
            </div>
          </div>

          {/* IMPUESTOS */}
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-bold text-gray-900 mb-3">📊 Impuestos</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="corporateTaxRate" className="text-xs text-gray-600">Impuesto Sociedades (%)</Label>
                <Input
                  id="corporateTaxRate"
                  type="number"
                  step="0.1"
                  value={parameters.corporateTaxRate}
                  onChange={(e) => handleParameterChange('corporateTaxRate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Botón Restaurar */}
          <div className="pt-4 border-t">
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar Valores por Defecto (Madrid 2025)
            </Button>
          </div>

        </CardContent>
      )}
    </Card>
  );
}
