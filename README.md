# 🚤 Lancha App

Aplicación web para gestión de embarcación compartida entre co-propietarios. Desarrollada con Next.js 14, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- **Dashboard**: Visualización de balance común, balances por usuario, próximos turnos y últimos movimientos
- **Pagos**: Registro de transferencias y gastos con historial completo
- **Turnos**: Calendario mensual con asignación automática (60% privados, 40% compartidos) y gestión manual
- **PWA**: Aplicación web progresiva, optimizada para móviles
- **Autenticación**: Sistema de login con validación de credenciales

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita)
- Cuenta de GitHub (para deployment)

## 🛠️ Configuración Local

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd lancha-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```
   
   Puedes obtener estos valores desde tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard):
   - Ve a tu proyecto
   - Settings → API
   - Copia "Project URL" y "anon public" key

4. **Configurar la base de datos**
   
   Ejecuta el script SQL en tu proyecto de Supabase:
   - Ve a SQL Editor en Supabase
   - Copia y ejecuta el contenido de `supabase-schema.sql`

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```
   
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🌐 Deployment en Vercel (Recomendado)

Vercel es la plataforma recomendada para Next.js y ofrece deployment gratuito.

### Opción 1: Deployment desde GitHub (Recomendado)

1. **Subir código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/lancha-app.git
   git push -u origin main
   ```

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
   - Click en "Add New Project"
   - Importa tu repositorio `lancha-app`
   - Vercel detectará automáticamente que es un proyecto Next.js

3. **Configurar Variables de Entorno**
   
   En la configuración del proyecto en Vercel:
   - Ve a Settings → Environment Variables
   - Agrega las siguientes variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu clave anónima de Supabase
   
   ⚠️ **Importante**: Asegúrate de que las variables estén disponibles para:
   - Production
   - Preview
   - Development

4. **Deploy**
   - Click en "Deploy"
   - Vercel construirá y desplegará tu aplicación automáticamente
   - Obtendrás una URL como: `https://lancha-app.vercel.app`

### Opción 2: Deployment con Vercel CLI

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login en Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Sigue las instrucciones y cuando te pregunte por las variables de entorno, ingrésalas.

4. **Deploy a producción**
   ```bash
   vercel --prod
   ```

## 🔧 Configuración Post-Deployment

### 1. Configurar CORS en Supabase (si es necesario)

Si tienes problemas de CORS, en Supabase:
- Ve a Settings → API
- Agrega tu dominio de Vercel a "Allowed Origins"

### 2. Verificar la Base de Datos

Asegúrate de que:
- Las tablas estén creadas correctamente
- Los usuarios iniciales estén insertados
- Las políticas RLS estén configuradas (si las usas)

### 3. Probar la Aplicación

- Accede a la URL de tu deployment
- Prueba el login con las credenciales configuradas
- Verifica que todas las funcionalidades funcionen correctamente

## 📱 PWA (Progressive Web App)

La aplicación está configurada como PWA. Los usuarios pueden:
- Instalarla en sus dispositivos móviles
- Usarla offline (con limitaciones)
- Acceder desde la pantalla de inicio

## 🔐 Credenciales por Defecto

Las credenciales iniciales están definidas en `supabase-schema.sql`. Asegúrate de cambiarlas en producción.

## 📝 Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter

## 🆘 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que las variables de entorno estén configuradas correctamente
- En Vercel, asegúrate de que las variables estén en todos los ambientes

### Error de CORS
- Agrega tu dominio de Vercel a las configuraciones de CORS en Supabase

### La aplicación no se actualiza después del deployment
- Verifica que el build se haya completado correctamente
- Revisa los logs en Vercel para errores

## 📚 Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Supabase** - Backend y base de datos
- **date-fns** - Manejo de fechas
- **PWA** - Aplicación web progresiva

## 📄 Licencia

Este proyecto es privado.
