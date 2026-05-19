# Vercel + Cloudflare setup para TuAgendaWeb

Dominio objetivo:

- `tuagendaweb.com.ar`
- `www.tuagendaweb.com.ar`

Correo operativo:

- `tuagendaweb.ecom@gmail.com`

## 1. Crear cuenta nueva de Vercel

1. Crear o usar cuenta Vercel con `tuagendaweb.ecom@gmail.com`.
2. Importar el repo/proyecto `tuagendaweb-landing`.
3. Verificar que el root del proyecto sea esta carpeta, no `turnero-mvp`.
4. Build command: `npm run build`.
5. Output: Next.js detectado automáticamente.

## 2. Variables de entorno en Vercel

Cargar en Production y Preview:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

NEXT_PUBLIC_SITE_URL=https://tuagendaweb.com.ar
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_BRAND_EMAIL=tuagendaweb.ecom@gmail.com

NEXT_PUBLIC_ENABLE_PAYMENTS=false

NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GTM_ID=
```

No cargar variables de QRtech ni Firebase anterior.

## 3. Dominio en Vercel

Agregar ambos dominios:

- `tuagendaweb.com.ar`
- `www.tuagendaweb.com.ar`

Elegir uno como principal. Recomendación: apex `tuagendaweb.com.ar` como canonical y `www` redireccionando.

## 4. Cloudflare nuevo

1. Crear cuenta Cloudflare con `tuagendaweb.ecom@gmail.com`.
2. Agregar sitio `tuagendaweb.com.ar`.
3. Cambiar nameservers en el registrador del dominio hacia los que indique Cloudflare.
4. Esperar propagación.

## 5. DNS

Seguir exactamente lo que indique Vercel al agregar dominio.

Patrón típico:

```txt
A      @    76.76.21.21
CNAME  www  cname.vercel-dns.com
```

Si Cloudflare está activo:

- Para empezar, usar proxy DNS only si hay problemas de verificación.
- Evitar registros duplicados `A`, `AAAA` o `CNAME`.
- No apuntar a QRtech ni a deploys anteriores.

## 6. Verificación

Probar:

- `https://tuagendaweb.com.ar`
- `https://www.tuagendaweb.com.ar`
- `https://tuagendaweb.com.ar/agenda/victorias-estetica`
- `https://tuagendaweb.com.ar/login`

Revisar en Vercel:

- dominio validado;
- certificado SSL emitido;
- variables cargadas;
- build verde.

## 7. Si sigue apuntando a una demo vieja

1. Revisar DNS en Cloudflare.
2. Eliminar registros que apunten a servidores antiguos.
3. Confirmar que el dominio esté agregado en el proyecto Vercel correcto.
4. Esperar TTL/propagación.
5. Probar desde incógnito o con `https://dnschecker.org`.
