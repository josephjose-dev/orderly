import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface Field {
    key: string;
    label: string;
    type: string;
    placeholder?: string;
    initialValue?: string;
}

interface InputModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    fields: Field[];
    onSubmit: (values: Record<string, string>) => void;
    onCancel: () => void;
    submitLabel?: string;
    variant?: 'default' | 'danger';
}

export const InputModal: React.FC<InputModalProps> = ({
    isOpen,
    title,
    description,
    fields,
    onSubmit,
    onCancel,
    submitLabel = 'Confirm',
    variant = 'default'
}) => {
    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            const initial: Record<string, string> = {};
            fields.forEach(f => {
                initial[f.key] = f.initialValue || '';
            });
            setValues(initial);
        }
    }, [isOpen, fields]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black dark:text-white">{title}</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {description && (
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {description}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(field => (
                        <div key={field.key} className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">
                                {field.label}
                            </label>
                            <input
                                autoFocus={fields[0].key === field.key}
                                type={field.type}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                                placeholder={field.placeholder}
                                value={values[field.key] || ''}
                                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                required
                            />
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="rounded-2xl px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className={`rounded-2xl px-8 ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                        >
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
