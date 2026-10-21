/**
 * @fileoverview Página de invitación personalizada. Carga los datos del invitado
 * desde Firestore usando el UUID de la URL y renderiza la boda con la sección de RSVP.
 * @author Job Adolfo Salinas Hernández
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { RSVP_DEADLINE } from './config';
import { WeddingPage } from './App';

/** Expresión regular para validar el formato de un UUID v4. @type {RegExp} */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rango de fechas del evento en formato UTC para Google/Apple Calendar. @type {string} */
const CALENDAR_DATES = '20270115T020000Z/20270116T060000Z';
/** Dirección del evento para los archivos de calendario. @type {string} */
const CALENDAR_LOCATION = 'Av. George Washington 1859, Campestre Washington, Campestre-Lomas, 31217 Chihuahua, Chih.';
/** Título del evento para los archivos de calendario. @type {string} */
const CALENDAR_TITLE = 'Boda de Misael & Tiatira';

/**
 * Botones para agregar el evento de la boda a Google Calendar o Apple Calendar (ICS).
 *
 * @component
 * @returns {JSX.Element}
 */
function CalendarButtons() {
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CALENDAR_TITLE)}&dates=${CALENDAR_DATES}&details=${encodeURIComponent('¡Estoy confirmado para la boda de Misael & Tiatira!\nUbicación: https://maps.app.goo.gl/ekDe9whtuHt8YnbW6')}&location=${encodeURIComponent(CALENDAR_LOCATION)}&sf=true&output=xml`;
  const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:20270115T020000Z\nDTEND:20270116T060000Z\nSUMMARY:${CALENDAR_TITLE}\nDESCRIPTION:¡Estoy confirmado para la boda de Misael & Tiatira!\nLOCATION:${CALENDAR_LOCATION}\nEND:VEVENT\nEND:VCALENDAR`;
  const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch', marginTop: '20px' }}>
      <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="btn card-btn1">
        📅 Agregar a Google Calendar
      </a>
      <a href={icsUrl} download="boda-misael-tiatira.ics" className="btn card-btn1">
        🍎 Agregar a Apple Calendar
      </a>
    </div>
  );
}

/**
 * Muestra la cantidad de personas incluidas en la invitación.
 *
 * @component
 * @param {Object} props
 * @param {number|null} props.asistentes - Número de asistentes de la invitación.
 * @returns {JSX.Element|null}
 */
function AsistentesTag({ asistentes }) {
  if (!asistentes) return null;
  return (
    <p style={{ textAlign: 'center', color: '#8b6914', fontSize: '0.9rem', marginBottom: '20px' }}>
      👥 Tu invitación es para <strong>{asistentes} {asistentes === 1 ? 'persona' : 'personas'}</strong>
    </p>
  );
}

/**
 * Vista que se muestra cuando el invitado ya confirmó su asistencia.
 * Muestra un código QR con el UUID y los botones de calendario.
 *
 * @component
 * @param {Object} props
 * @param {string} props.name - Nombre del invitado.
 * @param {string} props.uuid - UUID único de la invitación (valor del QR).
 * @param {number} props.asistentes - Número de asistentes.
 * @returns {JSX.Element}
 */
function ConfirmadoView({ name, uuid, asistentes }) {
  return (
    <div style={{ textAlign: 'center', padding: '30px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '24px', display: 'none' }}>🎉</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{
          padding: '16px', background: '#fff',
          border: '1px solid #c9a96e', borderRadius: '12px',
          boxShadow: '0 4px 18px rgba(139,105,20,0.1)'
        }}>
          <QRCodeSVG value={uuid} size={180} />
        </div>
      </div>
      <AsistentesTag asistentes={asistentes} />
      <p style={{ fontSize: '0.82rem', color: '#9b8b6e', marginBottom: '4px' }}>
        Presenta este código el día del evento
      </p>
      <CalendarButtons />
    </div>
  );
}

/**
 * Formulario de confirmación de asistencia (RSVP).
 * Permite al invitado escribir un mensaje y confirmar su asistencia.
 * Actualiza el documento en Firestore al confirmar.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.invitacion - Datos completos de la invitación.
 * @param {string} props.docId - ID del documento en Firestore.
 * @param {Function} props.onConfirmado - Callback ejecutado tras confirmar exitosamente.
 * @returns {JSX.Element}
 */
