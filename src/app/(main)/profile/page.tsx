// src/app/(main)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User } from '@/types/auth';

// Esquema de validación
const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  photoURL: z.string().url({ message: 'URL de imagen inválida' }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Inicializar formulario con react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || '',
    },
    values: {
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || '',
    },
  });

  // Actualizar valores del formulario cuando cambia el usuario
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });
    }
  }, [user, form]);

  // Manejar envío del formulario
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      await updateProfile({
        displayName: values.displayName,
        photoURL: values.photoURL || null,
      });

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil ha sido actualizado correctamente.',
      });
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al actualizar tu perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-xl">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Administra la información de tu cuenta y preferencias.
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
          <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-medium">{user.displayName || 'Usuario'}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Editar Perfil</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tu nombre"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen de perfil</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://ejemplo.com/tu-imagen.jpg"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </Form>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Cuenta</h3>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Fecha de creación: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Desconocido'}
          </p>
          
          <Button variant="outline" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}