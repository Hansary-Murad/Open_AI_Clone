// src/components/TagSelector.jsx
import { useState } from 'react';

const DEFAULT_TAGS = [
    { id: 'programming', label: '💻 Программирование', color: 'blue' },
    { id: 'education', label: '📚 Образование', color: 'purple' },
    { id: 'creative', label: '🎨 Творчество', color: 'pink' },
    { id: 'science', label: '🔬 Наука', color: 'green' },
    { id: 'business', label: '💼 Бизнес', color: 'amber' },
    { id: 'health', label: '🏥 Здоровье', color: 'red' },
    { id: 'tech', label: '⚡ Технологии', color: 'indigo' },
    { id: 'lifestyle', label: '🌿 Лайфстайл', color: 'emerald' },
];

const TagSelector = ({ 
    onSelect, 
    selectedTags = [], 
    multiple = false,
    tags = DEFAULT_TAGS,
    className = '',
}) => {
    const [selected, setSelected] = useState(selectedTags);

    const handleSelect = (tagId) => {
        let newSelected;
        
        if (multiple) {
            if (selected.includes(tagId)) {
                newSelected = selected.filter(id => id !== tagId);
            } else {
                newSelected = [...selected, tagId];
            }
        } else {
            newSelected = selected.includes(tagId) ? [] : [tagId];
        }
        
        setSelected(newSelected);
        onSelect(newSelected);
    };

    const isSelected = (tagId) => selected.includes(tagId);

    const colorClasses = {
        blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30 border-blue-500/30',
        purple: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-500/30 border-purple-500/30',
        pink: 'bg-pink-500/20 text-pink-700 dark:text-pink-400 hover:bg-pink-500/30 border-pink-500/30',
        green: 'bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30 border-green-500/30',
        amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 border-amber-500/30',
        red: 'bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30 border-red-500/30',
        indigo: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/30 border-indigo-500/30',
        emerald: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30',
    };

    const getColorClass = (color) => {
        return colorClasses[color] || colorClasses.blue;
    };

    return (
        <div className={`flex gap-1.5 flex-wrap ${className}`}>
            {tags.map((tag) => (
                <button
                    key={tag.id}
                    onClick={() => handleSelect(tag.id)}
                    className={`
                        text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-medium
                        border border-transparent
                        ${isSelected(tag.id) 
                            ? getColorClass(tag.color) + ' ring-2 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900'
                            : 'bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }
                    `}
                >
                    {tag.label}
                    {isSelected(tag.id) && ' ✓'}
                </button>
            ))}
        </div>
    );
};

export default TagSelector;