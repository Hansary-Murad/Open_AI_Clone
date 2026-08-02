// src/utils/exportChat.js
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Для таблиц

// Экспорт в TXT
export const exportAsTXT = (messages, fileName = 'chat') => {
    const text = messages.map(m => {
        const role = m.role === 'user' ? '👤 ВЫ' : '🤖 AI';
        const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : '';
        return `[${role}]${time ? ` (${time})` : ''}\n${m.content}\n`;
    }).join('\n---\n\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Экспорт в PDF
export const exportAsPDF = (messages, fileName = 'chat') => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    // Заголовок
    doc.setFontSize(18);
    doc.setTextColor('#059669');
    doc.text('Murad AI - История чата', margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.text(`Дата: ${new Date().toLocaleString()}`, margin, y);
    y += 10;
    doc.text(`Сообщений: ${messages.length}`, margin, y);
    y += 15;

    // Сообщения
    messages.forEach((msg, index) => {
        // Проверяем, нужно ли добавить новую страницу
        if (y > pageHeight - 30) {
            doc.addPage();
            y = margin;
        }

        const isUser = msg.role === 'user';
        
        // Роль
        doc.setFontSize(12);
        doc.setTextColor(isUser ? '#2563EB' : '#059669');
        const roleLabel = isUser ? '👤 ВЫ' : '🤖 AI';
        doc.text(roleLabel, margin, y);
        y += 6;

        // Время
        if (msg.timestamp) {
            doc.setFontSize(8);
            doc.setTextColor('#999999');
            const time = new Date(msg.timestamp).toLocaleTimeString();
            doc.text(time, margin + 25, y - 2);
        }

        // Содержание
        doc.setFontSize(10);
        doc.setTextColor('#1a1a1a');
        const lines = doc.splitTextToSize(msg.content, maxWidth);
        
        // Проверяем, помещается ли текст
        if (y + lines.length * 5 > pageHeight - 20) {
            doc.addPage();
            y = margin;
            // Повторяем заголовок на новой странице
            doc.text(isUser ? '👤 ВЫ (продолжение)' : '🤖 AI (продолжение)', margin, y);
            y += 6;
        }

        // Рисуем фон для сообщения
        doc.setFillColor(isUser ? '#EFF6FF' : '#F0FDF4');
        doc.roundedRect(margin - 5, y - 3, maxWidth + 10, lines.length * 5 + 6, 3, 3, 'F');

        doc.text(lines, margin, y + 4);
        y += lines.length * 5 + 10;

        // Разделитель между сообщениями
        if (index < messages.length - 1) {
            doc.setDrawColor('#E5E7EB');
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;
        }
    });

    // Нумерация страниц
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor('#999999');
        doc.text(`Страница ${i} из ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`${fileName}-${Date.now()}.pdf`);
};

// Экспорт в JSON
export const exportAsJSON = (messages, fileName = 'chat') => {
    const data = {
        exportedAt: new Date().toISOString(),
        totalMessages: messages.length,
        messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
        })),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Экспорт в HTML
export const exportAsHTML = (messages, fileName = 'chat') => {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Murad AI - История чата</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #fafafa; }
        .message { padding: 12px 16px; margin: 8px 0; border-radius: 12px; }
        .user { background: #dbeafe; text-align: right; }
        .ai { background: #d1fae5; }
        .role { font-weight: bold; font-size: 14px; }
        .time { color: #666; font-size: 12px; }
        .content { margin-top: 4px; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 20px; }
        .header h1 { color: #059669; margin: 0; }
        .header p { color: #666; margin: 4px 0; }
        .separator { border-top: 1px solid #e5e7eb; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Murad AI - История чата</h1>
        <p>Дата экспорта: ${new Date().toLocaleString()}</p>
        <p>Всего сообщений: ${messages.length}</p>
    </div>
    ${messages.map(m => `
        <div class="message ${m.role === 'user' ? 'user' : 'ai'}">
            <div class="role">${m.role === 'user' ? '👤 ВЫ' : '🤖 AI'}</div>
            ${m.timestamp ? `<div class="time">${new Date(m.timestamp).toLocaleString()}</div>` : ''}
            <div class="content">${m.content}</div>
        </div>
    `).join('')}
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Экспорт с выбором формата
export const exportChat = (messages, format = 'txt', fileName = 'chat') => {
    switch (format) {
        case 'txt':
            exportAsTXT(messages, fileName);
            break;
        case 'pdf':
            exportAsPDF(messages, fileName);
            break;
        case 'json':
            exportAsJSON(messages, fileName);
            break;
        case 'html':
            exportAsHTML(messages, fileName);
            break;
        default:
            throw new Error(`Неизвестный формат: ${format}`);
    }
};