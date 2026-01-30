# Configuración de Supabase Storage para Comprobantes

## Paso 1: Crear el bucket "receipts"

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"New bucket"**
4. Configura:
   - **Name**: `receipts`
   - **Public bucket**: ✅ **Marcar como público** (para que las imágenes sean accesibles)
   - Haz clic en **"Create bucket"**

## Paso 2: Configurar políticas RLS (Row Level Security)

1. En el bucket `receipts`, ve a la pestaña **"Policies"**
2. Haz clic en **"New Policy"**
3. Configura una política para permitir lectura pública:

   **Policy Name**: `Public read access`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
     ```sql
     true
     ```
   - Haz clic en **"Save"**

4. Crea otra política para permitir subida de archivos:

   **Policy Name**: `Public upload access`
   - **Allowed operation**: `INSERT`
   - **Policy definition**:
     ```sql
     true
     ```
   - Haz clic en **"Save"**

## Paso 3: Verificar configuración

Después de configurar el bucket y las políticas, deberías poder:
- ✅ Subir imágenes desde los formularios de Transferencia y Gasto
- ✅ Ver las imágenes en el historial de movimientos
- ✅ Ver las imágenes en el dashboard (últimos movimientos)

## Nota sobre el endpoint /debug

El endpoint `/debug` está configurado como ruta pública en `AppContent.tsx`, por lo que debería ser accesible sin autenticación. Si sigue apareciendo protegido después del deploy, puede ser un problema de caché de Vercel. Intenta:

1. Hacer un hard refresh (Ctrl+Shift+R o Cmd+Shift+R)
2. Limpiar la caché del navegador
3. Verificar que el código en Vercel esté actualizado (revisar los logs del deploy)
