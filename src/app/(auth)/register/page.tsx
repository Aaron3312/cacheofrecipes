// src/app/(auth)/register/page.tsx
import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registrarse - CacheOfRecipes',
  description: 'Crea una nueva cuenta en CacheOfRecipes',
};

export default function RegisterPage() {
  return <RegisterForm />;
}