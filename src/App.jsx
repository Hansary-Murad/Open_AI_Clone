// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import './App.css';
import QuestionForm from './components/QuestionForm';
import { getCompletion } from './api/open-router';
import ShowMessage from './components/ShowMessage';
import Loader from './components/Loader';
import TagSelector from './components/TagSelector';
import ErrorBoundary from './components/ErrorBoundary';
import { exportChat } from './utils/exportChat';

const MAX_MESSAGES = 50;
const MAX_TOKENS = 4000;

function App() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || 
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    const messagesEndRef = useRef(null);
    const exportMenuRef = useRef(null);

    // Функция очистки истории
    const checkAndCleanHistory = (msgs) => {
        if (!msgs || msgs.length === 0) return msgs || [];
        
        if (msgs.length > MAX_MESSAGES) {
            return msgs.slice(-MAX_MESSAGES);
        }

        const totalTokens = msgs.reduce((sum, msg) => {
            return sum + (msg.tokenCount || Math.ceil((msg.content?.length || 0) / 4));
        }, 0);

        if (totalTokens > MAX_TOKENS) {
            let newMessages = [...msgs];
            while (newMessages.length > 0) {
                const tokens = newMessages.reduce((sum, msg) => {
                    return sum + (msg.tokenCount || Math.ceil((msg.content?.length || 0) / 4));
                }, 0);
                if (tokens <= MAX_TOKENS) break;
                newMessages = newMessages.slice(1);
            }
            return newMessages;
        }

        return msgs;
    };

    // Загрузка истории
    useEffect(() => {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const cleaned = checkAndCleanHistory(parsed);
                setMessages(cleaned || []);
            } catch (e) {
                console.error('Ошибка загрузки истории:', e);
                setMessages([]);
            }
        }
    }, []);

    // Сохранение истории
    useEffect(() => {
        if (messages && messages.length > 0) {
            const cleaned = checkAndCleanHistory(messages);
            if (cleaned && cleaned.length !== messages.length) {
                setMessages(cleaned);
            }
            localStorage.setItem('chatHistory', JSON.stringify(cleaned || messages));
        }
    }, [messages]);

    // Тема
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    // Закрытие меню экспорта
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (data) => {
        if (!data || !data.text || !data.text.trim()) {
            setError('Вопрос не может быть пустым');
            return;
        }

        setError(null);
        setIsLoading(true);

        const content = data.text.trim();

        const userMsg = { 
            id: Date.now(), 
            role: 'user', 
            content: content,
            tags: selectedTags,
            timestamp: Date.now(),
            tokenCount: Math.ceil(content.length / 4)
        };
        
        setMessages(prev => [...(prev || []), userMsg]);

        try {
            const response = await getCompletion(content);

            const assistantMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.choices?.[0]?.message?.content || 'Нет ответа',
                timestamp: Date.now(),
                tokenCount: Math.ceil((response.choices?.[0]?.message?.content || '').length / 4)
            };

            setMessages(prev => [...(prev || []), assistantMsg]);
        } catch (err) {
            console.error('❌ Ошибка:', err);
            setError(err.message);
            setMessages(prev => [...(prev || []), {
                id: Date.now() + 1,
                role: 'assistant',
                content: `❌ ${err.message}`,
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Регенерация ответа
    const handleRegenerate = async (index) => {
        if (!messages || messages.length === 0) return;
        const userMsg = messages[index - 1];
        if (!userMsg) return;

        setMessages(prev => (prev || []).slice(0, -1));
        await handleSubmit({ text: userMsg.content });
    };

    // Редактирование сообщения
    const handleEditMessage = (id, newContent) => {
        setMessages(prev => (prev || []).map(msg => 
            msg.id === id ? { ...msg, content: newContent } : msg
        ));
    };

    // Удаление сообщения
    const handleDeleteMessage = (id) => {
        setMessages(prev => (prev || []).filter(msg => msg.id !== id));
    };

    // Очистка истории
    const clearHistory = () => {
        if (window.confirm('Удалить всю историю чата?')) {
            setMessages([]);
            localStorage.removeItem('chatHistory');
        }
    };

    // Переключение темы
    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    // Экспорт чата
    const handleExport = (format) => {
        if (!messages || messages.length === 0) {
            alert('Нет сообщений для экспорта');
            return;
        }
        exportChat(messages, format, 'murad-ai');
        setShowExportMenu(false);
    };

    // Подсчёт токенов для хедера
    const totalTokens = (messages || []).reduce((sum, msg) => {
        return sum + (msg.tokenCount || Math.ceil((msg.content || '').length / 4));
    }, 0);

    const safeMessages = messages || [];

    return (
        <div className={`flex flex-col min-h-screen w-full transition-colors duration-300
            ${isDark ? 'bg-zinc-900' : 'bg-zinc-50'}`}
        >
            {/* Хедер */}
            <header className={`sticky top-0 z-10 backdrop-blur-md border-b transition-colors duration-300
                ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}
            >
                <div className='max-w-3xl mx-auto flex items-center justify-between px-4 py-3'>
                    <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20'>
                            AI
                        </div>
                        <div>
                            <h1 className={`font-semibold text-lg transition-colors duration-300
                                ${isDark ? 'text-white' : 'text-zinc-800'}`}
                            >
                                Murad AI
                            </h1>
                            <span className='text-xs text-zinc-400 flex items-center gap-1'>
                                <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse'></span>
                                Online
                            </span>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-1.5 sm:gap-2'>
                        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                            <span>{safeMessages.length}/{MAX_MESSAGES}</span>
                            <span className="w-px h-3 bg-zinc-600"></span>
                            <span>{Math.round(totalTokens / MAX_TOKENS * 100)}%</span>
                        </div>
                        
                        <button
                            onClick={toggleTheme}
                            className={`p-1.5 rounded-lg transition-colors duration-200
                                ${isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'}`}
                            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>
                        
                        <div className="relative" ref={exportMenuRef}>
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className={`p-1.5 rounded-lg transition-colors duration-200
                                    ${isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'}`}
                                title="Экспорт чата"
                            >
                                📥
                            </button>
                            
                            {showExportMenu && (
                                <div className={`absolute right-0 mt-2 rounded-xl shadow-lg border py-1 min-w-[120px] z-20 transition-all duration-200
                                    ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'}`}
                                >
                                    {['txt', 'pdf', 'json', 'html'].map((format) => (
                                        <button
                                            key={format}
                                            onClick={() => handleExport(format)}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                                ${isDark ? 'text-zinc-300 hover:bg-zinc-700' : 'text-zinc-700 hover:bg-zinc-100'}`}
                                        >
                                            📄 {format.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {safeMessages.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className={`p-1.5 rounded-lg transition-colors duration-200
                                    ${isDark ? 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800' : 'text-zinc-500 hover:text-red-500 hover:bg-zinc-100'}`}
                                title="Очистить историю"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Теги */}
            <div className='max-w-3xl mx-auto w-full px-4 pt-4'>
                <TagSelector 
                    onSelect={setSelectedTags}
                    selectedTags={selectedTags}
                    multiple={true}
                />
            </div>

            {/* Основной контент */}
            <div className='flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 pt-2 pb-36'>
                <div className='flex-1 overflow-y-auto'>
                    <ErrorBoundary>
                        <ShowMessage 
                            messages={safeMessages}
                            onRegenerate={handleRegenerate}
                            onEditMessage={handleEditMessage}
                            onDeleteMessage={handleDeleteMessage}
                            isLoading={isLoading}
                        />
                    </ErrorBoundary>
                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-mono text-center transition-all duration-300 animate-in
                        ${isDark ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-100 text-red-700 border border-red-200'}`}
                    >
                        ⚠️ {error}
                    </div>
                )}

                {isLoading && (
                    <div className='flex justify-center items-center py-6'>
                        <Loader />
                    </div>
                )}
            </div>

            {/* Инпут */}
            <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-md border-t transition-colors duration-300
                ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}
            >
                <div className='max-w-3xl mx-auto px-4 py-3'>
                    <QuestionForm onSubmit={handleSubmit} disabled={isLoading} />
                </div>
            </div>
        </div>
    );
}

export default App;