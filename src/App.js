/**
 * @fileoverview Componente principal migrado al nuevo template.
 * @author Job Adolfo Salinas Hernández
 */
import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import InvitacionPage from './InvitacionPage';
import NotFoundPage from './NotFoundPage';
import './App.css';
import {
  BRIDE_NAME, GROOM_NAME, WEDDING_DATE_DISPLAY, WEDDING_DATE,
  LOVE_STORY_TITLE, LOVE_STORY_PARAGRAPH_1,
  PROPOSAL_TEXT_1, PROPOSAL_TEXT_2,
  CEREMONY, SCHEDULE,
  DRESSCODE_TITLE, DRESSCODE_STYLE, DRESSCODE_DESCRIPTION, DRESSCODE_PALETTE,
  GIFT_TITLE, GIFT_BUTTON,
  REGISTRY_TITLE, REGISTRY_DESCRIPTION, REGISTRY_BANK_INFO,
  MUSIC_FILE, WEDDING_INFO_TITLE,
} from './config';

/* ─── Inicializar AOS una sola vez ─── */
function useAOS() {
  useEffect(() => {
    if (window.AOS) window.AOS.init({ duration: 900, once: true });
  }, []);
}

/* ─── Inicializar Swipers con cleanup ─── */
function useSwipers(ready) {
  useEffect(() => {
    if (!ready || !window.Swiper) return;
    const gallery = new window.Swiper('.swiper-gallery', {
      loop: true,
      slidesPerView: 2,
      spaceBetween: 16,
      autoplay: { delay: 2500, disableOnInteraction: false },
      pagination: { el: '.swiper-gallery .swiper-pagination', clickable: true },
      breakpoints: {
        640: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      },
    });
    const party = new window.Swiper('.swiper-party', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 30,
      pagination: { el: '.swiper-party .swiper-pagination', clickable: true },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 20 },
        768: { slidesPerView: 3, spaceBetween: 40 },
        1024: { slidesPerView: 4, spaceBetween: 50 },
      },
    });
    return () => {
      gallery.destroy(true, true);
      party.destroy(true, true);
    };
  }, [ready]);
}

/* ─── Inicializar Lightbox2 ─── */
function useLightbox() {
  useEffect(() => {
    if (typeof window.lightbox !== 'undefined') {
      window.lightbox.option({ resizeDuration: 200, wrapAround: true, disableScrolling: true });
    }
  }, []);
}

/**
 * Reproductor de audio + splash screen con el nuevo loader animado.
 */
