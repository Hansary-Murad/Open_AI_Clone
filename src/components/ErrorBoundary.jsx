// src/components/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Обновляем состояние, чтобы следующий рендер показал fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Логируем ошибку в консоль
        console.error('❌ ErrorBoundary поймал ошибку:', error, errorInfo);
        
        // Сохраняем детали ошибки для отображения
        this.setState({
            errorInfo: errorInfo
        });

        // Здесь можно отправить ошибку в сервис мониторинга
        // например: Sentry, LogRocket, etc.
        // logErrorToService(error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ 
            hasError: false, 
            error: null,
            errorInfo: null 
        });
    };

    render() {
        if (this.state.hasError) {
            // Кастомный fallback UI
            const errorMessage = this.state.error?.message || 'Неизвестная ошибка';
            const isDev = import.meta.env.DEV;

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                    <div className="text-6xl mb-4">🛡️</div>
                    <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-2">
                        Что-то пошло не так
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono max-w-md mb-4">
                        {errorMessage}
                    </p>
                    
                    {/* Детали ошибки только в режиме разработки */}
                    {isDev && this.state.errorInfo && (
                        <details className="text-left w-full max-w-2xl bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-4 overflow-auto max-h-60">
                            <summary className="cursor-pointer font-mono text-sm text-zinc-600 dark:text-zinc-400">
                                🔍 Детали ошибки (только для разработки)
                            </summary>
                            <pre className="text-xs text-red-600 dark:text-red-400 mt-2 whitespace-pre-wrap break-words">
                                {this.state.error?.stack || 'Нет стека'}
                            </pre>
                            <pre className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 whitespace-pre-wrap break-words">
                                {this.state.errorInfo?.componentStack || 'Нет компонентного стека'}
                            </pre>
                        </details>
                    )}

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={this.handleReset}
                            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl text-zinc-700 dark:text-zinc-200 transition-colors"
                        >
                            🔄 Попробовать снова
                        </button>
                        <button
                            onClick={this.handleReload}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            🔄 Перезагрузить страницу
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;