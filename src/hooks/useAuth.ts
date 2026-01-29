'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
// bcrypt se usa en el servidor a través de API route

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage
    const storedUser = localStorage.getItem('lancha_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('lancha_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Buscar usuario por email
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        return { user: null, error: 'Error al verificar credenciales' };
      }

      if (!users) {
        console.log('Usuario no encontrado para email:', email);
        return { user: null, error: 'Email o contraseña incorrectos' };
      }

      console.log('Usuario encontrado:', { 
        email: users.email, 
        hasPasswordHash: !!users.password_hash,
        passwordHashLength: users.password_hash?.length,
        passwordLength: password.length 
      });

      // Verificar contraseña
      if (users.password_hash) {
        // Verificar si es un hash bcrypt (empieza con $2a$, $2b$, $2y$)
        const isBcryptHash = /^\$2[ayb]\$/.test(users.password_hash);
        
        console.log('Verificando contraseña:', {
          hasPasswordHash: !!users.password_hash,
          isBcryptHash: isBcryptHash,
          hashStart: users.password_hash?.substring(0, 10),
          passwordLength: password.length
        });
        
        if (isBcryptHash) {
          // Usar API route para comparar bcrypt (más confiable en Next.js)
          try {
            console.log('Verificando contraseña con bcrypt via API...');
            
            const response = await fetch('/api/auth/verify-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                password: password, 
                hash: users.password_hash 
              }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Error en API route:', errorData);
              return { user: null, error: 'Error al verificar la contraseña' };
            }
            
            const { match } = await response.json();
            
            console.log('Resultado de comparación bcrypt:', {
              passwordMatch: match,
              hashPreview: users.password_hash.substring(0, 20) + '...',
              passwordProvided: password ? 'Sí' : 'No'
            });
            
            if (!match) {
              console.log('❌ Contraseña NO coincide (bcrypt)');
              return { user: null, error: 'Email o contraseña incorrectos' };
            }
            
            console.log('✅ Contraseña CORRECTA (bcrypt)');
          } catch (bcryptError) {
            console.error('Error al comparar con bcrypt:', bcryptError);
            return { user: null, error: 'Error al verificar la contraseña' };
          }
        } else {
          // Si no es bcrypt, comparar directamente (para desarrollo/MVP)
          const storedPassword = String(users.password_hash).trim();
          const inputPassword = String(password).trim();
          
          console.log('Comparando contraseña directamente:', {
            stored: storedPassword,
            input: inputPassword,
            match: storedPassword === inputPassword
          });
          
          if (storedPassword !== inputPassword) {
            console.log('❌ Contraseña no coincide (directa)');
            return { user: null, error: 'Email o contraseña incorrectos' };
          }
          
          console.log('✅ Contraseña correcta (directa)');
        }
      } else {
        // Si no hay password_hash en la BD, permitir login con cualquier contraseña (solo para desarrollo)
        console.warn('⚠️ Usuario sin password_hash, permitiendo login (solo desarrollo)');
      }

      // Usuario autenticado correctamente
      const userData: User = {
        id: users.id,
        name: users.name,
        email: users.email,
        password_hash: users.password_hash || '',
        created_at: users.created_at || new Date().toISOString(),
      };

      console.log('Usuario autenticado correctamente:', userData);
      setUser(userData);
      localStorage.setItem('lancha_user', JSON.stringify(userData));

      return { user: userData, error: null };
    } catch (error) {
      console.error('Error during login:', error);
      return { user: null, error: 'Error al iniciar sesión' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('lancha_user');
  };

  return {
    user,
    loading,
    login,
    logout,
  };
}
