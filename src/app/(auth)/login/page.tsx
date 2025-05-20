// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - CacheOfRecipes',
  description: 'Inicia sesión en tu cuenta de CacheOfRecipes',
};

export default function LoginPage() {
  return <LoginForm />;
}

