// src/components/VoiceInput.jsx
import { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect } from 'react';

const VoiceInput = ({ onTranscript, disabled = false }) => {
    const { 
        transcript, 
        listening, 
        resetTranscript, 
        browserSupportsSpeechRecognition 
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript && !listening) {
            onTranscript(transcript);
            resetTranscript();
        }
    }, [transcript, listening, onTranscript, resetTranscript]);

    if (!browserSupportsSpeechRecognition) {
        return (
            <span className="text-xs text-zinc-400 dark:text-zinc-500" title="Голосовой ввод не поддерживается">
                🎤❌
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={() => {
                if (listening) {
                    resetTranscript();
                }
            }}
            disabled={disabled}
            className={`p-2 rounded-full transition-all duration-200 ${
                listening 
                    ? 'bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50' 
                    : 'hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={listening ? 'Остановить запись' : 'Голосовой ввод'}
        >
            {listening ? '⏹️' : '🎤'}
        </button>
    );
};

export default VoiceInput;