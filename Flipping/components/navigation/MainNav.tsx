'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
// import { signOut } from 'next-auth/react'; // Comentado - sin autenticación
import {
  Calculator,
  Search,
  // User,
  // LogOut,
  Home,
  Download
} from 'lucide-react';
// import { Button } from '@/components/ui/button'; // Comentado - sin botones de usuario

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Calculadora',
      icon: Calculator,
      active: pathname === '/dashboard'
    },
    {
      href: '/dashboard/search-agent',
      label: 'Agente de Búsqueda',
      icon: Search,
      active: pathname.startsWith('/dashboard/search-agent') || pathname.startsWith('/dashboard/properties')
    },
    {
      href: '/dashboard/scraper',
      label: 'Scraper',
      icon: Download,
      active: pathname.startsWith('/dashboard/scraper')
    }
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              <span className="hidden sm:inline">House Flipper Agent</span>
              <span className="sm:hidden">HF Agent</span>
            </h1>
          </div>

          {/* Navegación principal */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors ${
                    item.active
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium hidden sm:inline">{item.label}</span>
                  <span className="font-medium sm:hidden text-xs">
                    {item.label === 'Calculadora' ? 'Calc' : 'Buscar'}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Acciones de usuario - Ocultas temporalmente (sin autenticación)
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              disabled
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
          */}
        </div>
      </div>
    </header>
  );
}