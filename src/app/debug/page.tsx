// src/app/debug/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [info, setInfo] = useState<any>({});
  
  useEffect(() => {
    async function test() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      setInfo({
        url,
        hasKey: !!key,
        keyPreview: key?.substring(0, 20) + '...',
        data,
        error,
        count: data?.length || 0,
      });
    }
    test();
  }, []);
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Supabase</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg space-y-2 font-mono text-sm">
        <div>
          <strong>URL:</strong> {info.url || '❌ NO CONFIGURADA'}
        </div>
        <div>
          <strong>Anon Key:</strong> {info.hasKey ? '✅ Presente' : '❌ NO CONFIGURADA'}
        </div>
        <div>
          <strong>Key preview:</strong> {info.keyPreview}
        </div>
        <div>
          <strong>Usuarios encontrados:</strong> {info.count}
        </div>
        <div>
          <strong>Error:</strong> {info.error ? JSON.stringify(info.error) : '✅ Sin errores'}
        </div>
        <div>
          <strong>Data:</strong>
          <pre className="bg-white p-2 rounded mt-2 overflow-auto max-h-96">
            {JSON.stringify(info.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}