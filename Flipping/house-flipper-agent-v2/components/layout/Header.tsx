"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Home, Calculator, Database, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigation = [
    {
      name: "Calculadora",
      href: "/dashboard/calculator",
      icon: Calculator,
    },
    {
      name: "Precios de Referencia",
      href: "/dashboard/pricing/consult",
      icon: DollarSign,
    },
    {
      name: "Alimentar BBDD",
      href: "/dashboard/pricing/feed",
      icon: Database,
    },
  ];

  return (
    <header className="bg-card border-b border-border shadow-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-[113px]">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Home className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-heading-2 text-foreground">
                House Flipper Platform
              </h1>
              <p className="text-caption text-text-secondary">
                Alimentar Base de Datos
              </p>
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-body-sm text-text-secondary">
                Hola,{" "}
                <span className="font-bold text-text-secondary">
                  {session?.user?.name || "Usuario"}
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-body-sm">Cerrar Sesión</span>
            </Button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="border-t border-border">
          <nav className="flex gap-0">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-body-sm transition-colors relative
                    ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-text-secondary hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
