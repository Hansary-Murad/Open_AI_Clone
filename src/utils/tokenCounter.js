// src/utils/tokenCounter.js

// Более точный подсчёт токенов (для разных языков)
export const countTokens = (text) => {
    if (!text || typeof text !== 'string') return 0;

    const cleanText = text.trim();
    if (!cleanText) return 0;

    let tokens = 0;
    let i = 0;
    const len = cleanText.length;

    while (i < len) {
        const char = cleanText[i];
        const code = char.charCodeAt(0);

        // Русские/английские буквы и цифры
        if ((code >= 65 && code <= 90) ||      // A-Z
            (code >= 97 && code <= 122) ||     // a-z
            (code >= 1040 && code <= 1103) ||  // А-я
            (code >= 48 && code <= 57)) {      // 0-9
            tokens += 0.25;
        }
        // Пробелы и знаки препинания
        else if (char === ' ' || char === '\n' || char === '\t') {
            tokens += 0.1;
        }
        // Специальные символы (эмодзи, китайский и т.д.)
        else {
            tokens += 0.5;
        }
        i++;
    }

    return Math.ceil(tokens);
};

// Подсчёт с детализацией
export const countTokensDetailed = (text) => {
    if (!text || typeof text !== 'string') {
        return { total: 0, letters: 0, spaces: 0, special: 0 };
    }

    let letters = 0;
    let spaces = 0;
    let special = 0;

    for (const char of text) {
        const code = char.charCodeAt(0);
        if ((code >= 65 && code <= 90) ||      // A-Z
            (code >= 97 && code <= 122) ||     // a-z
            (code >= 1040 && code <= 1103) ||  // А-я
            (code >= 48 && code <= 57)) {      // 0-9
            letters++;
        } else if (char === ' ' || char === '\n' || char === '\t') {
            spaces++;
        } else {
            special++;
        }
    }

    const total = Math.ceil((letters * 0.25) + (spaces * 0.1) + (special * 0.5));
    return { total, letters, spaces, special };
};

// Форматирование для отображения
export const formatTokenCount = (text) => {
    const count = countTokens(text);
    if (count === 0) return '0 токенов';
    if (count === 1) return '1 токен';
    if (count < 5) return `${count} токена`;
    if (count < 100) return `${count} токенов`;
    if (count < 1000) return `${(count / 1000).toFixed(1)}K токенов`;
    return `${(count / 1000).toFixed(1)}K токенов`;
};

// Оценка стоимости (для OpenAI)
export const estimateCost = (text, model = 'gpt-3.5-turbo') => {
    const tokens = countTokens(text);
    const rates = {
        'gpt-3.5-turbo': 0.002 / 1000,
        'gpt-4': 0.03 / 1000,
        'gpt-4-turbo': 0.01 / 1000,
        'claude-3': 0.015 / 1000,
        'gemini-pro': 0.0005 / 1000,
    };
    const rate = rates[model] || rates['gpt-3.5-turbo'];
    return tokens * rate;
};

// Прогноз времени ответа
export const estimateResponseTime = (text) => {
    const tokens = countTokens(text);
    const seconds = Math.ceil(tokens / 25);
    if (seconds < 1) return '< 1 сек';
    if (seconds < 60) return `${seconds} сек`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} мин ${remainingSeconds} сек`;
};

// Валидация длины
export const validateTokenLimit = (text, maxTokens = 4096) => {
    const tokens = countTokens(text);
    return {
        isValid: tokens <= maxTokens,
        tokens,
        maxTokens,
        percentage: Math.min(100, (tokens / maxTokens) * 100),
        remaining: maxTokens - tokens,
    };
};

// Прогресс-бар для лимита
export const getTokenProgress = (text, maxTokens = 4096) => {
    const { isValid, tokens, percentage, remaining } = validateTokenLimit(text, maxTokens);
    
    let color = 'text-emerald-400';
    let bgColor = 'bg-emerald-400';

    if (percentage > 80) {
        color = 'text-yellow-400';
        bgColor = 'bg-yellow-400';
    }
    if (percentage > 95) {
        color = 'text-orange-400';
        bgColor = 'bg-orange-400';
    }
    if (percentage > 99) {
        color = 'text-red-500';
        bgColor = 'bg-red-500 animate-pulse';
    }

    return { isValid, tokens, percentage, remaining, color, bgColor };
};

// Подсчёт токенов для всех сообщений
export const countTotalTokens = (messages) => {
    return messages.reduce((sum, msg) => {
        return sum + countTokens(msg.content);
    }, 0);
};

// Форматирование общего количества токенов
export const formatTotalTokens = (messages) => {
    const total = countTotalTokens(messages);
    return formatTokenCount(total);
};