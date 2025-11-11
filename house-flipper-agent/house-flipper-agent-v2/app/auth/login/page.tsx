import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function LoginPage() {
  return (
    <div className="space-y-10">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
          <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="mt-8">
          <LoginForm />
          <div className="mt-4 text-center text-sm text-text-secondary">
            <Link href="/auth/forgot-password" className="hover:text-primary">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="register" className="mt-8">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
