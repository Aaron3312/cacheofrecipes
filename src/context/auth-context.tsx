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
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthContextType, AuthState } from '@/types/auth';
import { processGoogleImageUrl } from '@/lib/image-utils';

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
  loginWithGoogle: async () => {},
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
    // Procesar la URL de la imagen de Google
    const processedPhotoURL = processGoogleImageUrl(user.photoURL);
    
    const userData = {
      uid: user.uid,
      email: user.email!,
      firstName: null,
      lastName: null,
      displayName: user.displayName,
      photoURL: processedPhotoURL,
      bio: null,
      createdAt: new Date(),
    };

    // Verificar si el usuario existe en Firestore y obtener datos adicionales
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userDocData = userDoc.data();
      // Convertir Timestamp a Date si es necesario
      const createdAt = userDocData.createdAt ? 
        new Date(userDocData.createdAt.toDate()) : new Date();
      
      // Procesar la URL de la imagen almacenada en Firestore también
      const storedPhotoURL = processGoogleImageUrl(userDocData.photoURL);
      
      return {
        ...userData,
        firstName: userDocData.firstName || null,
        lastName: userDocData.lastName || null,
        bio: userDocData.bio || null,
        photoURL: storedPhotoURL || processedPhotoURL,
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

  // Función para iniciar sesión con Google
  const loginWithGoogle = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const userCredential = await signInWithPopup(auth, provider);
      
      // Procesar la URL de la imagen de Google
      const processedPhotoURL = processGoogleImageUrl(userCredential.user.photoURL);
      
      // Verificar si es un usuario nuevo y crear perfil en Firestore si es necesario
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        // Extraer nombre y apellido del displayName si es posible
        const displayName = userCredential.user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          firstName,
          lastName,
          displayName: userCredential.user.displayName,
          photoURL: processedPhotoURL,
          bio: null,
          createdAt: serverTimestamp(),
        });
      } else {
        // Actualizar la foto de perfil si es necesario
        const userData = userDoc.data();
        if (userData.photoURL !== processedPhotoURL) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            photoURL: processedPhotoURL,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      }
      
      const formattedUser = await formatUser(userCredential.user);
      
      setAuthState({
        user: formattedUser,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      
      let errorMessage = 'Error al iniciar sesión con Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Inicio de sesión cancelado';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado. Por favor, permite popups para este sitio.';
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
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crear displayName combinando nombre y apellido
      const displayName = `${firstName} ${lastName}`.trim();
      
      // Actualizar el perfil con el nombre
      await firebaseUpdateProfile(userCredential.user, {
        displayName,
      });
      
      // Guardar en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        firstName,
        lastName,
        displayName,
        photoURL: null,
        bio: null,
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
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
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
      // Actualizar displayName si se cambiaron firstName o lastName
      let displayName = data.displayName;
      if (data.firstName !== undefined || data.lastName !== undefined) {
        const firstName = data.firstName !== undefined ? data.firstName : authState.user.firstName;
        const lastName = data.lastName !== undefined ? data.lastName : authState.user.lastName;
        displayName = `${firstName || ''} ${lastName || ''}`.trim();
      }

      // Procesar la URL de la imagen
      const processedPhotoURL = data.photoURL ? processGoogleImageUrl(data.photoURL) : data.photoURL;

      // Actualizar en Firebase Auth
      if (displayName || processedPhotoURL !== undefined) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: displayName || auth.currentUser.displayName,
          photoURL: processedPhotoURL !== undefined ? processedPhotoURL : auth.currentUser.photoURL,
        });
      }

      // Preparar datos para Firestore
      const updateData = { ...data };
      if (displayName) {
        updateData.displayName = displayName;
      }
      if (processedPhotoURL !== undefined) {
        updateData.photoURL = processedPhotoURL;
      }

      // Actualizar en Firestore
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...updateData,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Actualizar el estado
      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updateData } : null,
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
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};