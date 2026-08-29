/*
 * Copyright (C) 2024-2026 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 * License: AGPL-3.0
 */

const legalLinks = [
  { href: 'https://edumind.es/es/legal/privacidad', label: 'Privacidad' },
  { href: 'https://edumind.es/es/legal/cookies', label: 'Cookies' },
  { href: 'https://edumind.es/es/legal/ia', label: 'Política de IA' },
  { href: 'https://edumind.es/es/legal/arco', label: 'ARCO' },
  { href: 'https://edumind.es/es/legal', label: 'Aviso legal' },
];

export default function EDUmindFooter({ appName = 'EDUmind Quiz', version = '1.0.0' }) {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      marginTop: '2rem',
      padding: '1.5rem 1rem',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center',
      fontSize: '0.8rem',
      color: '#9ca3af',
    }}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong style={{ color: '#fff' }}>{appName}</strong>
        {' '}v{version}{' · '}
        © {year} EDUmind® — Luis Vilela Acuña
      </p>
      <p style={{ margin: '0 0 0.5rem' }}>
        Software libre con licencia{' '}
        <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>AGPL-3.0-or-later</a>
        {' / '}
        <a href="https://eupl.eu/1.2/es/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>EUPL-1.2</a>
        {' · '}
        <a href="https://github.com/edumind-es/edumind-quiz" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
          Código fuente en GitHub
        </a>
      </p>
      <nav aria-label="Legal" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.25rem 0.5rem' }}>
        {legalLinks.map((link, i) => (
          <span key={link.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {i > 0 && <span aria-hidden="true" style={{ color: '#6b7280' }}>·</span>}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {link.label}
            </a>
          </span>
        ))}
      </nav>
    </footer>
  );
}
