/**
 * @fileoverview Página 404 migrada al nuevo template.
 * @author Job Adolfo Salinas Hernández
 */
import React from 'react';

export default function NotFoundPage() {
  return (
    <div className="status-page">
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>💍</div>
      <h1 style={{ fontSize: '5rem', color: '#9b2335', margin: '0 0 8px', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
        404
      </h1>
      <h2>Página no encontrada</h2>
      <p>
        La página que buscas no existe. Si tienes una invitación, verifica que el enlace sea correcto.
      </p>
      <a href="/">Ir al inicio</a>
    </div>
  );
}
