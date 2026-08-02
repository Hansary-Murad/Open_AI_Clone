// src/components/FileUpload.jsx
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';

const FileUpload = ({ onFileContent, disabled = false }) => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
            'text/markdown': ['.md'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: disabled || uploading,
        onDrop: async (files) => {
            const file = files[0];
            setFileName(file.name);
            setUploading(true);

            try {
                let text = '';
                
                if (file.type === 'application/pdf') {
                    text = await file.text();
                } else {
                    text = await file.text();
                }

                if (text.length > 10000) {
                    text = text.slice(0, 10000) + '\n\n... (текст обрезан)';
                }

                onFileContent(text);
            } catch (error) {
                console.error('❌ Ошибка чтения файла:', error);
                onFileContent('❌ Не удалось прочитать файл');
            } finally {
                setUploading(false);
            }
        },
        onDropRejected: (fileRejections) => {
            const error = fileRejections[0]?.errors[0]?.message || 'Ошибка загрузки';
            onFileContent(`❌ ${error}`);
        },
    });

    return (
        <div className="relative">
            <div
                {...getRootProps()}
                className={`
                    cursor-pointer p-2 rounded-xl transition-all duration-200
                    ${isDragActive ? 'bg-emerald-500/20 scale-105' : ''}
                    ${uploading ? 'opacity-50 cursor-wait' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title="Загрузить файл"
            >
                <input {...getInputProps()} />
                {uploading ? '⏳' : '📎'}
            </div>

            {/* Имя загруженного файла */}
            {fileName && !uploading && (
                <div className="absolute bottom-full left-0 mb-1 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded whitespace-nowrap border border-zinc-300 dark:border-zinc-700">
                    📄 {fileName}
                </div>
            )}
        </div>
    );
};

export default FileUpload;