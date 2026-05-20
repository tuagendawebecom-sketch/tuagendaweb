# Deploy TuAgendaWeb

Este proyecto es la landing comercial + base mínima multi-negocio de TuAgendaWeb.

Proyecto correcto:

```txt
C:\proyectos\tuagendaweb-landing
```

No usar como root:

```txt
C:\proyectos\turnero-mvp
```

## Comandos locales

```bash
npm install
npm run lint
npm run build
npm run dev -- --port 3001
```

## Rutas a probar

- `/`
- `/agenda/victorias-estetica`
- `/agenda/victorias-estetica/reservar`
- `/login`
- `/panel`
- `/superadmin`
- `/demos/barberia`
- `/demos/estetica`

## Variables

Copiar `.env.example` a `.env.local` para desarrollo.

En Vercel, cargar variables desde `.env.example` con valores reales del Firebase nuevo.

## Checklist landing

- Hero visible.
- Planes visibles:
  - Agenda Simple desde $10.000 / mes.
  - Agenda Pro desde $20.000 / mes.
  - Web Completa $100.000 pago único.
- WhatsApp por plan correcto.
- Responsive mobile correcto.
- No aparecen textos viejos contradictorios.
- FAQ actualizada.
- Demos visibles.

## Checklist agenda pública

- Abrir `/agenda/victorias-estetica`.
- Ver nombre, rubro, servicios y botón de reserva.
- Abrir `/agenda/victorias-estetica/reservar`.
- Confirmar que negocio suspendido bloquearía nuevas reservas.
- La reserva real queda pendiente de migrar desde `turnero-mvp`.

## Checklist Super Admin

MVP preparado visualmente:

- Crear negocio.
- Crear/editar slug.
- Cambiar plan.
- Activar/suspender/cancelar negocio.
- Copiar link público.
- Asignar owner.
- Ver leads.

Pendiente: conectar operaciones reales server-side con Firebase Admin.

## Checklist seguridad

- No aceptar `negocioId` arbitrario desde cliente.
- Resolver negocio por slug server-side.
- Owner no puede elegir otro negocio.
- Usuario no activo no entra.
- Negocio suspendido no permite reservar.
- APIs públicas de consulta/cancelación deben migrarse desde `turnero-mvp`.

## Pagos

`NEXT_PUBLIC_ENABLE_PAYMENTS=false`

No hay Mercado Pago activo todavía. Queda como fase futura.
