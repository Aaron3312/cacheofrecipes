// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthContextType, AuthState } from '@/types/auth';

// Valores por defecto del contexto
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// Crear el contexto
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

// Hook personalizado para acceder al contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Convertir usuario de Firebase a nuestro tipo User
  const formatUser = async (user: FirebaseUser): Promise<User> => {
    const userData = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
    };

    // Verificar si el usuario existe en Firestore y obtener datos adicionales
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userDocData = userDoc.data();
      // Convertir Timestamp a Date si es necesario
      const createdAt = userDocData.createdAt ? 
        new Date(userDocData.createdAt.toDate()) : new Date();
      
      return {
        ...userData,
        createdAt,
      };
    }

    return userData;
  };

  // Efecto para manejar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const formattedUser = await formatUser(user);
          setAuthState({
            user: formattedUser,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setAuthState({
          user: null,
          loading: false,
          error: 'Error al cargar el usuario',
        });
      }
    });

    // Limpiar el listener al desmontar
    return () => unsubscribe();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const formattedUser = await formatUser(userCredential.user);
      
      setAuthState({
        user: formattedUser,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Credenciales incorrectas';
      }
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (email: string, password: string, name: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil con el nombre
      await firebaseUpdateProfile(userCredential.user, {
        displayName: name,
      });
      
      // Guardar en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        photoURL: null,
        createdAt: serverTimestamp(),
      });
      
      const formattedUser = await formatUser(userCredential.user);
      
      setAuthState({
        user: formattedUser,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error al registrar:', error);
      
      let errorMessage = 'Error al registrar el usuario';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está en uso';
      }
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setAuthState((prev) => ({
        ...prev,
        error: 'Error al cerrar sesión',
      }));
      throw new Error('Error al cerrar sesión');
    }
  };

  // Función para restablecer la contraseña
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error al restablecer la contraseña:', error);
      let errorMessage = 'Error al restablecer la contraseña';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No se encontró ningún usuario con este correo';
      }
      throw new Error(errorMessage);
    }
  };

  // Función para actualizar el perfil
  const updateProfile = async (data: Partial<User>) => {
    if (!auth.currentUser || !authState.user) {
      throw new Error('No hay usuario autenticado');
    }

    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Actualizar en Firebase Auth
      if (data.displayName || data.photoURL) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: data.displayName || auth.currentUser.displayName,
          photoURL: data.photoURL || auth.currentUser.photoURL,
        });
      }

      // Actualizar en Firestore
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Actualizar el estado
      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'Error al actualizar el perfil',
      }));
      throw new Error('Error al actualizar el perfil');
    }
  };

  // Valor del contexto
  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};