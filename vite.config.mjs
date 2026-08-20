import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        // Il progetto tiene il JSX dentro file .js (eredita da Create React App):
        // senza questo "include" il plugin ignorerebbe quasi tutti i componenti.
        react({ include: '**/*.{js,jsx}' }),
    ],

    // Le variabili restano quelle gia configurate su Netlify (REACT_APP_API_URL),
    // ma sono accettate anche quelle con il prefisso VITE_ per il futuro.
    envPrefix: ['VITE_', 'REACT_APP_'],

    server: {
        port: 3000,
        // Senza REACT_APP_API_URL le chiamate restano relative e passano di qui.
        proxy: {
            '/api': {
                target: process.env.PROXY_TARGET || 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },

    build: {
        // Netlify pubblica questa cartella: mantenere il nome evita di toccare il deploy.
        outDir: 'build',
        sourcemap: false,

        // Vite 6 compilerebbe per browser molto recenti (Chrome 107, Safari 16).
        // Il gestionale si usa anche da telefoni non nuovi: un iPhone fermo a iOS 15
        // non riuscirebbe nemmeno a leggere il file e mostrerebbe una pagina bianca,
        // senza alcun messaggio. Questa soglia copre i browser dal 2020 in poi e
        // costa pochissimo in dimensione.
        target: ['es2019', 'safari13', 'chrome80', 'firefox78', 'edge88'],
    },

    // In build il codice passa da esbuild prima dell'analisi degli import:
    // senza dirgli che i .js di src/ contengono JSX, il parsing fallisce.
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: [],
    },

    optimizeDeps: {
        esbuildOptions: {
            // Anche in fase di pre-bundling i .js possono contenere JSX.
            loader: { '.js': 'jsx' },
        },
    },
});
