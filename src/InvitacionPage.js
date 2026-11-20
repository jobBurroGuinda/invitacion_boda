/**
 * @fileoverview Página de invitación personalizada migrada al nuevo template.
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CALENDAR_DATES = '20270115T020000Z/20270116T060000Z';
const CALENDAR_LOCATION = 'Av. George Washington 1859, Campestre Washington, Campestre-Lomas, 31217 Chihuahua, Chih.';
const CALENDAR_TITLE = 'Boda de Misael & Tiatira';

function CalendarButtons() {
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CALENDAR_TITLE)}&dates=${CALENDAR_DATES}&details=${encodeURIComponent('¡Estoy confirmado para la boda de Misael & Tiatira!\nUbicación: https://maps.app.goo.gl/ekDe9whtuHt8YnbW6')}&location=${encodeURIComponent(CALENDAR_LOCATION)}&sf=true&output=xml`;
  const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:20270115T020000Z\nDTEND:20270116T060000Z\nSUMMARY:${CALENDAR_TITLE}\nDESCRIPTION:¡Estoy confirmado para la boda de Misael & Tiatira!\nLOCATION:${CALENDAR_LOCATION}\nEND:VEVENT\nEND:VCALENDAR`;
  const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
      <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="btn-calendar">
        📅 Agregar a Google Calendar
      </a>
      <a href={icsUrl} download="boda-misael-tiatira.ics" className="btn-calendar">
        🍎 Agregar a Apple Calendar
      </a>
    </div>
  );
}

function AsistentesTag({ asistentes }) {
  if (!asistentes) return null;
  return (
    <p className="asistentes-tag">
      👥 Tu invitación es para <strong>{asistentes} {asistentes === 1 ? 'persona' : 'personas'}</strong>
    </p>
  );
}

function ConfirmadoView({ uuid, asistentes }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div className="qr-container">
        <div className="qr-box">
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

function RSVPForm({ invitacion, docId, onConfirmado }) {
  const sanitize = (val) => val.replace(/[<>"'`\\;{}()[\]]/g, '');
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

  return (
    <>
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-confirm-box">
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💍</div>
            <h3>Confirmar asistencia</h3>
            <p>
              Estás a punto de confirmar tu asistencia el <strong>15 de enero del 2027</strong> en <strong>Chihuahua</strong>. ¿Deseas continuar?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-rsvp" onClick={handleConfirmar} disabled={guardando}>
                {guardando ? 'Confirmando...' : 'Sí, confirmar'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  background: 'transparent', border: '1px solid #ccc',
                  color: '#666', padding: '12px 24px', borderRadius: '50px',
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <AsistentesTag asistentes={invitacion.asistentes} />
      <textarea
        className={mensajeError ? 'input--error' : ''}
        placeholder="Escribe un mensaje para los novios..."
        value={mensaje}
        onChange={e => { setMensaje(sanitize(e.target.value)); if (mensajeError) setMensajeError(false); }}
        rows={8}
        style={{ marginBottom: '20px' }}
      />
      <div style={{ textAlign: 'center' }}>
        <button className="btn-rsvp" type="button" onClick={handleConfirmarClick} disabled={guardando}>
          {guardando ? 'Confirmando...' : 'Confirmar asistencia'}
        </button>
      </div>
    </>
  );
}

function AsistenciaSection({ invitacion, docId }) {
  const [confirmado, setConfirmado] = useState(invitacion.is_confirmado === true);
  const { uuid, name, asistentes } = invitacion;
  const deadlinePasado = Date.now() >= RSVP_DEADLINE;

  const titulo = confirmado
    ? `🎉 ¡Te esperamos, ${name}!`
    : deadlinePasado
    ? 'Plazo de confirmación cerrado'
    : `¿Nos acompañarás, ${name}?`;

  const renderContent = () => {
    if (confirmado) return <ConfirmadoView uuid={uuid} asistentes={asistentes} />;
    if (deadlinePasado) return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💌</div>
        <p style={{ lineHeight: 1.8, color: '#636363' }}>
          Hola, <strong>{name}</strong>. El plazo para confirmar asistencia ha cerrado.
          Si deseas asistir, comunícate directamente con Misael o Tiatira.
        </p>
      </div>
    );
    return <RSVPForm invitacion={invitacion} docId={docId} onConfirmado={() => setConfirmado(true)} />;
  };

  return (
    <section id="asistencia" className="section-padding">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-7 col-md-10">
            <div className="text-center mb-4">
              <h2 className="section-title">{titulo}</h2>
              <p className="section-subtitle">CONFIRMACIÓN DE ASISTENCIA</p>
            </div>
            <div className="rsvp-form-wrapper">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPage({ emoji, title, message }) {
  return (
    <div className="status-page">
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>{emoji}</div>
      <h2>{title}</h2>
      <p>{message}</p>
      <a href="/">Ir al inicio</a>
    </div>
  );
}

export default function InvitacionPage() {
  const { uuid } = useParams();
  const [estado, setEstado] = useState('cargando');
  const [invitacion, setInvitacion] = useState(null);
  const [docId, setDocId] = useState(null);

  useEffect(() => {
    if (!uuid) { setEstado('vacia'); return; }
    if (!UUID_REGEX.test(uuid)) { setEstado('invalida'); return; }

    const buscar = async () => {
      try {
        const q = query(collection(db, 'invitaciones'), where('uuid', '==', uuid));
        const snap = await getDocs(q);
        if (snap.empty) { setEstado('no-encontrada'); return; }
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

  if (estado === 'cargando') return <StatusPage emoji="⏳" title="Cargando tu invitación..." message="Un momento, por favor." />;
  if (estado === 'vacia') return <StatusPage emoji="💌" title="No hay invitación que mostrar" message="Si tienes un enlace personalizado, asegúrate de usarlo completo." />;
  if (estado === 'invalida') return <StatusPage emoji="🔗" title="Enlace no válido" message="El enlace no tiene el formato correcto. Verifica que lo hayas copiado completo." />;
  if (estado === 'no-encontrada') return <StatusPage emoji="🔍" title="Invitación no encontrada" message="No encontramos una invitación con ese enlace." />;
  if (estado === 'error') return <StatusPage emoji="⚠️" title="Ocurrió un error" message="No pudimos cargar tu invitación. Por favor intenta de nuevo más tarde." />;

  return (
    <WeddingPage
      invitacion={invitacion}
      docId={docId}
      asistenciaSlot={<AsistenciaSection invitacion={invitacion} docId={docId} />}
    />
  );
}
