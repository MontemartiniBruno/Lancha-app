'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  const { error, success } = useToastContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya está logueado, redirigir al home
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      console.log('Intentando login con:', { email, passwordLength: password.length });
      const result = await login(email, password);
      
      console.log('Resultado del login:', result);

      if (result.error) {
        console.error('Error en login:', result.error);
        error(result.error);
        setLoading(false);
        return;
      }

      if (result.user) {
        console.log('Login exitoso, usuario:', result.user);
        success('Inicio de sesión exitoso');
        // Pequeño delay para que se vea el mensaje de éxito
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        console.error('Login falló: no hay usuario en el resultado');
        error('Credenciales inválidas');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      error('Error al iniciar sesión. Verifica tu conexión a Supabase.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-primary-500 mb-2">🚤 Lancha App</h1>
              <p className="text-gray-600">Inicia sesión para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />

              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="mt-6"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
