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
  orderBy
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
          const loadedReviews = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              recipeId: data.recipeId,
              rating: data.rating,
              comment: data.comment,
              createdAt: data.createdAt.toDate(),
              userName: data.userName,
              userPhotoURL: data.userPhotoURL,
            } as Review;
          });
          
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
      setError('Debes iniciar sesión para añadir reseñas');
      throw new Error('Debes iniciar sesión para añadir reseñas');
    }

    if (!recipeId) {
      setError('ID de receta no válido');
      throw new Error('ID de receta no válido');
    }

    try {
      if (userReview) {
        // Actualizar reseña existente
        await updateDoc(doc(db, 'reviews', userReview.id), {
          rating,
          comment,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Añadir nueva reseña
        await addDoc(collection(db, 'reviews'), {
          userId: user.uid,
          recipeId,
          rating,
          comment,
          createdAt: serverTimestamp(),
          userName: user.displayName || 'Usuario',
          userPhotoURL: user.photoURL,
        });
      }
    } catch (err) {
      console.error('Error adding/updating review:', err);
      setError('Error al guardar la reseña');
      throw new Error('Error al guardar la reseña');
    }
  };

  // Eliminar reseña
  const deleteReview = async (): Promise<void> => {
    if (!user) {
      setError('Debes iniciar sesión para eliminar reseñas');
      throw new Error('Debes iniciar sesión para eliminar reseñas');
    }

    if (!userReview) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'reviews', userReview.id));
      setUserReview(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Error al eliminar la reseña');
      throw new Error('Error al eliminar la reseña');
    }
  };

  // Calcular puntuación promedio
  const getAverageRating = (): number => {
    if (reviews.length === 0) {
      return 0;
    }
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  return {
    reviews,
    userReview,
    loading,
    error,
    addOrUpdateReview,
    deleteReview,
    getAverageRating,
  };
};