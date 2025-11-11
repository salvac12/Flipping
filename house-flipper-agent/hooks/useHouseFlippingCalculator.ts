import { useState, useMemo } from 'react';

export interface PropertyData {
  purchasePrice: number;
  surface: number;
  salePrice: number;
  projectDuration: number;
  location: string;
}

export interface Parameters {
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
}

export interface Options {
  includeDueDiligence: boolean;
  includeRealEstateCommissionPurchase: boolean;
  includeFurniture: boolean;
  furnitureBudget: number;
  includeConstructionInsurance: boolean;
  includeHomeStaging: boolean;
}

const defaultParameters: Parameters = {
  // Compra - Valores Madrid 2025
  itpRate: 6,
  notaryPurchaseRate: 0.3,
  notaryPurchaseMin: 600,
  registryRate: 0.2,
  registryMin: 400,
  managementFee: 500,
  valuationFee: 400,
  dueDiligenceFee: 800,
  realEstateCommissionPurchaseRate: 3,

  // Reforma
  renovationPricePerM2: 1200,
  renovationVatRate: 21,
  constructionLicenseRate: 4, // ICIO
  architectProjectRate: 3,
  constructionInsuranceRate: 0.5,

  // Mantenimiento
  communityFeeMonthly: 250,
  insuranceMonthly: 50,
  utilitiesMonthly: 100,
  ibiAnnualRate: 0.1,

  // Venta
  realEstateCommissionSaleRate: 5,
  plusvaliaMunicipal: 1250,
  notarySaleRate: 0.1,
  notarySaleMin: 300,
  managementSaleFee: 300,
  energyCertificate: 150,
  habitabilityCertificate: 200,
  homeStagingFee: 1500,
  marketingFee: 500,

  // Impuestos
  corporateTaxRate: 25
};

