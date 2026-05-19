# TuAgendaWeb - reglas para futuras sesiones

## Proyecto correcto

- Trabajar dentro de `C:\proyectos\tuagendaweb-landing`.
- Este proyecto despliega la web comercial y plataforma mínima de TuAgendaWeb.
- Dominio objetivo: `tuagendaweb.com.ar`.
- No confundir con `C:\proyectos\turnero-mvp`.

## Proyecto de referencia

- `turnero-mvp` se usa solo como fuente técnica de referencia/migración.
- No modificar destructivamente `turnero-mvp`.
- No romper la demo actual de `qrtech.com.ar`.
- Migrar con cuidado la lógica crítica: reserva, cancelación, `horariosOcupados`, normalización de teléfono y transacciones Firestore.

## Posicionamiento comercial

- TuAgendaWeb no se vende como SaaS genérico.
- TuAgendaWeb no se vende como solo una página web.
- Vender como solución para ordenar turnos, mejorar imagen y facilitar reservas desde celular.
- Planes:
  - Agenda Simple: desde $15.000 ARS / mes.
  - Agenda Pro: desde $30.000 ARS / mes.
  - Web Completa: $100.000 ARS pago único.

## Infraestructura

- Usar cuentas nuevas con `tuagendaweb.ecom@gmail.com`.
- No usar Firebase, Vercel, Cloudflare ni dominios anteriores.
- No hardcodear credenciales.
- No depender de `DEFAULT_BUSINESS_ID` para agendas públicas.
- Resolver agendas públicas por `slug` server-side.

## Arquitectura

- Mantener `negocioId` como identificador principal.
- Colección principal: `negocios/{negocioId}`.
- Rutas públicas: `/agenda/[slug]` y `/agenda/[slug]/reservar`.
- Panel cliente: `/panel`.
- Super Admin: `/superadmin`.
- Super Admin opera negocios, planes y estados manuales.
- Dueño/staff/viewer solo acceden al negocio asociado en `businessUsers/{uid}`.

## Seguridad

- No exponer Firebase Admin SDK al cliente.
- APIs públicas no deben aceptar `negocioId` arbitrario desde el cliente.
- Consulta/cancelación pública debe resolver negocio por slug server-side.
- Negocios `suspended` o `cancelled` no deben permitir nuevas reservas.
- No borrar datos por falta de pago.

## UI

- Mantener estética actual: crema, verde profundo, dorado, tarjetas redondeadas, mockups, tono profesional y cercano.
- No cambiar innecesariamente la paleta ni rehacer toda la landing.
- No prometer funciones no implementadas; usar “próximamente” o “a cotizar”.

## Validación

- Ejecutar `npm run lint`.
- Ejecutar `npm run build`.
- Probar `/`, `/agenda/victorias-estetica`, `/agenda/victorias-estetica/reservar`, `/login`, `/panel`, `/superadmin`.
