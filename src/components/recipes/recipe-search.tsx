// src/components/recipes/recipe-search.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X } from 'lucide-react';
import { cuisines, diets, intolerances, mealTypes } from '@/lib/recipe-filters';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { RecipeSearchParams } from '@/types/recipe';

interface RecipeSearchFormProps {
  onSearch: (params: RecipeSearchParams) => void;
  initialParams?: RecipeSearchParams;
}

export function RecipeSearchForm({ onSearch, initialParams }: RecipeSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string>('_any');
  const [diet, setDiet] = useState<string>('_any');
  const [intolerance, setIntolerance] = useState<string>('_any');
  const [type, setType] = useState<string>('_any');
  const [maxReadyTime, setMaxReadyTime] = useState<number>(60);
  
  // Efecto para inicializar valores desde URL o props
  useEffect(() => {
    if (searchParams) {
      setQuery(searchParams.get('query') || initialParams?.query || '');
      setCuisine(searchParams.get('cuisine') || initialParams?.cuisine || '_any');
      setDiet(searchParams.get('diet') || initialParams?.diet || '_any');
      setIntolerance(searchParams.get('intolerances') || initialParams?.intolerances || '_any');
      setType(searchParams.get('type') || initialParams?.type || '_any');
      setMaxReadyTime(Number(searchParams.get('maxReadyTime')) || initialParams?.maxReadyTime || 60);
    }
  }, [searchParams, initialParams]);
  
  // Manejar búsqueda
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const params: RecipeSearchParams = {
      query: query || undefined,
      cuisine: cuisine !== '_any' ? cuisine : undefined,
      diet: diet !== '_any' ? diet : undefined,
      intolerances: intolerance !== '_any' ? intolerance : undefined,
      type: type !== '_any' ? type : undefined,
      maxReadyTime: maxReadyTime || undefined,
      number: 12,
    };
    
    onSearch(params);
    
    // Actualizar URL
    const searchParamsObj = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParamsObj.set(key, String(value));
      }
    });
    
    router.push(`/recipes?${searchParamsObj.toString()}`);
  };
  
  // Limpiar filtros
  const clearFilters = () => {
    setCuisine('_any');
    setDiet('_any');
    setIntolerance('_any');
    setType('_any');
    setMaxReadyTime(60);
  };
  
  // Verificar si hay filtros aplicados
  const hasFilters = cuisine !== '_any' || diet !== '_any' || intolerance !== '_any' || type !== '_any' || maxReadyTime !== 60;
  
  return (
    <div className="space-y-4">
      {/* Formulario de búsqueda principal */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar recetas..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        {/* Botones de filtro */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" type="button" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filtros</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Filtra las recetas según tus preferencias.
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cocina</label>
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier cocina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_any">Cualquier cocina</SelectItem>
                    {cuisines.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Dieta</label>
                <Select value={diet} onValueChange={setDiet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier dieta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_any">Cualquier dieta</SelectItem>
                    {diets.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Intolerancias</label>
                <Select value={intolerance} onValueChange={setIntolerance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguna intolerancia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_any">Ninguna intolerancia</SelectItem>
                    {intolerances.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de comida</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_any">Cualquier tipo</SelectItem>
                    {mealTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Tiempo máximo de preparación</label>
                  <span className="text-sm text-muted-foreground">{maxReadyTime} minutos</span>
                </div>
                <Slider
                  value={[maxReadyTime]}
                  min={15}
                  max={120}
                  step={5}
                  onValueChange={(value) => setMaxReadyTime(value[0])}
                />
              </div>
              
              {hasFilters && (
                <Button 
                  variant="ghost" 
                  type="button" 
                  className="w-full" 
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
            
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" onClick={() => handleSearch()}>
                  Aplicar filtros
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        <Button type="submit">Buscar</Button>
      </form>
      
      {/* Mostrar filtros activos */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtros:</span>
          <div className="flex flex-wrap gap-1">
            {cuisine !== '_any' && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                {cuisines.find(c => c.value === cuisine)?.label || cuisine}
              </span>
            )}
            {diet !== '_any' && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                {diets.find(d => d.value === diet)?.label || diet}
              </span>
            )}
            {intolerance !== '_any' && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                Sin {intolerances.find(i => i.value === intolerance)?.label || intolerance}
              </span>
            )}
            {type !== '_any' && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                {mealTypes.find(t => t.value === type)?.label || type}
              </span>
            )}
            {maxReadyTime !== 60 && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                Máx. {maxReadyTime} min
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs" 
              onClick={clearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}