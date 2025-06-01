// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CacheOfRecipes - Descubre y Guarda tus Recetas Favoritas',
  description: 'Una aplicación moderna para descubrir, buscar y guardar tus recetas favoritas. Encuentra inspiración culinaria para cualquier ocasión.',
  keywords: ['recetas', 'cocina', 'comida', 'ingredientes', 'chef'],
  authors: [{ name: 'CacheOfRecipes Team' }],
  creator: 'CacheOfRecipes',
  publisher: 'CacheOfRecipes',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://cacheofrecipes.com',
    siteName: 'CacheOfRecipes',
    title: 'CacheOfRecipes - Descubre y Guarda tus Recetas Favoritas',
    description: 'Una aplicación moderna para descubrir, buscar y guardar tus recetas favoritas.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CacheOfRecipes - Descubre y Guarda tus Recetas Favoritas',
    description: 'Una aplicación moderna para descubrir, buscar y guardar tus recetas favoritas.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} theme-transition`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}