function AudioPlayer({ invitacion }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  // 'visible' | 'hiding' | 'hidden'
  const [splashState, setSplashState] = useState('visible');

  useEffect(() => {
    document.body.classList.add('loading');
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    audio.addEventListener('canplaythrough', () => setAudioReady(true), { once: true });
    audio.load();
    if (audio.readyState >= 3) setAudioReady(true);
    // Cleanup: garantizar que body.loading se elimine si el componente se desmonta
    return () => document.body.classList.remove('loading');
  }, []);

  const handleEnter = () => {
    if (splashState !== 'visible') return;
    setSplashState('hiding');
    document.body.classList.remove('loading');
    const audio = audioRef.current;
    if (audio && audioReady) audio.play().then(() => setPlaying(true)).catch(() => {});
    // Quitar del DOM tras la transición (1.2s curtain + 0.3s margen)
    setTimeout(() => setSplashState('hidden'), 1600);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto" style={{ display: 'none' }}>
        <source src={MUSIC_FILE} type="audio/mpeg" />
      </audio>

      {/* Loader / Splash con animación de cortinas del template2 */}
      {splashState !== 'hidden' && (
        <div
          className={`loader-wrapper${splashState === 'hiding' ? ' loader-hidden' : ''}`}
          onClick={handleEnter}
          style={{ cursor: splashState === 'visible' ? 'pointer' : 'default' }}
        >
          <div className="loader-split-left" />
          <div className="loader-split-right" />
          <div className="loader-content">
            <svg className="drawing-heart" viewBox="0 0 100 100">
              <path d="M50,30 C10,10 10,60 50,90 C90,60 90,10 50,30 Z" />
            </svg>
            <div className="loader-text">
              {invitacion ? invitacion.name : `${GROOM_NAME} & ${BRIDE_NAME}`}
            </div>
            {invitacion?.mensaje_novios && (
              <p className="loader-message">
                {invitacion.mensaje_novios}
              </p>
            )}
            <div className="loader-open-btn">
              {invitacion ? 'Abrir invitación' : 'Abrir'}
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante de música */}
      {splashState === 'hidden' && audioReady && (
        <button
          className="music-btn"
          onClick={toggle}
          title={playing ? 'Pausar música' : 'Reproducir música'}
        >
          <i className={playing ? 'fas fa-pause' : 'fas fa-play'} />
        </button>
      )}
    </>
  );
}

/**
 * Navbar con hamburger animado y comportamiento scroll del template2.
 */
function Navbar({ isPublic }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClass = `navbar navbar-expand-lg mainNav fixed-top${scrolled ? ' scrolled' : ''}${menuOpen ? ' hamburgerclicked' : ''}`;

  const handleNavClick = (e, hash) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={navClass}>
      <div className="container-fluid px-4">
        <a className="navbar-brand" href="/">
          {GROOM_NAME} <span>&</span> {BRIDE_NAME}
        </a>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          <div className={`hamburger-animated${menuOpen ? ' open' : ''}`}>
            <span /><span /><span />
          </div>
        </button>
        <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#inicio" onClick={e => handleNavClick(e, '#inicio')}>Inicio</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#historia" onClick={e => handleNavClick(e, '#historia')}>Historia</a>
            </li>
            {!isPublic && (
              <li className="nav-item">
                <a className="nav-link" href="#eventos" onClick={e => handleNavClick(e, '#eventos')}>Eventos</a>
              </li>
            )}
            <li className="nav-item">
              <a className="nav-link" href="#galeria" onClick={e => handleNavClick(e, '#galeria')}>Galería</a>
            </li>
            {!isPublic && (
              <li className="nav-item">
                <a className="nav-link" href="#asistencia" onClick={e => handleNavClick(e, '#asistencia')}>Asistencia</a>
              </li>
            )}
            <li className="nav-item">
              <a className="nav-link" href="#regalos" onClick={e => handleNavClick(e, '#regalos')}>Regalos</a>
            </li>
            {!isPublic && (
              <li className="nav-item">
                <a className="nav-link" href="#mapa" onClick={e => handleNavClick(e, '#mapa')}>Ubicación</a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

/**
 * Página principal de la boda con el nuevo template.
 */
export function WeddingPage({ invitacion = null, asistenciaSlot = null }) {
  const isPublic = !invitacion;
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copiedKey, setCopiedKey] = useState(null);
  const [swiperReady, setSwiperReady] = useState(false);

  useAOS();
  useSwipers(swiperReady);
  useLightbox();

  /* Countdown */
  useEffect(() => {
    const interval = setInterval(() => {
      const distance = WEDDING_DATE - Date.now();
      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* Marcar swiper listo después del primer render */
  useEffect(() => { setSwiperReady(true); }, []);

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const galleryImages = [
    'foto_galeria_1.jpg', 'foto_galeria_2.jpg',
    'foto_galeria_3.jpg', 'foto_galeria_4.jpg',
    'historia_1.jpg',
  ];

  const carouselImages = [
    'gallery01.png','gallery02.png','gallery03.png','gallery04.png',
    'gallery05.png','gallery06.png','gallery07.png','gallery08.png',
  ];

  return (
    <div style={{ overflowX: 'hidden', maxWidth: '100%' }}>
      <AudioPlayer invitacion={invitacion} />
      <Navbar isPublic={isPublic} />

      {/* ── HERO ── */}
      <section id="inicio" className="hero-section">
        <div className="container">
          <div className="hero-content" data-aos="fade-up">
            <span className="pre-title">Nos casamos</span>
            <h1 className="hero-title">
              {GROOM_NAME} <span>&</span> {BRIDE_NAME}
            </h1>
            <span className="hero-date">{WEDDING_DATE_DISPLAY}</span>

            <div className="countdown-container">
              {[
                { val: countdown.days, label: 'Días' },
                { val: countdown.hours, label: 'Horas' },
                { val: countdown.minutes, label: 'Minutos' },
                { val: countdown.seconds, label: 'Segundos' },
              ].map(({ val, label }) => (
                <div className="countdown-item" key={label}>
                  <div className="countdown-number">{String(val).padStart(2, '0')}</div>
                  <div className="countdown-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-2">
              {!isPublic && (
                <a href="#asistencia" className="hero-btn">Confirmar asistencia</a>
              )}
              <a href="#historia" className="hero-btn-outline">Ver detalles</a>
            </div>
          </div>
        </div>
        <div className="mouse-scroll">
          <div className="mouse"><div className="mouse-wheel" /></div>
          <div className="scroll-text">SCROLL</div>
        </div>
      </section>

      {/* ── HISTORIA ── */}
      <section id="historia" className="section-padding">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0" data-aos="fade-right">
              <img
                src="/assets/img/gallery/historia_1.jpg"
                alt="Misael y Tiatira"
                className="story-img"
              />
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="ps-lg-5">
                <h2 className="section-title">{LOVE_STORY_TITLE}</h2>
                <p className="section-subtitle">CÓMO TODO COMENZÓ</p>
                <p>{LOVE_STORY_PARAGRAPH_1}</p>
                <p>{PROPOSAL_TEXT_1}</p>
                <p>{PROPOSAL_TEXT_2}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAREJA ── */}
      <section className="section-padding bg-light-rose">
        <div className="container text-center">
          <h2 className="section-title" data-aos="fade-up">Los Novios</h2>
          <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">DOS ALMAS, UN DESTINO</p>
          <div className="row justify-content-center">
            <div className="col-lg-5 mb-4 mb-lg-0" data-aos="fade-right" data-aos-delay="200">
              <div className="couple-card">
                <img src="/assets/img/gallery/foto_galeria_1.jpg" alt={GROOM_NAME} className="couple-img" />
                <h3>{GROOM_NAME}</h3>
                <h4>El Novio</h4>
                <p>Apasionado, aventurero y con un corazón enorme. Misael encontró en Tiatira a su compañera de vida y no puede esperar para comenzar este nuevo capítulo juntos.</p>
              </div>
            </div>
            <div className="col-lg-5" data-aos="fade-left" data-aos-delay="200">
              <div className="couple-card">
                <img src="/assets/img/gallery/foto_galeria_2.jpg" alt={BRIDE_NAME} className="couple-img" />
                <h3>{BRIDE_NAME}</h3>
                <h4>La Novia</h4>
                <p>Llena de luz, amor y alegría. Tiatira ve el mundo con ojos llenos de gratitud y está emocionada de unir su vida a la de Misael para siempre.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WEDDING PARTY ── */}
      <section className="section-padding">
        <div className="container text-center">
          <h2 className="section-title" data-aos="fade-up">Nuestra Familia</h2>
          <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">LOS MÁS CERCANOS A NUESTRO CORAZÓN</p>
          <div className="swiper swiper-party" data-aos="fade-up" data-aos-delay="200">
            <div className="swiper-wrapper">
              {[
                { img: 'foto_galeria_1.jpg', name: 'Papá de Misael', role: 'Padre del Novio' },
                { img: 'foto_galeria_2.jpg', name: 'Mamá de Misael', role: 'Madre del Novio' },
                { img: 'foto_galeria_3.jpg', name: 'Papá de Tiatira', role: 'Padre de la Novia' },
                { img: 'foto_galeria_4.jpg', name: 'Mamá de Tiatira', role: 'Madre de la Novia' },
              ].map((member, i) => (
                <div className="swiper-slide" key={i}>
                  <div className="party-member">
                    <img src={`/assets/img/gallery/${member.img}`} alt={member.name} />
                    <h4>{member.name}</h4>
                    <p>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="swiper-pagination mt-4" />
          </div>
        </div>
      </section>

      {/* ── EVENTOS / ITINERARIO (solo invitados) ── */}
      {!isPublic && (
        <section id="eventos" className="section-padding">
          <div className="container">
            <div className="text-center">
              <h2 className="section-title" data-aos="fade-up">{WEDDING_INFO_TITLE}</h2>
              <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">ÚNETE A CELEBRAR</p>
            </div>
            <ul className="timeline mt-5">
              {/* Ceremonia */}
              <li data-aos="fade-right">
                <div className="timeline-image"><i className="fas fa-rings-wedding" /></div>
                <div className="timeline-panel">
                  <div className="timeline-heading">
                    <h4>{CEREMONY.title}</h4>
                    <p className="subheading">{CEREMONY.date} | {CEREMONY.time}</p>
                  </div>
                  <div className="timeline-body">
                    <p>{CEREMONY.venue}</p>
                    <p><i className="fas fa-map-marker-alt me-2" />{CEREMONY.address}</p>
                    <p><i className="far fa-clock me-2" />{CEREMONY.timezone}</p>
                  </div>
                </div>
              </li>
              {/* Itinerario dinámico */}
              {SCHEDULE.map((item, i) => (
                <li key={i} className={i % 2 !== 0 ? 'timeline-inverted' : ''} data-aos={i % 2 !== 0 ? 'fade-left' : 'fade-right'}>
                  <div className="timeline-image"><i className="fas fa-clock" /></div>
                  <div className="timeline-panel">
                    <div className="timeline-heading">
                      <h4>{item.event}</h4>
                      <p className="subheading">{item.time}</p>
                    </div>
                  </div>
                </li>
              ))}
              {/* Código de vestimenta */}
              <li className={SCHEDULE.length % 2 !== 0 ? 'timeline-inverted' : ''} data-aos="fade-right">
                <div className="timeline-image"><i className="fas fa-tshirt" /></div>
                <div className="timeline-panel">
                  <div className="timeline-heading">
                    <h4>{DRESSCODE_TITLE}</h4>
                    <p className="subheading">{DRESSCODE_STYLE}</p>
                  </div>
                  <div className="timeline-body">
                    <p>{DRESSCODE_DESCRIPTION}</p>
                    <p>{DRESSCODE_PALETTE}</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>
      )}

      {/* ── GALERÍA ── */}
      <section id="galeria" className={`section-padding${isPublic ? '' : ' bg-light-rose'}`}>
        <div className="container">
          <div className="text-center">
            <h2 className="section-title" data-aos="fade-up">Galería de Fotos</h2>
            <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">MOMENTOS QUE ATESORAMOS</p>
          </div>
          <div className="row">
            {galleryImages.map((img, i) => (
              <div key={i} className="col-md-4 col-sm-6" data-aos="zoom-in" data-aos-delay={i * 80}>
                <div className="gallery-item">
                  <a href={`/assets/img/gallery/${img}`} data-lightbox="gallery" data-title={`Foto ${i + 1}`}>
                    <img src={`/assets/img/gallery/${img}`} alt={`Foto ${i + 1}`} />
                    <div className="overlay"><i className="fas fa-search-plus" /></div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA RSVP (solo invitados) ── */}
      {!isPublic && (
        <section className="section-padding rsvp-section">
          <div className="overlay-bg" />
          <div className="container text-center rsvp-content">
            <h2 className="section-title" data-aos="fade-up">{GIFT_TITLE}</h2>
            <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
              CONFIRMA ANTES DEL 16 DE DICIEMBRE, 2026
            </p>
            <p className="lead mb-4" data-aos="fade-up" data-aos-delay="200" style={{ color: 'rgba(255,255,255,0.85)' }}>
              ¡Nos encantaría celebrar contigo! Confirma tu asistencia para reservar tu lugar.
            </p>
            <a href="#asistencia" className="btn btn-primary btn-lg" data-aos="fade-up" data-aos-delay="300">
              {GIFT_BUTTON}
            </a>
          </div>
        </section>
      )}

      {/* ── SLOT ASISTENCIA (solo invitados) ── */}
      {!isPublic && asistenciaSlot}

      {/* ── MESA DE REGALOS ── */}
      <section id="regalos" className="section-padding">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title" data-aos="fade-up">{REGISTRY_TITLE}</h2>
            <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">TU PRESENCIA ES NUESTRO MEJOR REGALO</p>
            <p className="mb-5" style={{ maxWidth: '600px', margin: '0 auto 2rem' }} data-aos="fade-up" data-aos-delay="200">
              {REGISTRY_DESCRIPTION}
            </p>
          </div>
          <div className="d-flex justify-content-center" data-aos="fade-up" data-aos-delay="300">
            <div className="registry-card">
              {REGISTRY_BANK_INFO.map((item, i) => (
                <div className="registry-row" key={i}>
                  <span className="registry-label">{item.label}</span>
                  <span className="registry-value">
                    {item.value}
                    {i >= 1 && (
                      <button
                        className={`copy-btn${copiedKey === i ? ' copied' : ''}`}
                        onClick={() => handleCopy(item.value, i)}
                        title="Copiar"
                      >
                        <i className={copiedKey === i ? 'fas fa-check' : 'far fa-copy'} style={{ fontSize: '13px' }} />
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NUESTRO DIARIO (estilo blog/journal del template2) ── */}
      <section className="section-padding bg-light-rose">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title" data-aos="fade-up">Nuestro Diario</h2>
            <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">CON TODO NUESTRO AMOR</p>
          </div>
          <div className="row justify-content-center">
            {[
              {
                img: 'section_bg1.png',
                meta: '15 de enero, 2027 | Boda',
                title: 'El día que dijimos Sí',
                text: 'Hoy unimos nuestras vidas ante Dios y ante quienes más queremos. Gracias por ser parte de este momento tan especial.',
              },
              {
                img: 'section_bg2.png',
                meta: 'Nuestra Historia | Amor',
                title: 'Cómo comenzó todo',
                text: 'Todo comenzó con una conversación, sin imaginar que esas palabras se convertirían en llamadas interminables, viajes y sueños compartidos.',
              },
              {
                img: 'section_bg3.png',
                meta: 'Para ti | Mensaje',
                title: 'Gracias por estar aquí',
                text: 'Será un honor celebrar contigo el inicio de nuestro camino juntos. Gracias por regalarnos parte de tu tiempo y tu amor.',
              },
            ].map((card, i) => (
              <div className="col-lg-4 col-md-6 mb-4" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="blog-card">
                  <img src={`/assets/img/gallery/${card.img}`} className="card-img-top" alt={card.title} />
                  <div className="card-body">
                    <p className="card-meta">{card.meta}</p>
                    <h5 className="card-title">{card.title}</h5>
                    <p className="card-text">{card.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARRUSEL SWIPER ── */}
      <section className="section-padding" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div className="container-fluid px-0">
          <div className="swiper swiper-gallery">
            <div className="swiper-wrapper">
              {carouselImages.map((img, i) => (
                <div className="swiper-slide" key={i}>
                  <img src={`/assets/img/gallery/${img}`} alt={`Galería ${i + 1}`} />
                </div>
              ))}
            </div>
            <div className="swiper-pagination" />
          </div>
        </div>
      </section>

      {/* ── MAPA (solo invitados) ── */}
      {!isPublic && (
        <section id="mapa" className="map-section">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.4688633709043!2d-106.1172639!3d28.6456767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86ea42dc20f7a309%3A0x9d50bc9259e0546!2sSal%C3%B3n%20Las%20Fuentes!5e0!3m2!1ses-419!2smx!4v1786314661446!5m2!1ses-419!2smx"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Salón Las Fuentes"
          />
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer-main">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-5 col-md-12">
              <span className="footer-brand">{GROOM_NAME} & {BRIDE_NAME}</span>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
                Gracias por ser parte de nuestra historia. Nos llena el corazón saber que estarás con nosotros en este día tan especial.
              </p>
              <div className="footer-social mt-3">
                <a href="#inicio" aria-label="Inicio"><i className="fas fa-home" /></a>
                <a href="#historia" aria-label="Historia"><i className="fas fa-heart" /></a>
                <a href="#galeria" aria-label="Galería"><i className="fas fa-images" /></a>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h5>Navegación</h5>
              <ul className="list-unstyled footer-links">
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#historia">Nuestra Historia</a></li>
                <li><a href="#galeria">Galería</a></li>
                <li><a href="#regalos">Mesa de Regalos</a></li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-6">
              <h5>La Boda</h5>
              <ul className="list-unstyled footer-links">
                <li><i className="fas fa-calendar-alt me-2" style={{ color: '#c9a96e' }} />{CEREMONY.date}</li>
                <li><i className="far fa-clock me-2" style={{ color: '#c9a96e' }} />{CEREMONY.time}</li>
                <li><i className="fas fa-map-marker-alt me-2" style={{ color: '#c9a96e' }} />{CEREMONY.venue}</li>
                <li><i className="fas fa-map-pin me-2" style={{ color: '#c9a96e' }} />{CEREMONY.address}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="mb-0">
            Copyright &copy; {new Date().getFullYear()} — {GROOM_NAME} &amp; {BRIDE_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WeddingPage />} />
      <Route path="/:uuid/invitacion" element={<InvitacionPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
