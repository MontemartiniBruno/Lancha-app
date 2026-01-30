// src/app/test-upload/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `test-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;
      
      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);
      
      setUrl(data.publicUrl);
      alert('✅ Upload exitoso!');
      
    } catch (err: any) {
      setError(err.message);
      alert('❌ Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Upload Storage</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Seleccionar imagen:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />
        </div>
        
        {file && (
          <div className="text-sm text-gray-600">
            Archivo: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {uploading ? 'Subiendo...' : 'Subir Imagen'}
        </button>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
            Error: {error}
          </div>
        )}
        
        {url && (
          <div className="bg-green-100 border border-green-400 p-3 rounded">
            <p className="font-semibold mb-2">✅ URL generada:</p>
            <a href={url} target="_blank" className="text-blue-600 underline break-all">
              {url}
            </a>
            <div className="mt-4">
              <img src={url} alt="Preview" className="max-w-md border rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}