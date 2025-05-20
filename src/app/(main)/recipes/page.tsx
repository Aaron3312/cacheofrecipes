// src/app/(main)/recipes/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RecipeSearchForm } from '@/components/recipes/recipe-search';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecipeSearch } from '@/hooks/use-recipes';
import { RecipeSearchParams } from '@/types/recipe';

function RecipesContent() {
  const searchParams = useSearchParams();
  const [initialParams, setInitialParams] = useState<RecipeSearchParams>({});

  // Configurar parámetros iniciales desde la URL
  useEffect(() => {
    if (searchParams) {
      const params: RecipeSearchParams = {};
      
      if (searchParams.has('query')) {
        params.query = searchParams.get('query') || undefined;
      }
      
      if (searchParams.has('cuisine')) {
        params.cuisine = searchParams.get('cuisine') || undefined;
      }
      
      if (searchParams.has('diet')) {
        params.diet = searchParams.get('diet') || undefined;
      }
      
      if (searchParams.has('intolerances')) {
        params.intolerances = searchParams.get('intolerances') || undefined;
      }
      
      if (searchParams.has('type')) {
        params.type = searchParams.get('type') || undefined;
      }
      
      if (searchParams.has('maxReadyTime')) {
        params.maxReadyTime = Number(searchParams.get('maxReadyTime')) || undefined;
      }
      
      // Número de resultados por página
      params.number = 12;
      
      setInitialParams(params);
    }
  }, [searchParams]);

  const {
    recipes,
    totalResults,
    offset,
    number,
    isLoading,
    error,
    searchParams: currentParams,
    updateSearchParams
  } = useRecipeSearch(initialParams);

  // Manejar búsqueda
  const handleSearch = (params: RecipeSearchParams) => {
    updateSearchParams({
      ...params,
      offset: 0 // Reiniciar paginación
    });
  };

  // Manejar paginación
  const handleLoadMore = () => {
    updateSearchParams({
      offset: offset + number
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Explorar Recetas</h1>
        <p className="text-muted-foreground">
          Encuentra inspiración culinaria para cualquier ocasión o preferencia.
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <RecipeSearchForm 
        onSearch={handleSearch}
        initialParams={currentParams}
      />

      {/* Resultados */}
      <div className="space-y-4">
        {isLoading && offset === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(null).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">Error al cargar recetas: {error.toString()}</p>
            <Button variant="outline" className="mt-4" onClick={() => updateSearchParams(currentParams)}>
              Intentar de nuevo
            </Button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xl">No se encontraron recetas que coincidan con tu búsqueda.</p>
            <p className="text-muted-foreground mt-2">Intenta con otros términos o filtros.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {totalResults} resultados encontrados
              </p>
              <p className="text-sm text-muted-foreground">
                Mostrando {Math.min(offset + recipes.length, totalResults)} de {totalResults}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            
            {offset + recipes.length < totalResults && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : 'Cargar más recetas'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Explorar Recetas</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(null).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    }>
      <RecipesContent />
    </Suspense>
  );
}