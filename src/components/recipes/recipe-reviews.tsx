// src/components/recipes/recipe-reviews.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link'; // Añadimos la importación de Link
import { useAuth } from '@/context/auth-context';
import { useReviews } from '@/hooks/use-reviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';


interface RecipeReviewsProps {
  recipeId: number;
}

export function RecipeReviews({ recipeId }: RecipeReviewsProps) {
  const { user } = useAuth();
  const { reviews, userReview, addOrUpdateReview, deleteReview, loading } = useReviews(recipeId);
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 5);
  const [comment, setComment] = useState(userReview?.comment || '');
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
  };
  
  const handleRatingHover = (newRating: number) => {
    setHoverRating(newRating);
  };
  
  const handleRatingLeave = () => {
    setHoverRating(0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Inicia sesión para enviar una reseña',
        description: 'Debes iniciar sesión para poder valorar recetas',
        variant: 'destructive',
      });
      return;
    }
    
    if (rating < 1) {
      toast({
        title: 'Valoración requerida',
        description: 'Por favor, selecciona al menos 1 estrella',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addOrUpdateReview(rating, comment);
      toast({
        title: userReview ? 'Reseña actualizada' : 'Reseña enviada',
        description: userReview 
          ? 'Tu reseña ha sido actualizada correctamente' 
          : 'Tu reseña ha sido publicada correctamente',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error al enviar tu reseña',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      await deleteReview();
      toast({
        title: 'Reseña eliminada',
        description: 'Tu reseña ha sido eliminada correctamente',
      });
      // Resetear el formulario
      setRating(5);
      setComment('');
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error al eliminar tu reseña',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    }
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    } else {
      setRating(5);
      setComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario para agregar/editar reseña */}
      {(user && (isEditing || !userReview)) && (
        <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Tu valoración</label>
            <div 
              className="flex"
              onMouseLeave={handleRatingLeave}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted stroke-muted-foreground fill-none"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="comment" className="block text-sm font-medium">
              Tu comentario
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu opinión sobre esta receta (opcional)"
              rows={4}
            />
          </div>
          
          <div className="flex justify-between">
            <div>
              {userReview && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" type="button">
                      Eliminar reseña
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar reseña?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar tu reseña?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            <div className="space-x-2">
              {isEditing && (
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? 'Enviando...' 
                  : userReview 
                    ? 'Actualizar reseña' 
                    : 'Enviar reseña'
                }
              </Button>
            </div>
          </div>
        </form>
      )}
      
      {/* Mostrar la reseña del usuario */}
      {user && userReview && !isEditing && (
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
                <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.displayName || 'Usuario'}</p>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= userReview.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted stroke-muted-foreground fill-none"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(userReview.createdAt, 'PP', { locale: es })}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" onClick={handleEdit}>
              Editar
            </Button>
          </div>
          {userReview.comment && (
            <p className="text-muted-foreground">{userReview.comment}</p>
          )}
        </div>
      )}
      
      {/* Mensaje para iniciar sesión */}
      {!user && (
        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-center">
            <Button variant="link" asChild className="p-0">
              <Link href="/login">Inicia sesión</Link>
            </Button>{' '}
            para dejar tu reseña de esta receta.
          </p>
        </div>
      )}
      
      {/* Lista de reseñas */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">
          {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
        </h3>
        
        {loading ? (
          <div className="py-4 text-center">
            <p>Cargando reseñas...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">Aún no hay reseñas para esta receta. ¡Sé el primero en opinar!</p>
          </div>
        ) : (
          reviews
            .filter(review => !user || review.userId !== user.uid)
            .map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={review.userPhotoURL || undefined} alt={review.userName} />
                    <AvatarFallback>{review.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-3 w-3",
                              star <= review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted stroke-muted-foreground fill-none"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(review.createdAt, 'PP', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}