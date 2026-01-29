'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err: any) {
        setError(err.message);
      }
    }
    
    fetchUsers();
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Supabase</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Usuarios:</h2>
        <ul>
          {users.map(user => (
            <li key={user.id} className="mb-1">
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}