// src/components/Loader.jsx
const Loader = ({ text = "Думаю..." }) => {
    return (
        <div className="flex flex-col items-center gap-3">
            {/* Основной спиннер */}
            <div className="relative">
                {/* Внешнее кольцо */}
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                
                {/* Внутренняя пульсация */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 animate-pulse"></div>
                </div>
                
                {/* Градиентное свечение */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            </div>

            {/* Текст */}
            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-mono animate-pulse">
                {text}
            </span>
        </div>
    );
};

export default Loader;