function RSVPForm({ invitacion, docId, onConfirmado }) {
  const sanitize = (val) => val.replace(/[<>"'`\\;{}()\[\]]/g, '');
  const [mensaje, setMensaje] = useState(sanitize(invitacion.mensaje_de_invitado || ''));
  const [mensajeError, setMensajeError] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmarClick = () => {
    if (!mensaje.trim()) {
      setMensajeError(true);
      toast.error('Por favor escribe un mensaje para los novios.');
      return;
    }
    setMensajeError(false);
    setShowConfirm(true);
  };

  const handleConfirmar = useCallback(async () => {
    setShowConfirm(false);
    setGuardando(true);
    try {
      await updateDoc(doc(db, 'invitaciones', docId), {
        is_confirmado: true,
        mensaje_de_invitado: sanitize(mensaje.trim()),
        fecha_confirmacion: new Date(),
      });
      toast.success('¡Asistencia confirmada! Nos vemos en la boda. 🎉');
      onConfirmado();
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error, por favor intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }, [docId, mensaje, onConfirmado]);

  const { asistentes } = invitacion;

  return (
    <>
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99998,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '32px 28px', maxWidth: '400px', width: '100%',
            textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💍</div>
            <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '12px', fontSize: '1.1rem' }}>
              Confirmar asistencia
            </h3>
            <p style={{ color: '#636363', lineHeight: 1.7, marginBottom: '24px', fontSize: '0.95rem' }}>
              Estás a punto de confirmar tu asistencia el <strong>15 de enero del 2027</strong> en <strong>Chihuahua</strong>. ¿Deseas continuar?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn card-btn1"
                onClick={handleConfirmar}
                disabled={guardando}
              >
                {guardando ? 'Confirmando...' : 'Sí, confirmar'}
              </button>
              <button
                className="btn"
                onClick={() => setShowConfirm(false)}
                style={{ background: 'transparent', border: '1px solid #ccc', color: '#666' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-12">
          <AsistentesTag asistentes={asistentes} />
          <div className={`form-box message-icon mb-30${mensajeError ? ' input--error' : ''}`}>
            <textarea
              placeholder="Escribe un mensaje para los novios..."
              value={mensaje}
              onChange={e => { setMensaje(sanitize(e.target.value)); if (mensajeError) setMensajeError(false); }}
              rows={9}
              style={mensajeError ? { borderColor: '#e53e3e', height: '300px' } : { height: '300px' }}
            />
          </div>
          <div className="submit-info" style={{ textAlign: 'center' }}>
            <button className="btn" type="button" onClick={handleConfirmarClick} disabled={guardando}>
              {guardando ? 'Confirmando...' : 'Confirmar asistencia'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Sección de asistencia que decide qué vista mostrar según el estado del invitado:
 * formulario RSVP, vista de confirmado, o mensaje de plazo cerrado.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.invitacion - Datos del invitado.
 * @param {string} props.docId - ID del documento en Firestore.
 * @returns {JSX.Element}
 */
function AsistenciaSection({ invitacion, docId }) {
  const [confirmado, setConfirmado] = useState(invitacion.is_confirmado === true);
  const { uuid, name, asistentes } = invitacion;
  const deadlinePasado = Date.now() >= RSVP_DEADLINE;

  const renderContent = () => {
    if (confirmado) {
      return <ConfirmadoView name={name} uuid={uuid} asistentes={asistentes} />;
    }
    if (deadlinePasado) {
      return (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💌</div>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#636363' }}>
            Hola, <strong>{name}</strong>. El plazo para confirmar asistencia ha cerrado.
            Si deseas asistir, te invitamos a comunicarte directamente con Misael o Tiatira,
            quienes con mucho gusto podrán ayudarte. ¡Esperamos verte en ese día tan especial!
          </p>
        </div>
      );
    }
    return (
      <RSVPForm
        invitacion={invitacion}
        docId={docId}
        onConfirmado={() => setConfirmado(true)}
      />
    );
  };

  const titulo = confirmado
    ? `🎉 ¡Te esperamos, ${name}!`
    : deadlinePasado
    ? 'Plazo de confirmación cerrado'
    : `¿Nos acompañarás, ${name}?`;

  return (
    <div id="contact-form" className="contact-form section-padding30 fix">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-6">
            <div className="form-wrapper" style={{ minHeight: '870px' }}>
              <div className="row">
                <div className="col-lg-12">
                  <div className="section-tittle tittle-form text-center mb-30">
                    <h2>{titulo}</h2>
                    <img src="/assets/img/gallery/tittle_img2.png" alt="" />
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                {renderContent()}
              </div>
              <div className="shape-inner-flower" style={{ pointerEvents: 'none' }}>
                <img src="/assets/img/gallery/shape2.png" className="shpe2" alt="" />
              </div>
              <div className="shape-outer-flower">
                <img src="/assets/img/flower/from-top.png" className="outer-top" alt="" />
                <img src="/assets/img/flower/from-bottom.png" className="outer-bottom" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Página de estado genérica para mostrar mensajes de carga, error o invitación no encontrada.
 *
 * @component
 * @param {Object} props
 * @param {string} props.emoji - Emoji representativo del estado.
 * @param {string} props.title - Título del mensaje.
 * @param {string} props.message - Descripción del estado.
 * @returns {JSX.Element}
 */
function StatusPage({ emoji, title, message }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#fdf8f0', fontFamily: "'Cinzel', serif",
      textAlign: 'center', padding: '24px'
    }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>{emoji}</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#5c4a32', marginBottom: '12px' }}>{title}</h2>
      <p style={{ color: '#8b7355', fontFamily: 'sans-serif', maxWidth: '380px', lineHeight: 1.7 }}>{message}</p>
      <a href="/" style={{
        marginTop: '32px', padding: '12px 32px',
        border: '1px solid #c9a96e', color: '#8b6914',
        textDecoration: 'none', letterSpacing: '2px',
        fontSize: '0.85rem', textTransform: 'uppercase',
        fontFamily: "'Cinzel', serif"
      }}>
        Ir al inicio
      </a>
    </div>
  );
}

/**
 * Página de invitación personalizada. Lee el UUID de la URL, busca la invitación
 * en Firestore y renderiza la página de boda con la sección de RSVP correspondiente.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function InvitacionPage() {
  const { uuid } = useParams();
  const [estado, setEstado] = useState('cargando'); // cargando | invalida | no-encontrada | encontrada
  const [invitacion, setInvitacion] = useState(null);
  const [docId, setDocId] = useState(null);

  useEffect(() => {
    if (!uuid) {
      setEstado('vacia');
      return;
    }
    if (!UUID_REGEX.test(uuid)) {
      setEstado('invalida');
      return;
    }

    const buscar = async () => {
      try {
        const q = query(collection(db, 'invitaciones'), where('uuid', '==', uuid));
        const snap = await getDocs(q);
        if (snap.empty) {
          setEstado('no-encontrada');
          return;
        }
        const docSnap = snap.docs[0];
        setInvitacion(docSnap.data());
        setDocId(docSnap.id);
        setEstado('encontrada');
      } catch (err) {
        console.error(err);
        setEstado('error');
      }
    };

    buscar();
  }, [uuid]);

  useEffect(() => {
    if (estado === 'encontrada' && invitacion?.name) {
      document.title = `Boda M&T. Invitación de ${invitacion.name}`;
    }
  }, [estado, invitacion]);

  if (estado === 'cargando') {
    return (
      <StatusPage
        emoji="⏳"
        title="Cargando tu invitación..."
        message="Un momento, por favor."
      />
    );
  }

  if (estado === 'vacia') {
    return (
      <StatusPage
        emoji="💌"
        title="No hay invitación que mostrar"
        message="Parece que no se especificaron los datos de la invitación. Si tienes un enlace personalizado, asegúrate de usarlo completo."
      />
    );
  }

  if (estado === 'invalida') {
    return (
      <StatusPage
        emoji="🔗"
        title="Enlace no válido"
        message="El enlace que ingresaste no tiene el formato correcto. Verifica que hayas copiado el enlace completo tal como te fue enviado."
      />
    );
  }

  if (estado === 'no-encontrada') {
    return (
      <StatusPage
        emoji="🔍"
        title="Invitación no encontrada"
        message="No encontramos una invitación con ese enlace. Es posible que haya sido eliminada o que el enlace sea incorrecto."
      />
    );
  }

  if (estado === 'error') {
    return (
      <StatusPage
        emoji="⚠️"
        title="Ocurrió un error"
        message="No pudimos cargar tu invitación. Por favor intenta de nuevo más tarde."
      />
    );
  }

  return (
    <WeddingPage
      invitacion={invitacion}
      docId={docId}
      asistenciaSlot={<AsistenciaSection invitacion={invitacion} docId={docId} />}
    />
  );
}
