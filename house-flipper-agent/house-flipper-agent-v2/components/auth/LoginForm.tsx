"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-heading-2">Iniciar sesión</CardTitle>
        <CardDescription className="text-text-secondary">
          Ingresa tus credenciales para acceder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
