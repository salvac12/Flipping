"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al registrar");
        return;
      }

      router.push("/auth/login");
    } catch (error) {
      setError("Error al registrar");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-heading-2">Crear cuenta</CardTitle>
        <CardDescription className="text-text-secondary">
          Ingresa tus datos para registrarte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-body-sm text-text-tertiary">
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Tu nombre"
              required
              disabled={isLoading}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-body-sm text-text-tertiary">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-body-sm text-text-tertiary">
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-10"
              minLength={6}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-10 bg-primary hover:bg-primary-dark"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Crear cuenta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
