import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import InvitacionPage from './InvitacionPage';
import NotFoundPage from './NotFoundPage';
import {
  BRIDE_NAME, GROOM_NAME, WEDDING_DATE_DISPLAY, WEDDING_TAGLINE, WEDDING_DATE,
  LOVE_STORY_TITLE, LOVE_STORY_PARAGRAPH_1,
  PROPOSAL_TITLE, PROPOSAL_TEXT_1, PROPOSAL_TEXT_2,
  WEDDING_INFO_TITLE, WEDDING_INFO_DESCRIPTION, CEREMONY, SCHEDULE_TITLE, SCHEDULE,
  DRESSCODE_TITLE, DRESSCODE_STYLE, DRESSCODE_DESCRIPTION, DRESSCODE_PALETTE,
  GIFT_TITLE, GIFT_BUTTON, REGISTRY_TITLE, REGISTRY_DESCRIPTION, REGISTRY_BANK_INFO,
  MUSIC_FILE
} from './config';

/**
 * @fileoverview Componente principal de la aplicación de invitación de boda.
 * @author Job Adolfo Salinas Hernández
 */

/**
 * Reproductor de audio con pantalla de bienvenida (splash screen).
 * Muestra una pantalla de entrada antes de mostrar la invitación y permite
 * controlar la reproducción de la música de fondo.
 *
 * @component
 * @param {Object} props
 * @param {Object|null} props.invitacion - Datos de la invitación personalizada, o null si es pública.
 * @returns {JSX.Element}
 */
