# 💍 Invitación de Boda — Misael & Tiatira

Aplicación web de invitación digital personalizada para la boda de Misael y Tiatira. Cada invitado recibe un enlace único con su nombre, mensaje personalizado de los novios y un formulario de confirmación de asistencia (RSVP). Al confirmar, se genera un código QR que sirve como pase de entrada el día del evento.

## Autor

**Job Adolfo Salinas Hernández**

---

## Características

- Pantalla de bienvenida (splash screen) con música de fondo
- Vista pública de la boda (sin sección de asistencia)
- Vista personalizada por invitado cargada desde Firestore vía UUID en la URL
- Contador regresivo en tiempo real hacia la fecha de la boda
- Sección de historia de amor, galería de fotos y código de vestimenta
- Itinerario del evento y mapa de ubicación embebido
- Formulario RSVP con mensaje del invitado y confirmación en dos pasos
- Generación de código QR con el UUID del invitado al confirmar asistencia
- Botones para agregar el evento a Google Calendar y Apple Calendar (ICS)
- Mesa de regalos con información bancaria y botón de copiado
- Diseño responsivo con soporte para móvil y escritorio

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework de UI |
| React Router DOM | 7 | Enrutamiento por UUID |
| Firebase Firestore | 12 | Base de datos en tiempo real |
| Firebase Analytics | 12 | Analítica de visitas |
| qrcode.react | 4 | Generación del código QR |
| react-hot-toast | 2 | Notificaciones |
| Create React App | 5 | Configuración del proyecto |

## Estructura del proyecto

```
src/
├── App.js              # Rutas principales + componentes AudioPlayer y WeddingPage
├── InvitacionPage.js   # Página personalizada por UUID con RSVP
├── NotFoundPage.js     # Página 404
├── config.js           # Constantes centralizadas de la boda
├── firebase.js         # Inicialización de Firebase
└── index.js            # Punto de entrada
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
REACT_APP_FIREBASE_API_KEY=<api_key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<auth_domain>
REACT_APP_FIREBASE_PROJECT_ID=<project_id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<storage_bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<messaging_sender_id>
REACT_APP_FIREBASE_APP_ID=<app_id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<measurement_id>
```

## Scripts disponibles

```bash
# Inicia el servidor de desarrollo
npm start

# Genera el build de producción
npm run build

# Ejecuta las pruebas
npm test
```

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Vista pública de la boda (sin RSVP) |
| `/:uuid/invitacion` | Invitación personalizada del invitado |
| `*` | Página 404 |

## Despliegue

El proyecto está configurado para desplegarse en **Firebase Hosting**. Para publicar:

```bash
npm run build
firebase deploy
```
