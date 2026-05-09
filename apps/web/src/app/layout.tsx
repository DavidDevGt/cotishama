import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sistema de Cotizaciones - Ferretería Shama',
  description: 'Sistema de cotizaciones con búsqueda fuzzy y generación de PDF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Ferretería Shama - Sistema de Cotizaciones
              </h1>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}