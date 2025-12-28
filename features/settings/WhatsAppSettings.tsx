import React from 'react';
import { useWhatsAppSettings } from '../../hooks/useWhatsAppSettings';
import { Button } from '../../components/ui/Button';
import { MessageCircle, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const WhatsAppSettings: React.FC = () => {
    const { settings, updateSettings, dailyCount, limit } = useWhatsAppSettings();
    const [activeTemplate, setActiveTemplate] = React.useState<'templateCreate' | 'templateComplete' | 'templateInvoice'>('templateCreate');

    // Local state for editing to avoid lag
    const [tempText, setTempText] = React.useState(settings[activeTemplate] || '');

    // Sync when tab changes or settings load
    React.useEffect(() => {
        setTempText(settings[activeTemplate] || '');
    }, [activeTemplate, settings]);

    const handleSave = () => {
        updateSettings({ [activeTemplate]: tempText });
        // Visual feedback could be added here
    };

    const variables = {
        templateCreate: ['{{customerName}}', '{{orderId}}', '{{total}}', '{{businessName}}', '{{itemsCount}}'],
        templateComplete: ['{{customerName}}', '{{orderId}}', '{{businessName}}'],
        templateInvoice: ['{{customerName}}', '{{invoiceNumber}}', '{{total}}', '{{businessName}}', '{{link}}']
    };

    const getReadableName = (key: string) => {
        switch (key) {
            case 'templateCreate': return 'Order Confirmation';
            case 'templateComplete': return 'Ready for Pickup';
            case 'templateInvoice': return 'Invoice Sent';
            default: return key;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black dark:text-white tracking-tight">WhatsApp Automation</h1>
                    <p className="text-gray-500 font-medium">Configure automatic message templates for your customers.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-bold text-sm">
                        {dailyCount} / {limit} Daily Messages Used
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* SIdebar */}
                <div className="w-full lg:w-64 space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-2">Triggers</label>
                    <button
                        onClick={() => setActiveTemplate('templateCreate')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTemplate === 'templateCreate' ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        Order Confirmation
                    </button>
                    <button
                        onClick={() => setActiveTemplate('templateComplete')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTemplate === 'templateComplete' ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        Ready for Pickup
                    </button>
                    <button
                        onClick={() => setActiveTemplate('templateInvoice')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTemplate === 'templateInvoice' ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        Invoice Sent
                    </button>
                </div>

                {/* Editor */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black capitalize">{getReadableName(activeTemplate)} Template</h3>
                        <Button onClick={handleSave} size="sm" className="rounded-xl">
                            <Save className="h-4 w-4 mr-2" />
                            Save Template
                        </Button>
                    </div>

                    <div className="relative">
                        <textarea
                            className="w-full h-64 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white transition-all resize-none text-base leading-relaxed"
                            value={tempText}
                            onChange={(e) => setTempText(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-bold pointer-events-none">
                            Preview
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-xs font-black uppercase text-gray-400 mb-3">Available Variables</p>
                        <div className="flex flex-wrap gap-2">
                            {variables[activeTemplate].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setTempText(prev => prev + ' ' + v)}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors"
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        <p>Messages will be opened in WhatsApp Web/App. You must click "Send" in WhatsApp to verify dispatch.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
