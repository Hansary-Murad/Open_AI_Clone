// src/main.jsx
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
    console.error('❌ Root element not found!');
    document.body.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#ef4444;flex-direction:column;gap:1rem;">
            <h1>🚫 Ошибка</h1>
            <p>Элемент #root не найден в HTML</p>
        </div>
    `;
} else {
    try {
        const root = createRoot(rootElement);
        root.render(
            <StrictMode>
                <App />
            </StrictMode>
        );
        console.log('✅ App успешно загружен!');
    } catch (error) {
        console.error('❌ Ошибка при рендеринге:', error);
        rootElement.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#ef4444;flex-direction:column;gap:1rem;">
                <h1>🚫 Ошибка загрузки</h1>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Проверка API ключей (для разработки)
if (import.meta.env.DEV) {
    const hasGPTKey = !!import.meta.env.VITE_APP_GPT_KEY;
    const hasGeminiKey = !!import.meta.env.VITE_GEMINI_KEY;
    
    if (!hasGPTKey && !hasGeminiKey) {
        console.warn('⚠️ API ключи не найдены!');
    } else {
        console.log('🔑 API ключи:', {
            GPT: hasGPTKey ? '✅' : '❌',
            Gemini: hasGeminiKey ? '✅' : '❌',
        });
    }
}