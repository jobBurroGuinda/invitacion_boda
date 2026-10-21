/**
 * @fileoverview Configuración centralizada de textos, fechas y datos de la boda.
 * Todas las constantes exportadas son consumidas por los componentes de la aplicación.
 * @author Job Adolfo Salinas Hernández
 */

/** Ruta al archivo de música de fondo. Debe colocarse en `public/assets/audio/`. @type {string} */
export const MUSIC_FILE = "/assets/audio/background.mp3";

/** Timestamp (ms) del límite para confirmar asistencia. @type {number} */
export const RSVP_DEADLINE = new Date('2027-01-01T00:00:00-06:00').getTime();

/** Nombre de la novia. @type {string} */
export const BRIDE_NAME = "Tiatira";
/** Nombre del novio. @type {string} */
export const GROOM_NAME = "Misael";
/** Fecha de la boda en formato legible. @type {string} */
export const WEDDING_DATE_DISPLAY = "15 de enero del 2027";
/** Frase principal del hero de la invitación. @type {string} */
export const WEDDING_TAGLINE = "Hay historias que comienzan por casualidad... La nuestra decidió quedarse para siempre";

/**
 * Timestamp (ms) de la fecha y hora exacta de la boda.
 * Usado por el contador regresivo. GMT-6 (Horario Central de México).
 * @type {number}
 */
export const WEDDING_DATE = new Date('2027-01-15T20:00:00-06:00').getTime();

/** Zona horaria del evento. @type {string} */
export const TIMEZONE = "Horario Central de Chihuahua";

/** Título de la sección de historia de amor. @type {string} */
export const LOVE_STORY_TITLE = "Nuestra Historia de Amor";
/** Párrafo 1 de la historia de amor. @type {string} */
export const LOVE_STORY_PARAGRAPH_1 = "Todo comenzó con una conversación, sin imaginar que esas palabras se convertirían en llamadas interminables, viajes, abrazos y sueños compartidos.";
/** Párrafo 2 de la historia de amor. @type {string} */
export const LOVE_STORY_PARAGRAPH_2 = "Con el tiempo entendí que el amor no consiste en encontrar a la persona perfecta sino en encontrar a alguien con quien todo tiene sentido, y desde que llegaste a mi vida descubrí que un hogar no es un lugar… es la persona con la que quieres despertar todos los días.";
/** Párrafo 3 de la historia de amor. @type {string} */
export const LOVE_STORY_PARAGRAPH_3 = "Muchos dicen que la distancia pone a prueba el amor, nosotros descubrimos que también puede enseñarte el verdadero valor de cada encuentro, de cada abrazo después de la espera y de cada momento compartido, cada kilómetro recorrido nos acercó un poco más al día que tanto soñamos.";
/** Párrafo 4 de la historia de amor. @type {string} */
export const LOVE_STORY_PARAGRAPH_4 = "Hoy al mirar todo el camino que hemos recorrido, solo puedo agradecer a DIOS por habernos permitido llegar hasta aquí. Gracias por elegirme, por creer en nosotros y por caminar a mi lado incluso en los momentos difíciles.";
/** Párrafo 5 de la historia de amor. @type {string} */
export const LOVE_STORY_PARAGRAPH_5 = "Hoy quiero prometerte, seguir eligiéndote una y otra vez, cuidar de nosotros, celebrar tus alegrías, sostener tu mano en los días complicados, y construir, contigo, el hogar y la vida que hemos soñado.";
/** Párrafo 6 (cierre) de la historia de amor. @type {string} */
export const LOVE_STORY_PARAGRAPH_6 = "Te amo. Para siempre.";

/** Título de la sección de propuesta. @type {string} */
export const PROPOSAL_TITLE = "";
/** Primer texto de la sección de propuesta. @type {string} */
export const PROPOSAL_TEXT_1 = "Hay momentos en la vida que son especiales por sí solos, pero compartirlos con las personas que más queremos los hace inolvidables.";
/** Segundo texto de la sección de propuesta. @type {string} */
export const PROPOSAL_TEXT_2 = "Queremos que seas parte del día en que unimos nuestras vidas y comenzamos esta nueva historia juntos.";

