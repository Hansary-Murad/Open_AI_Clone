// src/components/ShowMessage.jsx
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getTokenProgress, formatTokenCount } from '../utils/tokenCounter';

const ShowMessage = ({ 
    messages = [],
    isLoading = false 
}) => {
    const bottomRef = useRef(null);

    // Автоскролл
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!messages || messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="text-6xl mb-4 animate-bounce">🤖</div>
                <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Murad AI
                </h2>
                <p className="text-zinc-400 font-mono">
                    Задайте вопрос, чтобы начать диалог
                </p>
                <div className="flex gap-2 mt-4">
                    <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-500">
                        💡 Напишите что-нибудь
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto space-y-4 pb-4">
            {messages.map((msg, index) => {
                if (!msg) return null;
                
                const isUser = msg.role === 'user';
                const tokenInfo = getTokenProgress(msg.content, 4096);

                return (
                    <div
                        key={msg.id || index}
                        className={`flex items-start gap-3 message-enter ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Аватар */}
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-lg
                            ${isUser 
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/20' 
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                            }`}
                        >
                            {isUser ? '👤' : '🤖'}
                        </div>

                        {/* Сообщение */}
                        <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                            <div className={`inline-block rounded-2xl px-5 py-3 shadow-sm relative max-w-full
                                ${isUser 
                                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-none' 
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-200 dark:border-zinc-700'
                                }`}
                            >
                                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ href, children }) => (
                                                <a href={href} target="_blank" rel="noopener noreferrer" 
                                                   className="text-blue-500 hover:underline">
                                                    {children}
                                                </a>
                                            ),
                                            code: ({ inline, children }) => {
                                                if (inline) {
                                                    return <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm break-words">{children}</code>;
                                                }
                                                return <code className="block bg-black/10 dark:bg-white/10 p-3 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">{children}</code>;
                                            },
                                            p: ({ children }) => (
                                                <p className="mb-2 last:mb-0 break-words">{children}</p>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc pl-4 space-y-1">{children}</ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal pl-4 space-y-1">{children}</ol>
                                            ),
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-4 border-zinc-500 pl-4 my-2 italic break-words">
                                                    {children}
                                                </blockquote>
                                            ),
                                            h1: ({ children }) => (
                                                <h1 className="text-xl font-bold mb-2 break-words">{children}</h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-lg font-bold mb-2 break-words">{children}</h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-base font-bold mb-2 break-words">{children}</h3>
                                            ),
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {/* Информация о токенах */}
                            <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                    📝 {formatTokenCount(msg.content)}
                                </span>
                                
                                <div className="group relative">
                                    <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className={`h-full ${tokenInfo.bgColor} transition-all duration-500 rounded-full
                                                ${tokenInfo.percentage > 80 ? 'animate-pulse' : ''}`}
                                            style={{ width: `${Math.min(100, tokenInfo.percentage)}%` }}
                                        />
                                    </div>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                                        bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
                                        {Math.round(tokenInfo.percentage)}% от лимита
                                    </div>
                                </div>
                                
                                <span className={`text-[10px] font-mono ${tokenInfo.color} min-w-[24px]`}>
                                    {Math.round(tokenInfo.percentage)}%
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {/* ✅ Индикатор загрузки (печатает) */}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                        🤖
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-5 py-3 rounded-2xl rounded-bl-none border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></span>
                        </div>
                    </div>
                </div>
            )}
            
            <div ref={bottomRef} />
        </div>
    );
};

export default ShowMessage;