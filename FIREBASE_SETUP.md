# Firebase setup para TuAgendaWeb

Correo operativo recomendado: `tuagendaweb.ecom@gmail.com`.

## 1. Crear proyecto nuevo

1. Entrar a Firebase Console con `tuagendaweb.ecom@gmail.com`.
2. Crear un proyecto nuevo, por ejemplo `tuagendaweb-prod`.
3. No reutilizar el proyecto Firebase anterior de QRtech ni del turnero viejo.

## 2. Activar servicios

Activar:

- Firestore Database.
- Firebase Authentication.
- Email/password.
- Anonymous Auth solo si el flujo público migrado desde `turnero-mvp` lo necesita.

## 3. Firestore

Modelo principal:

```txt
negocios/{negocioId}
negocios/{negocioId}/configuracion/general
negocios/{negocioId}/servicios
negocios/{negocioId}/personal
negocios/{negocioId}/sucursales
negocios/{negocioId}/reservas
negocios/{negocioId}/horariosOcupados
negocios/{negocioId}/gastos
businessUsers/{uid}
leads/{leadId}
```

Subir reglas e índices:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

## 4. Variables client SDK

Crear una Web App en Firebase y copiar sus valores a Vercel:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 5. Firebase Admin SDK

Crear una service account nueva y cargar en Vercel:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

En Vercel, `FIREBASE_ADMIN_PRIVATE_KEY` debe conservar saltos de línea. Si se pega en una línea, usar `\n`.

## 6. Primer superadmin

Camino recomendado para MVP:

1. Cargar estas variables en `.env.local` o en el entorno donde se ejecute el script:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
```

2. Ejecutar:

```bash
npm run admin:ensure-superadmin
```

El script crea o actualiza el usuario en Firebase Auth y crea/actualiza:

```txt
businessUsers/{uid}
```

con:

```json
{
  "role": "superadmin",
  "isActive": true
}
```

Luego ingresar desde `/login`. Si el rol es `superadmin`, el login redirige a `/superadmin`.

Alternativa manual:

1. Crear usuario manualmente en Firebase Auth.
2. Copiar el UID.
3. Crear manualmente el documento `businessUsers/{uid}` con `role: "superadmin"` e `isActive: true`.

## 7. Alta de negocio inicial

Crear documento en `negocios`:

```json
{
  "nombre": "Victoria's Estética",
  "slug": "victorias-estetica",
  "plan": "agenda_simple",
  "estado": "trial",
  "activo": true,
  "billingStatus": "manual_active",
  "ownerNombre": "Victoria",
  "ownerTelefono": "",
  "ownerEmail": "",
  "initials": "VE",
  "colorPrimario": "#123D3A",
  "colorSecundario": "#E7B85A",
  "whatsapp": "",
  "rubro": "Estética",
  "monthlyPrice": 10000
}
```

Crear servicios iniciales en `negocios/{negocioId}/servicios`.

## 8. Pendiente de migración

Migrar desde `turnero-mvp`:

- `BookingFlow`.
- `createBookingReservation`.
- lógica de `horariosOcupados`.
- consulta/cancelación pública por celular.
- `telefonoNormalizado`.
- CRUD real de servicios, personal, sucursales y horarios.

No reescribir esta lógica crítica desde cero sin tests.
