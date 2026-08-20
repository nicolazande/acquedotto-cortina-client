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
