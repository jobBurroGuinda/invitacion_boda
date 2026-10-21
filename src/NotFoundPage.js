/**
 * @fileoverview Página 404 para rutas no encontradas.
 * @author Job Adolfo Salinas Hernández
 */

import React from 'react';

/**
 * Página de error 404. Se muestra cuando el usuario accede a una ruta inexistente.
 * Incluye un enlace para regresar al inicio.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#fdf8f0', fontFamily: "'Cinzel', serif", textAlign: 'center', padding: '24px'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>💍</div>
      <h1 style={{ fontSize: '5rem', color: '#c9a96e', margin: '0 0 8px', fontWeight: 700 }}>404</h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#5c4a32', marginBottom: '12px' }}>
        Página no encontrada
      </h2>
      <p style={{ color: '#8b7355', fontFamily: 'sans-serif', maxWidth: '360px', lineHeight: 1.7 }}>
        La página que buscas no existe. Si tienes una invitación, verifica que el enlace sea correcto.
      </p>
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
