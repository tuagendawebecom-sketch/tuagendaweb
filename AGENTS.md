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
- Planes visibles actuales:
  - Agenda Full: desde $10.000 ARS / mes.
  - Web Completa: $100.000 ARS pago único.
- `agenda_pro` puede existir como compatibilidad interna, pero no se muestra como oferta pública activa.

## Infraestructura

- Usar cuentas nuevas con `tuagendaweb.ecom@gmail.com`.
- No usar Firebase, Vercel, Cloudflare ni dominios anteriores.
- No hardcodear credenciales.
- No depender de `DEFAULT_BUSINESS_ID` para agendas públicas.
- Resolver agendas públicas por `slug` server-side.

## Arquitectura

- Mantener `negocioId` como identificador principal.
- Colección principal: `negocios/{negocioId}`.
- Ruta pública principal: `/{slug}`.
- Rutas legacy compatibles: `/agenda/[slug]` y `/agenda/[slug]/reservar` redirigen a `/{slug}`.
- Agenda Full usa `/{slug}` como pagina de reserva.
- Web Completa usa el mismo sistema y puede resolver por `customDomain`.
- En dominios propios de Web Completa, `/` muestra la web comercial y `/reservas` muestra el flujo de reserva del negocio.
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
- La edicion de secciones publicas de Web Completa solo debe estar visible para negocios con plan `web_completa`.
- Agenda Full puede editar datos publicos, logo/iniciales, colores de reserva, servicios, personal, sucursales y horarios, pero no secciones comerciales de web completa.
- La Web Completa con dominio propio debe sentirse como la web del cliente, no como una copia de la landing principal de TuAgendaWeb.
- En webs completas, TuAgendaWeb es motor/panel interno; la marca visible principal debe ser la del cliente.

## Validación

- Ejecutar `npm run lint`.
- Ejecutar `npm run build`.
- Probar `/`, `/agenda/victorias-estetica`, `/agenda/victorias-estetica/reservar`, `/login`, `/panel`, `/superadmin`.
