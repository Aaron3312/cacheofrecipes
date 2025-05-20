// src/app/(auth)/layout.tsx
"use client"
import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="mx-auto max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-primary">
            CacheOfRecipes
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Encuentra y guarda tus recetas favoritas
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}