export function useHouseFlippingCalculator() {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    purchasePrice: 150000,
    surface: 80,
    salePrice: 250000,
    projectDuration: 6,
    location: 'Madrid'
  });

  const [parameters, setParameters] = useState<Parameters>(defaultParameters);

  const [options, setOptions] = useState<Options>({
    includeDueDiligence: false,
    includeRealEstateCommissionPurchase: false,
    includeFurniture: false,
    furnitureBudget: 0,
    includeConstructionInsurance: false,
    includeHomeStaging: true
  });

  const calculations = useMemo(() => {
    // COSTES DE COMPRA
    const purchaseITP = propertyData.purchasePrice * (parameters.itpRate / 100);
    const notaryPurchase = Math.max(
      propertyData.purchasePrice * (parameters.notaryPurchaseRate / 100),
      parameters.notaryPurchaseMin
    );
    const registryFees = Math.max(
      propertyData.purchasePrice * (parameters.registryRate / 100),
      parameters.registryMin
    );

    const dueDiligence = options.includeDueDiligence ? parameters.dueDiligenceFee : 0;
    const purchaseCommission = options.includeRealEstateCommissionPurchase
      ? propertyData.purchasePrice * (parameters.realEstateCommissionPurchaseRate / 100)
      : 0;

    const totalPurchaseCosts =
      propertyData.purchasePrice +
      purchaseITP +
      notaryPurchase +
      registryFees +
      parameters.managementFee +
      parameters.valuationFee +
      dueDiligence +
      purchaseCommission;

    // COSTES DE REFORMA
    const renovationBudget = propertyData.surface * parameters.renovationPricePerM2;
    const renovationVAT = renovationBudget * (parameters.renovationVatRate / 100);
    const constructionLicense = renovationBudget * (parameters.constructionLicenseRate / 100);
    const architectProject = renovationBudget * (parameters.architectProjectRate / 100);
    const constructionInsurance = options.includeConstructionInsurance
      ? renovationBudget * (parameters.constructionInsuranceRate / 100)
      : 0;
    const furnitureCost = options.includeFurniture ? options.furnitureBudget : 0;

    const totalRenovationCosts =
      renovationBudget +
      renovationVAT +
      constructionLicense +
      architectProject +
      constructionInsurance +
      furnitureCost;

    // MANTENIMIENTO
    const monthlyMaintenance =
      parameters.communityFeeMonthly +
      parameters.insuranceMonthly +
      parameters.utilitiesMonthly;

    const ibiAnnual = propertyData.purchasePrice * (parameters.ibiAnnualRate / 100);
    const ibiPeriod = (ibiAnnual / 12) * propertyData.projectDuration;

    const totalMaintenance = (monthlyMaintenance * propertyData.projectDuration) + ibiPeriod;

    // COSTES DE VENTA
    const saleCommissionBase = propertyData.salePrice * (parameters.realEstateCommissionSaleRate / 100);
    const realEstateCommissionSale = saleCommissionBase * 1.21; // + IVA

    const notarySale = Math.max(
      propertyData.salePrice * (parameters.notarySaleRate / 100),
      parameters.notarySaleMin
    );

    const homeStagingAndMarketing = options.includeHomeStaging
      ? parameters.homeStagingFee + parameters.marketingFee
      : parameters.marketingFee;

    const totalSaleCosts =
      realEstateCommissionSale +
      parameters.plusvaliaMunicipal +
      notarySale +
      parameters.managementSaleFee +
      parameters.energyCertificate +
      parameters.habitabilityCertificate +
      homeStagingAndMarketing;

    // TOTALES
    const totalInvestment =
      totalPurchaseCosts +
      totalRenovationCosts +
      totalMaintenance +
      totalSaleCosts;

    const grossProfit = propertyData.salePrice - totalInvestment;
    const corporateTax = grossProfit > 0 ? grossProfit * (parameters.corporateTaxRate / 100) : 0;
    const netProfit = grossProfit - corporateTax;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    const annualizedROI = roi * (12 / propertyData.projectDuration);
    const breakEvenPrice = totalInvestment;
    const safetyMargin = propertyData.salePrice > 0
      ? ((propertyData.salePrice - totalInvestment) / propertyData.salePrice) * 100
      : 0;

    return {
      // Desglose de costes de compra
      purchaseCosts: {
        price: propertyData.purchasePrice,
        itp: purchaseITP,
        notary: notaryPurchase,
        registry: registryFees,
        management: parameters.managementFee,
        valuation: parameters.valuationFee,
        dueDiligence,
        commission: purchaseCommission,
        total: totalPurchaseCosts
      },
      // Desglose de costes de reforma
      renovationCosts: {
        budget: renovationBudget,
        vat: renovationVAT,
        license: constructionLicense,
        architect: architectProject,
        insurance: constructionInsurance,
        furniture: furnitureCost,
        total: totalRenovationCosts
      },
      // Desglose de mantenimiento
      maintenanceCosts: {
        monthly: monthlyMaintenance,
        ibi: ibiPeriod,
        total: totalMaintenance
      },
      // Desglose de costes de venta
      saleCosts: {
        commission: realEstateCommissionSale,
        plusvalia: parameters.plusvaliaMunicipal,
        notary: notarySale,
        management: parameters.managementSaleFee,
        certificates: parameters.energyCertificate + parameters.habitabilityCertificate,
        marketing: homeStagingAndMarketing,
        total: totalSaleCosts
      },
      // Resultados finales
      salePrice: propertyData.salePrice,
      totalInvestment,
      grossProfit,
      corporateTax,
      netProfit,
      roi,
      annualizedROI,
      breakEvenPrice,
      safetyMargin,
      viable: roi > 15 // Consideramos viable si ROI > 15%
    };
  }, [propertyData, parameters, options]);

  return {
    propertyData,
    setPropertyData,
    parameters,
    setParameters,
    options,
    setOptions,
    calculations,
    resetToDefaults: () => setParameters(defaultParameters)
  };
}