import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { prefix } from '../lib/prefix';

export default defineConfig(({ command }) => {
    if (command === 'serve') {
        return {
            plugins: [react()],
            css: prefix()
        };
    } else {
        return {
            plugins: [react({ jsxRuntime: 'classic' })],
            css: prefix(),
            build: {
                lib: {
                    formats: ['iife'],
                    entry: path.resolve(__dirname, 'src/choiceguide.tsx'), // Correct path to your entry file
                    name: 'OpenstadHeadlessChoiceGuide',
                    fileName: 'choiceguide',
                },
                rollupOptions: {
                    external: ['react', 'react-dom'],
                    output: {
                        globals: {
                            'react': 'React',
                            'react-dom': 'ReactDOM'
                        }
                    }
                },
                outDir: 'dist', // Ensures output is in the dist directory
            },
        };
    }
});
