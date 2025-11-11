export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image with gradient overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-600/80" />
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="max-w-md space-y-6 text-white">
            <h1 className="text-4xl font-bold">
              Encuentra las mejores oportunidades de inversión inmobiliaria
            </h1>
            <p className="text-lg opacity-90">
              Analiza propiedades, calcula rentabilidad y toma decisiones informadas con nuestra plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