function AudioPlayer({ invitacion }) {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    audio.addEventListener('canplaythrough', () => setAudioReady(true), { once: true });
    audio.addEventListener('error', () => setAudioReady(false), { once: true });
    audio.load();
    // Si ya está listo (cached), el evento no vuelve a disparar
    if (audio.readyState >= 3) setAudioReady(true);
  }, []);

  const handleEnter = () => {
    setShowSplash(false);
    const audio = audioRef.current;
    if (!audio || !audioReady) return;
    audio.play().then(() => setPlaying(true)).catch(() => {});
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
      {showSplash && (
        <div onClick={handleEnter} style={{
          position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.82)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>
          <div style={{ textAlign: 'center', color: '#fff', fontFamily: "'Cinzel', serif", padding: '0 24px', maxWidth: '480px', width: '100%' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💍</div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', fontWeight: 400, marginBottom: '8px', letterSpacing: '2px' }}>
              {GROOM_NAME} &amp; {BRIDE_NAME}
            </h2>
            <p style={{ fontSize: 'clamp(0.85rem, 3vw, 1rem)', opacity: 0.75, marginBottom: invitacion ? '20px' : '36px', fontFamily: 'sans-serif' }}>
              {WEDDING_DATE_DISPLAY}
            </p>
            {invitacion && (
              <>
                <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: 600, marginBottom: '8px', letterSpacing: '1px' }}>
                  {invitacion.name}
                </p>
                {invitacion.mensaje_novios && (
                  <p style={{
                    fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', opacity: 0.85,
                    fontFamily: 'sans-serif', lineHeight: 1.7,
                    marginBottom: '28px', whiteSpace: 'pre-line',
                    maxHeight: '120px', overflowY: 'auto'
                  }}>
                    {invitacion.mensaje_novios}
                  </p>
                )}
              </>
            )}
            <div style={{
              border: '1px solid rgba(255,255,255,0.6)', padding: '14px 40px',
              fontSize: '0.95rem', letterSpacing: '3px', textTransform: 'uppercase', display: 'inline-block'
            }}>
              {invitacion ? 'Abrir invitación' : 'Abrir'}
            </div>
          </div>
        </div>
      )}
      {!showSplash && audioReady && (
        <button onClick={toggle} title={playing ? 'Pausar música' : 'Reproducir música'} style={{
          position: 'fixed', bottom: '80px', right: '20px', zIndex: 9999,
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)', border: '1px solid #c0c0c0',
          cursor: 'pointer', fontSize: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {playing
            ? <i className="fas fa-pause" style={{ color: '#6b6b6b', fontSize: '16px' }} />
            : <i className="fas fa-play" style={{ color: '#6b6b6b', fontSize: '16px' }} />}
        </button>
      )}
    </>
  );
}

/**
 * Página principal de la boda. Muestra la historia, galería, cuenta regresiva,
 * información del evento, mesa de regalos y sección de asistencia.
 *
 * @component
 * @param {Object} props
 * @param {Object|null} props.invitacion - Datos del invitado (nombre, mensaje, etc.). Null para vista pública.
 * @param {JSX.Element|null} props.asistenciaSlot - Slot para inyectar la sección de confirmación de asistencia.
 * @returns {JSX.Element}
 */
export function WeddingPage({ invitacion = null, asistenciaSlot = null }) {
  const isPublic = !invitacion;
  const [copiedKey, setCopiedKey] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const distance = WEDDING_DATE - new Date().getTime();
      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initializePlugins = () => {
      const $ = window.jQuery;
      if (!$) return;
      $('#preloader-active').delay(450).fadeOut('slow');
      $('body').delay(450).css({ overflow: 'visible' });
      const menu = $('ul#navigation');
      if (menu.length) {
        menu.slicknav({ prependTo: '.mobile_menu', closedSymbol: '+', openedSymbol: '-' });
        $(document).on('click', '.slicknav_nav a', function () {
          menu.slicknav('close');
        });
      }
      const BasicSlider = $('.slider-active');
      if (BasicSlider.length && !BasicSlider.hasClass('slick-initialized')) {
        BasicSlider.on('init', function () {
          doAnimations($('.single-slider:first-child').find('[data-animation]'));
        });
        BasicSlider.on('beforeChange', function (e, slick, currentSlide, nextSlide) {
          doAnimations($('.single-slider[data-slick-index="' + nextSlide + '"]').find('[data-animation]'));
        });
        BasicSlider.slick({
          autoplay: true, autoplaySpeed: 6000, dots: false, fade: true, arrows: false,
          responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 1, slidesToScroll: 1, infinite: true } },
            { breakpoint: 991, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } },
            { breakpoint: 767, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } }
          ]
        });
      }
      function doAnimations(elements) {
        const endEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        elements.each(function () {
          const $this = $(this);
          const delay = $this.data('delay');
          const type = 'animated ' + $this.data('animation');
          $this.css({ 'animation-delay': delay, '-webkit-animation-delay': delay });
          $this.addClass(type).one(endEvents, function () { $this.removeClass(type); });
        });
      }
      const gallery = $('.gallery-active');
      if (gallery.length && !gallery.hasClass('owl-loaded')) {
        gallery.owlCarousel({
          items: 8, loop: true, autoplay: true, speed: 3000, smartSpeed: 2000,
          nav: false, dots: false, margin: 0, autoplayHoverPause: true,
          responsive: { 0: { items: 2 }, 768: { items: 8 } }
        });
      }
      $(window).on('scroll', function () {
        const scroll = $(window).scrollTop();
        if (scroll < 245) $('.header-sticky').removeClass('sticky-bar sticky');
        else $('.header-sticky').addClass('sticky-bar sticky');
      });
      $.scrollUp({
        scrollName: 'scrollUp', topDistance: '300', topSpeed: 300, animation: 'fade',
        animationInSpeed: 200, animationOutSpeed: 200,
        scrollText: '<i class="ti-arrow-up"></i>', activeOverlay: false
      });
      $('[data-background]').each(function () {
        $(this).css('background-image', 'url(' + $(this).attr('data-background') + ')');
      });
      if (window.WOW) new window.WOW().init();
      const galleryLinks = $('.gallery-area .menorie-icon');
      if (galleryLinks.length) {
        galleryLinks.magnificPopup({ type: 'image', gallery: { enabled: true }, image: { verticalFit: true } });
      }
      const brandSlider = $('.brand-active');
      if (brandSlider.length && !brandSlider.hasClass('slick-initialized')) {
        brandSlider.slick({
          dots: false, infinite: true, speed: 1000, autoplay: true, arrows: false, slidesToShow: 5, slidesToScroll: 1,
          responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 991, settings: { slidesToShow: 2, slidesToScroll: 1 } },
            { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
          ]
        });
      }
    };
    const checkPlugins = setInterval(() => {
      if (window.jQuery && window.jQuery.fn.slick && window.jQuery.fn.owlCarousel) {
        clearInterval(checkPlugins);
        setTimeout(initializePlugins, 100);
      }
    }, 100);
    // Re-aplicar data-background después de que React termine de pintar
    const bgFallback = setTimeout(() => {
      const $ = window.jQuery;
      if ($) {
        $('[data-background]').each(function () {
          $(this).css('background-image', 'url(' + $(this).attr('data-background') + ')');
        });
      }
    }, 800);
    return () => { clearInterval(checkPlugins); clearTimeout(bgFallback); };
  }, []);

  return (
    <div className="App">
      <AudioPlayer invitacion={invitacion} />
      <div id="preloader-active">
        <div className="preloader d-flex align-items-center justify-content-center">
          <div className="preloader-inner position-relative">
            <div className="preloader-circle"></div>
            <div className="preloader-img pere-text">
              <img src="/assets/img/logo/logo.png" alt="" />
            </div>
          </div>
        </div>
      </div>

      <header>
        <div className="header-area">
          <div className="main-header header-sticky">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-xl-2 col-lg-2">
                  <div className="logo">
                    <a href="/"><img src="/assets/img/logo/logo.png" alt="" /></a>
                  </div>
                </div>
                <div className="col-xl-10 col-lg-10 col-md-10">
                  <div className="main-menu f-right d-none d-lg-block">
                    <nav>
                      <ul id="navigation">
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#historia">Historia</a></li>
                        {!isPublic && <li><a href="#informacion">Información</a></li>}
                        <li><a href="#galeria">Galería</a></li>
                        {!isPublic && <li><a href="#contact-form">Asistencia</a></li>}
                        {!isPublic && <li><a href="#mapa">Ubicación</a></li>}
                      </ul>
                    </nav>
                  </div>
                </div>
                <div className="col-12">
                  <div className="mobile_menu d-block d-lg-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div id="inicio" className="slider-area">
          <div className="slider-active">
            <div className="single-slider slider-height hero-overly d-flex align-items-end">
              <div className="container" style={{ paddingBottom: '80px' }}>
                <div className="row d-flex align-items-end">
                  <div className="col-xl-8 col-lg-6 col-md-8">
                    <div className="hero__caption">
                      <h1 data-animation="fadeInLeft" data-delay=".3s" data-duration="2000ms" style={{ fontFamily: "'Cinzel', serif", marginBottom: '8px' }}>
                        {GROOM_NAME}<strong> & </strong>{BRIDE_NAME}
                      </h1>
                      <span data-animation="fadeInLeft" data-delay=".5s">{WEDDING_DATE_DISPLAY}</span>
                      <p data-animation="fadeInLeft" data-delay=".9s">{WEDDING_TAGLINE}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        <div id="historia" className="Our-story-area story-padding">
          <div className="container">
            <div className="row d-flex justify-content-center">
              <div className="col-xl-7 col-lg-8">
                <div className="section-tittle text-center mb-70">
                  <h2>{LOVE_STORY_TITLE}</h2>
                  <img src="/assets/img/gallery/tittle_img.png" alt="" />
                  <p>{LOVE_STORY_PARAGRAPH_1}</p>
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-7 col-sm-9 col-10">
                <div style={{ borderRadius: '8px', overflow: 'hidden', maxHeight: '500px' }}>
                  <img src="/assets/img/gallery/historia_1.jpg" alt="Misael y Tiatira"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isPublic && (
          <section id="informacion" className="pricing-card-area section-padding30">
            <div className="container">
              <div className="row d-flex justify-content-center">
                <div className="col-lg-8">
                  <div className="section-tittle text-center mb-70">
                    <h2>{WEDDING_INFO_TITLE}</h2>
                    <img src="/assets/img/gallery/tittle_img.png" alt="" />
                    <p>{WEDDING_INFO_DESCRIPTION}</p>
                  </div>
                </div>
              </div>
              <div className="row align-items-end">
                <div className="col-xl-4 col-lg-4 col-md-6">
                  <div className="single-card text-center mb-30">
                    <div className="card-top">
                      <span className="flaticon-chart"></span>
                      <h4>{SCHEDULE_TITLE}</h4>
                    </div>
                    <div className="card-bottom">
                      <ul>
                        {SCHEDULE.map((item, i) => (
                          <li key={i}><i className="far fa-clock"></i><strong>{item.time}</strong> — {item.event}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="card-buttons mt-30">
                      <a href="https://maps.app.goo.gl/ekDe9whtuHt8YnbW6?g_st=aw" target="_blank" rel="noopener noreferrer" className="btn card-btn1">
                        <i className="fas fa-map-marker-alt"></i> Ver ubicación
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-xl-4 col-lg-4 col-md-6">
                  <div className="single-card active text-center mb-30">
                    <div className="card-top">
                      <span className="flaticon-project"></span>
                      <h4>{CEREMONY.title}</h4>
                    </div>
                    <div className="card-bottom">
                      <ul>
                        <li><i className="fas fa-calendar-alt"></i>{CEREMONY.date}</li>
                        <li><i className="far fa-clock"></i>{CEREMONY.time}</li>
                        <li><i className="fas fa-map-marker-alt"></i>{CEREMONY.venue}</li>
                        <li>{CEREMONY.address}</li>
                        <li><i className="far fa-clock"></i> {CEREMONY.timezone}</li>
                      </ul>
                    </div>
                    <div className="card-buttons mt-30">
                      <a href="https://maps.app.goo.gl/ekDe9whtuHt8YnbW6?g_st=aw" target="_blank" rel="noopener noreferrer" className="btn card-btn1">
                        <i className="fas fa-map-marker-alt"></i> Ver ubicación
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-xl-4 col-lg-4 col-md-6">
                  <div className="single-card text-center mb-30">
                    <div className="card-top">
                      <span className="flaticon-award"></span>
                      <h4>{DRESSCODE_TITLE}</h4>
                    </div>
                    <div className="card-bottom">
                      <ul>
                        <li><i className="fas fa-tshirt"></i><strong>{DRESSCODE_STYLE}</strong></li>
                        <li>{DRESSCODE_DESCRIPTION}</li>
                        <li>{DRESSCODE_PALETTE}</li>
                      </ul>
                    </div>
                    <div className="card-buttons mt-30">
                      <a href="https://maps.app.goo.gl/ekDe9whtuHt8YnbW6?g_st=aw" target="_blank" rel="noopener noreferrer" className="btn card-btn1">
                        <i className="fas fa-map-marker-alt"></i> Ver ubicación
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="count-down-area">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-12 col-md-12">
                <div className="count-down-wrapper" data-background="/assets/img/gallery/section_bg2.png">
                  <div className="row justify-content-between">
                    <div className="col-lg-3 col-md-6 col-sm-6">
                      <div className="single-counter text-center">
                        <span className="counter">{countdown.days}</span>
                        <p>días</p>
                      </div>
                    </div>
                    <div className="col-lg-2 col-md-6 col-sm-6">
                      <div className="single-counter active text-center">
                        <span className="counter">{countdown.hours}</span>
                        <p>horas</p>
                      </div>
                    </div>
                    <div className="col-lg-2 col-md-6 col-sm-6">
                      <div className="single-counter text-center">
                        <span className="counter">{countdown.minutes}</span>
                        <p>minutos</p>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-6">
                      <div className="single-counter text-center">
                        <span className="counter">{countdown.seconds}</span>
                        <p>segundos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="galeria" className="gallery-area section-padding4">
          <div className="container">
            <div className="row">
              {['foto_galeria_1.jpg','foto_galeria_2.jpg','foto_galeria_3.jpg','foto_galeria_4.jpg'].map((img, i) => (
                <div key={i} className={`col-lg-${i === 0 || i === 3 ? 4 : 8} col-md-6`}>
                  <div className="single-gallery mb-30">
                    <div className="gallery-img" style={{ backgroundImage: `url(/assets/img/gallery/${img})` }}></div>
                    <div className="thumb-content-box">
                      <div className="thumb-content">
                        <a href={`/assets/img/gallery/${img}`} className="menorie-icon"><i className="ti-plus"></i></a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isPublic && (
          <section className="gift-area gift-padding fix" data-background="/assets/img/gallery/section_bg3.png">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <div className="gift-caption text-center">
                    <h2>{GIFT_TITLE}</h2>
                    <a href="#contact-form" className="btn btn-whit">{GIFT_BUTTON}</a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {!isPublic && asistenciaSlot}

        <section className="brand-area section-padding-b">
          <div className="container">
            <div className="row d-flex justify-content-center">
              <div className="col-lg-8">
                <div className="section-tittle text-center mb-80">
                  <h2>{REGISTRY_TITLE}</h2>
                  <img src="/assets/img/gallery/tittle_img.png" alt="" />
                  <p>{REGISTRY_DESCRIPTION}</p>
                  <div style={{
                    margin: '24px auto 0', maxWidth: '420px',
                    background: 'linear-gradient(135deg, rgba(253,248,240,0.95) 0%, rgba(240,228,210,0.95) 100%)',
                    border: '1px solid #c9a96e', borderRadius: '12px', padding: '24px 32px',
                    boxShadow: '0 4px 18px rgba(139,105,20,0.12), inset 0 1px 0 rgba(255,255,255,0.8)', position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(90deg, #c9a96e, #8b6914, #c9a96e)', height: '2px', width: '60%', borderRadius: '2px'
                    }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
                      {REGISTRY_BANK_INFO.map((item, i) => (
                        <li key={i} style={{
                          display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '7px 0',
                          borderBottom: i < REGISTRY_BANK_INFO.length - 1 ? '1px solid rgba(201,169,110,0.3)' : 'none', fontSize: '0.92rem'
                        }}>
                          <span style={{ color: '#8b6914', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5c4a32', textAlign: 'right' }}>
                            {item.value}
                            {i >= 1 && (
                              <button onClick={() => handleCopy(item.value, i)} title="Copiar" style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                                borderRadius: '4px', lineHeight: 1, color: copiedKey === i ? '#5a8a3a' : '#8b6914', transition: 'color 0.2s'
                              }}>
                                <i className={copiedKey === i ? 'fas fa-check' : 'far fa-copy'} style={{ fontSize: '13px' }} />
                              </button>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div style={{
                      position: 'absolute', bottom: '-1px', left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(90deg, #c9a96e, #8b6914, #c9a96e)', height: '2px', width: '60%', borderRadius: '2px'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="brand-area section-padding-b">
          <div className="container">
            <div className="row d-flex justify-content-center">
              <div className="col-lg-8">
                <div className="section-tittle text-center mb-80">
                  <h2>Agradecimiento</h2>
                  <img src="/assets/img/gallery/tittle_img.png" alt="" />
                  <p>Durante mucho tiempo imaginamos cómo sería este día; hoy, al verlo tan cerca, solo podemos agradecer a DIOS, a la vida y a las personas que han estado a nuestro lado. Gracias por acompañarnos a comenzar esta nueva etapa. Será un honor celebrar contigo el inicio de nuestro camino juntos.</p>
                  <p>Gracias por regalarnos parte de tu tiempo. Sabemos que algunos recorrerán muchos kilómetros para estar aquí, y eso significa muchísimo para nosotros.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="gallery-area2 fix">
          <div className="container-fluid p-0">
            <div className="row">
              <div className="col-md-12">
                <div className="gallery-active owl-carousel">
                  {['gallery01','gallery02','gallery03','gallery04','gallery05','gallery06','gallery07','gallery08'].map((g, i) => (
                    <div key={i} className="gallery-img">
                      <img src={`/assets/img/gallery/${g}.png`} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isPublic && (
          <section id="mapa" className="contact-sections">
            <div className="d-area">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.4688633709043!2d-106.1172639!3d28.6456767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86ea42dc20f7a309%3A0x9d50bc9259e0546!2sSal%C3%B3n%20Las%20Fuentes!5e0!3m2!1ses-419!2smx!4v1786314661446!5m2!1ses-419!2smx"
                width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin" title="Salón Las Fuentes"
              ></iframe>
            </div>
          </section>
        )}
      </main>

      <footer>
        <div className="footer-main" data-background="/assets/img/gallery/section_bg4.png">
          <div className="footer-bottom-area">
            <div className="container">
              <div className="footer-border">
                <div className="row d-flex align-items-center">
                  <div className="col-xl-12">
                    <div className="footer-copy-right text-center">
                      <p>Copyright &copy;{new Date().getFullYear()} Todos los derechos reservados | Misael &amp; Tiatira</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Componente raíz de la aplicación. Define las rutas principales:
 * - `/` → Vista pública de la boda.
 * - `/:uuid/invitacion` → Invitación personalizada por UUID.
 * - `*` → Página 404.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WeddingPage />} />
      <Route path="/:uuid/invitacion" element={<InvitacionPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
