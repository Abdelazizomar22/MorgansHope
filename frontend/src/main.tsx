import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global reset and theme variables
const style = document.createElement('style');
style.textContent = `
  :root {
    --bg-main: #F7FAFC; /* Bright Snow */
    --text-main: #0F172A;
    --text-muted: #475569;
    --primary: #2E5C5A; /* Dark Slate Grey */
    --primary-light: #467E7C;
    --primary-dark: #1F403E;
    --primary-rgb: 46, 92, 90;
    --primary-light-rgb: 70, 126, 124;
    --card-bg: #FFFFFF;
    --card-border: #E2E8F0;
    --shadow-main: rgba(46, 92, 90, 0.08);
    --shadow-hover: rgba(46, 92, 90, 0.16);
    --input-border: #CBD5E1;
    --input-focus: #2E5C5A;
    --accent-color: #38706E;
    --source-color: #64748B;
    --header-gradient: linear-gradient(150deg, #1F403E 0%, #2E5C5A 50%, #38706E 100%);
    --panel-gradient: linear-gradient(150deg, #1F403E 0%, #2E5C5A 100%);
    --warning-bg: rgba(46, 92, 90, 0.05);
    --warning-border: #99C2C1;
    --warning-text: #2E5C5A;
    --warning-body: #475569;

    --hero-text-1: #153F2E;
    --hero-text-2: #47695c;
  }

  [data-theme='dark'] {
    --bg-main: #000000; /* Black */
    --text-main: #F8FAFC;
    --text-muted: #94A3B8;
    --primary: #5C8374; /* Deep Teal */
    --primary-light: rgba(92, 131, 116, 0.25);
    --primary-dark: #436356;
    --primary-rgb: 92, 131, 116;
    --primary-light-rgb: 92, 131, 116;
    --card-bg: #0A0F0D;
    --card-border: #262626;
    --shadow-main: rgba(0, 0, 0, 0.5);
    --shadow-hover: rgba(0, 0, 0, 0.7);
    --input-border: #262626;
    --input-focus: #5C8374;
    --accent-color: #79A392;
    --source-color: #94A3B8;
    --header-gradient: linear-gradient(150deg, #000000 0%, #0A110E 50%, #16241E 100%);
    --panel-gradient: linear-gradient(150deg, #436356 0%, #5C8374 100%);
    --warning-bg: rgba(92, 131, 116, 0.1);
    --warning-border: #262626;
    --warning-text: #5C8374;
    --warning-body: #E2E8F0;

    --hero-text-1: #405f53;
    --hero-text-2: #839A91;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg-main); color: var(--text-main); transition: background-color 0.35s ease, color 0.35s ease; }
  a { color: inherit; }
  button, input, select, textarea { font-family: inherit; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
