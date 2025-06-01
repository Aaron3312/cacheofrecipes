// src/hooks/use-reviews.ts
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  serverTimestamp,
  onSnapshot,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Review } from '@/types/review';

export const useReviews = (recipeId?: number) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Función helper para convertir timestamp de Firestore a Date
  const convertTimestamp = (timestamp: any): Date => {
    if (!timestamp) {
      return new Date(); // Fecha actual como fallback
    }
    
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // Si es un string o número, intentar crear Date
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    
    // Fallback a fecha actual
    return new Date();
  };

  // Cargar reseñas para una receta específica
  useEffect(() => {
    if (!recipeId) {
      setReviews([]);
      setUserReview(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef, 
      where('recipeId', '==', recipeId),
      orderBy('createdAt', 'desc')
    );

    // Usar onSnapshot para actualizaciones en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const loadedReviews = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            
            // Validar que los campos requeridos existan
            if (!data.userId || !data.recipeId || typeof data.rating !== 'number') {
              console.warn('Documento de review incompleto:', docSnapshot.id, data);
              return null;
            }
            
            return {
              id: docSnapshot.id,
              userId: data.userId,
              recipeId: data.recipeId,
              rating: data.rating,
              comment: data.comment || '',
              createdAt: convertTimestamp(data.createdAt),
              userName: data.userName || 'Usuario Anónimo',
              userPhotoURL: data.userPhotoURL || null,
            } as Review;
          }).filter(Boolean) as Review[]; // Filtrar valores null
          
          setReviews(loadedReviews);
          
          // Encontrar la reseña del usuario actual si existe
          if (user) {
            const foundUserReview = loadedReviews.find(
              (review) => review.userId === user.uid
            );
            setUserReview(foundUserReview || null);
          } else {
            setUserReview(null);
          }
          
          setLoading(false);
          setError(null); // Limpiar errores previos
          
        } catch (err) {
          console.error('Error loading reviews:', err);
          setError('Error al cargar reseñas');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Reviews snapshot error:', err);
        setError('Error al escuchar cambios en reseñas');
        setLoading(false);
      }
    );

    // Limpiar la suscripción
    return () => unsubscribe();
  }, [recipeId, user]);

  // Añadir o actualizar reseña
  const addOrUpdateReview = async (rating: number, comment: string): Promise<void> => {
    if (!user) {
      const errorMsg = 'Debes iniciar sesión para añadir reseñas';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!recipeId) {
      const errorMsg = 'ID de receta no válido';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    // Validar rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      const errorMsg = 'La calificación debe ser un número entre 1 y 5';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setError(null); // Limpiar errores previos

    try {
      // Obtener el nombre de usuario más actual
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.displayName || 'Usuario';

      if (userReview) {
        // Actualizar reseña existente
        await updateDoc(doc(db, 'reviews', userReview.id), {
          rating,
          comment: comment.trim(),
          updatedAt: serverTimestamp(),
          userName, // Actualizar nombre por si cambió
          userPhotoURL: user.photoURL,
        });
      } else {
        // Añadir nueva reseña
        await addDoc(collection(db, 'reviews'), {
          userId: user.uid,
          recipeId,
          rating,
          comment: comment.trim(),
          createdAt: serverTimestamp(),
          userName,
          userPhotoURL: user.photoURL,
        });
      }
    } catch (err) {
      console.error('Error adding/updating review:', err);
      const errorMsg = 'Error al guardar la reseña';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Eliminar reseña
  const deleteReview = async (): Promise<void> => {
    if (!user) {
      const errorMsg = 'Debes iniciar sesión para eliminar reseñas';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!userReview) {
      console.warn('No hay reseña del usuario para eliminar');
      return;
    }

    setError(null); // Limpiar errores previos

    try {
      await deleteDoc(doc(db, 'reviews', userReview.id));
      setUserReview(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      const errorMsg = 'Error al eliminar la reseña';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Calcular puntuación promedio
  const getAverageRating = (): number => {
    if (reviews.length === 0) {
      return 0;
    }
    
    const validRatings = reviews.filter(review => 
      typeof review.rating === 'number' && !isNaN(review.rating)
    );
    
    if (validRatings.length === 0) {
      return 0;
    }
    
    const sum = validRatings.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / validRatings.length) * 10) / 10; // Redondear a 1 decimal
  };

  // Obtener conteo de reseñas por rating
  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    
    return distribution;
  };

  // Limpiar errores manualmente
  const clearError = () => {
    setError(null);
  };

  return {
    reviews,
    userReview,
    loading,
    error,
    addOrUpdateReview,
    deleteReview,
    getAverageRating,
    getRatingDistribution,
    clearError,
    totalReviews: reviews.length,
  };
};