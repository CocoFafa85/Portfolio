import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.scss';

// Fonts: load every weight the styles use, otherwise the browser fakes bold.
// Orbitron: 400 (body labels), 700 (headings), 900 (HoloCard initials, WIP ribbon).
// Montserrat Alternates: 400 (body), 700 (bold labels).
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/900.css';
import '@fontsource/montserrat-alternates/400.css';
import '@fontsource/montserrat-alternates/700.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
