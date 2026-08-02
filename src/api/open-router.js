// src/api/open-router.js
import axios from "axios";

const API_KEY = import.meta.env.VITE_APP_GPT_KEY;

if (!API_KEY) {
    console.error('❌ VITE_APP_GPT_KEY не найден!');
}

const openRouterAxios = axios.create({
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
    },
    timeout: 30000,
});

const MODELS = [
    "openrouter/free",
    "qwen/qwen-2.5-7b-instruct:free",
    "deepseek/deepseek-chat:free",
];

export const getCompletion = async (prompt) => {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        throw new Error('Вопрос не может быть пустым');
    }

    let lastError = null;

    for (const model of MODELS) {
        try {
            console.log(`🔄 Пробую модель: ${model}`);
            
            const response = await openRouterAxios.post("/chat/completions", {
                model: model,
                messages: [
                    { 
                        role: "system", 
                        content: "Ты полезный AI-ассистент. Отвечай строго на русском языке. Всегда отвечай на русском, независимо от языка вопроса. Используй понятный и естественный русский язык." 
                    },
                    { 
                        role: "user", 
                        content: prompt.trim() 
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            console.log(`✅ Модель ${model} работает!`);
            return response.data;

        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.warn(`❌ Модель ${model} не работает: ${errorMsg}`);
            
            lastError = error;
            
            if (error.response?.status === 401) {
                throw new Error('Неверный API ключ. Проверьте VITE_APP_GPT_KEY', { 
                    cause: error 
                });
            }
            if (error.response?.status === 429) {
                throw new Error('Слишком много запросов. Подождите немного.', { 
                    cause: error 
                });
            }
        }
    }

    throw new Error('Все модели временно недоступны. Попробуйте позже.', {
        cause: lastError || new Error('Неизвестная ошибка')
    });
};