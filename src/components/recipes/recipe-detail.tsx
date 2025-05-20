// src/components/recipes/recipe-detail.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RecipeDetail } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Heart, Clock, Users, ExternalLink, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/use-favorites';
import { RecipeRating } from '@/components/recipes/recipe-rating';
import { RecipeReviews } from '@/components/recipes/recipe-reviews';
import { SimilarRecipes } from '@/components/recipes/similar-recipes';
import { useToast } from '@/components/ui/use-toast';

interface RecipeDetailViewProps {
  recipe: RecipeDetail;
}

export function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Función para asegurar que la URL de la imagen sea válida
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    
    // Si ya es una URL completa, usarla
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Si es una ruta relativa, convertirla a una URL completa de Spoonacular
    return `https://spoonacular.com/recipeImages/${imageUrl}`;
  };
  
  const handleFavoriteClick = async () => {
    setIsLoading(true);
    try {
      await toggleFavorite(recipe);
      toast({
        title: isFavorite(recipe.id) ? 'Eliminado de favoritos' : 'Añadido a favoritos',
        description: isFavorite(recipe.id) 
          ? 'La receta ha sido eliminada de tus favoritos'
          : 'La receta ha sido añadida a tus favoritos',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error al actualizar favoritos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Mira esta receta de ${recipe.title} en CacheOfRecipes`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Enlace copiado',
        description: 'El enlace de la receta ha sido copiado al portapapeles',
      });
    }
  };

  // Analizar HTML del resumen para mostrar sin etiquetas HTML
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Encabezado y acciones */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">{recipe.title}</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="rounded-full"
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Compartir</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className={cn(
                "rounded-full",
                isFavorite(recipe.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite(recipe.id) ? "fill-current" : "fill-none")} />
              <span className="sr-only">Favorito</span>
            </Button>
          </div>
        </div>
        
        {/* Imagen */}
        <div className="relative aspect-video overflow-hidden rounded-lg">
          {recipe.image ? (
            <Image
              src={getImageUrl(recipe.image) || '/placeholder-recipe.jpg'}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}
        </div>
        
        {/* Meta información */}
        <div className="flex flex-wrap gap-4 md:gap-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{recipe.readyInMinutes} minutos</span>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{recipe.servings} porciones</span>
          </div>
          <RecipeRating recipeId={recipe.id} />
        </div>
        
        {/* Etiquetas */}
        <div className="flex flex-wrap gap-2">
          {recipe.vegetarian && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">Vegetariano</span>
          )}
          {recipe.vegan && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">Vegano</span>
          )}
          {recipe.glutenFree && (
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">Sin Gluten</span>
          )}
          {recipe.dairyFree && (
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">Sin Lácteos</span>
          )}
          {recipe.cheap && (
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">Económico</span>
          )}
          {recipe.veryHealthy && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">Muy Saludable</span>
          )}
        </div>
        
        {/* Resumen */}
        {recipe.summary && (
          <p className="text-muted-foreground">{stripHtml(recipe.summary)}</p>
        )}
        
        <Separator />
      </div>
      
      {/* Contenido detallado en pestañas */}
      <Tabs defaultValue="ingredients" className="mt-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
          <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de ingredientes */}
        <TabsContent value="ingredients" className="space-y-4 mt-4">
          <h2 className="text-xl font-medium">Ingredientes para {recipe.servings} porciones</h2>
          <ul className="space-y-2">
            {recipe.extendedIngredients?.map((ingredient, index) => (
              <li key={index} className="flex items-center py-2 border-b">
                <div className="flex-1">
                  <p className="font-medium">{ingredient.name}</p>
                  <p className="text-sm text-muted-foreground">{ingredient.original}</p>
                </div>
                <div className="text-right">
                  <p>{ingredient.amount} {ingredient.unit}</p>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>
        
        {/* Pestaña de instrucciones */}
        <TabsContent value="instructions" className="space-y-4 mt-4">
          <h2 className="text-xl font-medium">Instrucciones</h2>
          
          {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
            <div className="space-y-6">
              {recipe.analyzedInstructions.map((instructionGroup, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  {instructionGroup.name && (
                    <h3 className="text-lg font-medium">{instructionGroup.name}</h3>
                  )}
                  <ol className="space-y-4">
                    {instructionGroup.steps.map((step) => (
                      <li key={step.number} className="flex">
                        <span className="font-bold mr-2">{step.number}.</span>
                        <span>{step.step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ) : recipe.instructions ? (
            <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
          ) : (
            <p className="text-muted-foreground">
              No hay instrucciones disponibles para esta receta. Puedes consultar la fuente original 
              para más detalles.
            </p>
          )}
          
          {recipe.sourceUrl && (
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver receta original
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Pestaña de nutrición */}
        <TabsContent value="nutrition" className="space-y-4 mt-4">
          <h2 className="text-xl font-medium">Información Nutricional</h2>
          
          {recipe.nutrition ? (
            <div className="space-y-6">
              {/* Calorías y macronutrientes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recipe.nutrition.nutrients
                  .filter(nutrient => ['Calories', 'Protein', 'Fat', 'Carbohydrates'].includes(nutrient.name))
                  .map((nutrient) => (
                    <div key={nutrient.name} className="bg-muted p-4 rounded-lg text-center">
                      <div className="font-medium">{nutrient.name}</div>
                      <div className="text-2xl font-bold">{Math.round(nutrient.amount)}</div>
                      <div className="text-sm">{nutrient.unit}</div>
                    </div>
                  ))}
              </div>
              
              {/* Desglose calórico */}
              {recipe.nutrition.caloricBreakdown && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Desglose Calórico</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-100 p-3 rounded-lg text-center">
                      <div className="text-sm">Proteínas</div>
                      <div className="font-bold">{Math.round(recipe.nutrition.caloricBreakdown.percentProtein)}%</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg text-center">
                      <div className="text-sm">Grasas</div>
                      <div className="font-bold">{Math.round(recipe.nutrition.caloricBreakdown.percentFat)}%</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <div className="text-sm">Carbohidratos</div>
                      <div className="font-bold">{Math.round(recipe.nutrition.caloricBreakdown.percentCarbs)}%</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tabla de nutrientes */}
              <div>
                <h3 className="text-lg font-medium mb-2">Nutrientes Detallados</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Nutriente</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">Cantidad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">% VD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recipe.nutrition.nutrients
                        .filter(nutrient => nutrient.amount > 0)
                        .sort((a, b) => b.percentOfDailyNeeds - a.percentOfDailyNeeds)
                        .map((nutrient) => (
                          <tr key={nutrient.name}>
                            <td className="px-4 py-2 whitespace-nowrap">{nutrient.name}</td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">
                              {Math.round(nutrient.amount * 10) / 10} {nutrient.unit}
                            </td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">
                              {Math.round(nutrient.percentOfDailyNeeds)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No hay información nutricional disponible para esta receta.
            </p>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Reseñas */}
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Reseñas</h2>
        <RecipeReviews recipeId={recipe.id} />
      </div>
      
      {/* Recetas similares */}
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Recetas Similares</h2>
        <SimilarRecipes recipeId={recipe.id} />
      </div>
    </div>
  );
}