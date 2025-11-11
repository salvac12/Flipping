'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';

interface CostBreakdownProps {
  calculations: {
    purchaseCosts: {
      price: number;
      itp: number;
      notary: number;
      registry: number;
      management: number;
      valuation: number;
      total: number;
    };
    renovationCosts: {
      budget: number;
      vat: number;
      license: number;
      architect: number;
      total: number;
    };
    maintenanceCosts: {
      monthly: number;
      total: number;
    };
    saleCosts: {
      commission: number;
      plusvalia: number;
      notary: number;
      certificates: number;
      marketing: number;
      total: number;
    };
    totalInvestment: number;
  };
}

export function CostBreakdown({ calculations }: CostBreakdownProps) {
  const CostSection = ({ title, items, total }: { title: string; items: Array<{ label: string; value: number }>; total: number }) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-gray-700">{title}</h4>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="font-semibold">Subtotal</span>
          <span className="font-semibold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose de Costes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CostSection
          title="Costes de Compra"
          items={[
            { label: 'Precio de compra', value: calculations.purchaseCosts.price },
            { label: 'ITP (6%)', value: calculations.purchaseCosts.itp },
            { label: 'Notaría', value: calculations.purchaseCosts.notary },
            { label: 'Registro', value: calculations.purchaseCosts.registry },
            { label: 'Gestoría', value: calculations.purchaseCosts.management },
            { label: 'Tasación', value: calculations.purchaseCosts.valuation },
          ]}
          total={calculations.purchaseCosts.total}
        />

        <CostSection
          title="Costes de Reforma"
          items={[
            { label: 'Presupuesto reforma', value: calculations.renovationCosts.budget },
            { label: 'IVA (21%)', value: calculations.renovationCosts.vat },
            { label: 'Licencia obras (ICIO 4%)', value: calculations.renovationCosts.license },
            { label: 'Proyecto arquitecto', value: calculations.renovationCosts.architect },
          ]}
          total={calculations.renovationCosts.total}
        />

        <CostSection
          title="Gastos de Mantenimiento"
          items={[
            { label: 'Gastos mensuales', value: calculations.maintenanceCosts.monthly },
            { label: 'Total período', value: calculations.maintenanceCosts.total },
          ]}
          total={calculations.maintenanceCosts.total}
        />

        <CostSection
          title="Costes de Venta"
          items={[
            { label: 'Comisión inmobiliaria (5% + IVA)', value: calculations.saleCosts.commission },
            { label: 'Plusvalía municipal', value: calculations.saleCosts.plusvalia },
            { label: 'Notaría', value: calculations.saleCosts.notary },
            { label: 'Certificados', value: calculations.saleCosts.certificates },
            { label: 'Marketing y home staging', value: calculations.saleCosts.marketing },
          ]}
          total={calculations.saleCosts.total}
        />

        <div className="pt-4 border-t-2">
          <div className="flex justify-between">
            <span className="text-lg font-bold">Inversión Total</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(calculations.totalInvestment)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}