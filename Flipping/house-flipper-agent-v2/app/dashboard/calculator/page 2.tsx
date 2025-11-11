"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalculatorPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-heading-1 text-text-primary">
          Calculadora de House Flipping
        </h1>
        <p className="text-body text-text-secondary">
          Analiza la rentabilidad de tus inversiones inmobiliarias
        </p>
      </div>

      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-heading-2">
            Calculadora en construcción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body text-text-secondary">
            Esta funcionalidad se migrará del proyecto actual próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
