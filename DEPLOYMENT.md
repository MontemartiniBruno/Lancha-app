# 🚀 Guía de Deployment - Lancha App

Esta guía te ayudará a desplegar la aplicación Lancha App en producción.

## Opción Recomendada: Vercel

Vercel es la plataforma más sencilla para desplegar aplicaciones Next.js.

### Paso 1: Preparar el Código

1. Asegúrate de que tu código esté en un repositorio de GitHub
2. Verifica que no haya errores en el código:
   ```bash
   npm run build
   ```

### Paso 2: Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Autoriza a Vercel a acceder a tus repositorios

### Paso 3: Importar Proyecto

1. En el dashboard de Vercel, click en "Add New Project"
2. Selecciona tu repositorio `lancha-app`
3. Vercel detectará automáticamente:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Paso 4: Configurar Variables de Entorno

**IMPORTANTE**: Antes de hacer el deploy, configura las variables de entorno:

1. En la pantalla de configuración del proyecto, ve a "Environment Variables"
2. Agrega las siguientes variables:

   | Variable | Valor | Descripción |
   |----------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | URL de tu proyecto Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Clave pública anónima de Supabase |

3. **Asegúrate de seleccionar**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click en "Save"

### Paso 5: Deploy

1. Click en "Deploy"
2. Vercel comenzará a construir tu aplicación
3. Espera a que termine el proceso (2-3 minutos)
4. Una vez completado, obtendrás una URL como: `https://lancha-app.vercel.app`

### Paso 6: Verificar Deployment

1. Abre la URL de tu aplicación
2. Verifica que la aplicación cargue correctamente
3. Prueba el login
4. Verifica que todas las funcionalidades funcionen

## Obtener Credenciales de Supabase

Si no tienes las credenciales de Supabase:

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Configurar Base de Datos en Supabase

1. En Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de `supabase-schema.sql`
4. Ejecuta la query
5. Verifica que las tablas se hayan creado correctamente

## Actualizaciones Futuras

Cada vez que hagas `git push` a la rama principal:
- Vercel detectará automáticamente los cambios
- Construirá una nueva versión
- La desplegará automáticamente

Para ver el estado de los deployments:
- Ve a tu proyecto en Vercel
- Verás el historial de deployments en la pestaña "Deployments"

## Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. En Vercel, ve a tu proyecto → Settings → Domains
2. Agrega tu dominio
3. Sigue las instrucciones para configurar los DNS

## Monitoreo y Logs

- **Logs en tiempo real**: Ve a tu proyecto en Vercel → Deployments → Click en un deployment → Logs
- **Analytics**: Vercel ofrece analytics básicos en el plan gratuito
- **Errores**: Los errores aparecen en los logs de Vercel

## Troubleshooting

### Build Falla

1. Revisa los logs en Vercel
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que `npm run build` funcione localmente

### Variables de Entorno No Funcionan

1. Verifica que las variables estén configuradas en Vercel
2. Asegúrate de que tengan el prefijo `NEXT_PUBLIC_` si se usan en el cliente
3. Reinicia el deployment después de agregar variables

### Error de CORS

1. En Supabase, ve a Settings → API
2. Agrega tu dominio de Vercel a "Allowed Origins"
3. Ejemplo: `https://lancha-app.vercel.app`

### La App No Carga

1. Verifica que el build se haya completado
2. Revisa los logs de runtime
3. Verifica que las variables de entorno estén correctas

## Alternativas de Deployment

### Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Conecta tu repositorio de GitHub
3. Configura:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Agrega las variables de entorno
5. Deploy

### Railway

1. Ve a [railway.app](https://railway.app)
2. Crea un nuevo proyecto desde GitHub
3. Configura las variables de entorno
4. Railway detectará automáticamente Next.js

### Render

1. Ve a [render.com](https://render.com)
2. Crea un nuevo Web Service
3. Conecta tu repositorio
4. Configura las variables de entorno
5. Deploy

## Checklist Pre-Deployment

- [ ] Código subido a GitHub
- [ ] `npm run build` funciona localmente
- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos configurada en Supabase
- [ ] Tablas creadas correctamente
- [ ] Usuarios iniciales insertados
- [ ] CORS configurado en Supabase (si es necesario)
- [ ] Pruebas locales completadas

## Soporte

Si tienes problemas con el deployment:
1. Revisa los logs en Vercel
2. Verifica la documentación de [Next.js Deployment](https://nextjs.org/docs/deployment)
3. Consulta la [documentación de Vercel](https://vercel.com/docs)