/** Título de la sección de información de la boda. @type {string} */
export const WEDDING_INFO_TITLE = "Información de la Boda";
/** Descripción introductoria de la sección de información. @type {string} */
export const WEDDING_INFO_DESCRIPTION = "A continuación encontrarás todos los detalles sobre la ceremonia, recepción y fiesta.";

/** Título de la tarjeta de itinerario. @type {string} */
export const SCHEDULE_TITLE = "Itinerario";
/**
 * Lista de eventos del itinerario de la boda.
 * @type {Array<{time: string, event: string}>}
 */
export const SCHEDULE = [
  { time: "8:00 PM", event: "Recepción de invitados" },
  { time: "8:30 PM", event: "Ceremonia civil" },
  { time: "9:30 PM", event: "Cena" },
  { time: "10:00 PM", event: "Brindis" },
  { time: "10:30 PM", event: "Baile" },
  { time: "11:00 PM", event: "Fiesta" },
];

/** Título de la tarjeta de código de vestimenta. @type {string} */
export const DRESSCODE_TITLE = "Código de Vestimenta";
/** Estilo de vestimenta requerido. @type {string} */
export const DRESSCODE_STYLE = "Formal";
/** Descripción del código de vestimenta. @type {string} */
export const DRESSCODE_DESCRIPTION = "Queremos que todos luzcan increíbles esta noche tan especial.";
/** Sugerencia de paleta de colores para el código de vestimenta. @type {string} */
export const DRESSCODE_PALETTE = "Se sugiere seguir una paleta de colores en tonos neutros o cálidos.";

/**
 * Datos de la ceremonia y recepción.
 * @type {{title: string, date: string, time: string, venue: string, address: string, mapText: string, buttonText: string, timezone: string}}
 */
export const CEREMONY = {
  title: "La Ceremonia",
  date: "15 de enero, 2027",
  time: "8:00 PM",
  venue: "Salón de Eventos Las Fuentes",
  address: "Chihuahua, Chihuahua",
  mapText: "Ver en el mapa",
  buttonText: "Más información",
  timezone: TIMEZONE
};

/** Título del CTA de confirmación de asistencia. @type {string} */
export const GIFT_TITLE = "Confirma tu asistencia";
/** Descripción del CTA de confirmación (sin uso activo). @type {string} */
export const GIFT_DESCRIPTION = "";
/** Texto del botón del CTA de confirmación. @type {string} */
export const GIFT_BUTTON = "Reserva tu lugar";

/** Título de la sección de asistencia. @type {string} */
export const ATTENDANCE_TITLE = "¿Asistirás?";
/** Placeholder del campo de nombre en el formulario de asistencia. @type {string} */
export const ATTENDANCE_NAME_PLACEHOLDER = "Nombre";
/** Placeholder del campo de mensaje en el formulario de asistencia. @type {string} */
export const ATTENDANCE_MESSAGE_PLACEHOLDER = "Tu mensaje";
/** Texto del botón de confirmación de asistencia. @type {string} */
export const ATTENDANCE_BUTTON = "Confirmar ahora";

/** Título de la sección de mesa de regalos. @type {string} */
export const REGISTRY_TITLE = "Mesa de Regalos";
/** Número máximo de invitados permitidos. @type {number} */
export const MAX_GUESTS = 20;

/** Descripción de la sección de mesa de regalos. @type {string} */
export const REGISTRY_DESCRIPTION = "Su presencia es nuestro mejor regalo. Si desean tener un detalle adicional para ayudarnos a comenzar nuestra nueva vida, pueden hacerlo el día del evento mediante lluvia de sobres o transferencia a la siguiente cuenta.";

/**
 * Información bancaria para la mesa de regalos.
 * Cada entrada tiene una etiqueta y su valor correspondiente.
 * @type {Array<{label: string, value: string}>}
 */
export const REGISTRY_BANK_INFO = [
  { label: "Banco", value: "BBVA" },
  { label: "Titular", value: "Tiatira Encinas Mercado" },
  { label: "Número de tarjeta", value: "4152314223321566" },
  { label: "CLABE Interbancaria", value: "012040015794353048" },
  { label: "Concepto", value: "Regalo de boda" },
];


