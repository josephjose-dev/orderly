import React from 'react';
import { useWhatsAppSettings } from '../../hooks/useWhatsAppSettings';
import { Button } from '../../components/ui/Button';
import { X, MessageCircle, Save, RotateCcw } from 'lucide-react';

interface WhatsAppSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateSettings, resetDefaults, limit } = useWhatsAppSettings();
    const [localSettings, setLocalSettings] = React.useState(settings);

    // Derived
    const dailyCount = settings.dailyCount;

    React.useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    if (!isOpen) return null;

    const handleChange = (key: keyof typeof settings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        updateSettings(localSettings);
        onClose();
    };

    const TemplateInput = ({ label, field, placeholder }: { label: string, field: 'templateCreate' | 'templateComplete' | 'templateInvoice', placeholder: string }) => (
        <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400">{label}</label>
            <textarea
                className="w-full border rounded-xl px-4 py-3 text-sm h-24 resize-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                value={localSettings[field]}
                onChange={e => handleChange(field, e.target.value)}
                placeholder={placeholder}
            />
            <p className="text-[10px] text-gray-400">
                Variables: {'{{customerName}}'}, {'{{orderId}}'}, {'{{total}}'}, {'{{businessName}}'}
            </p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-green-600 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">WhatsApp Automation</h2>
                            <p className="text-green-100 text-xs font-medium opacity-90">Auto-send updates to customers</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8 flex-1">

                    {/* Status & Limits */}
                    <div className="bg-gray-50 p-4 rounded-2xl border flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <div className={`w-3 h-3 rounded-full ${localSettings.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="font-bold text-sm">Notifications Enabled</span>
                        </div>
                        <div className="text-xs font-black bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                            Daily Limit: <span className={dailyCount >= limit ? 'text-red-500' : 'text-green-600'}>{dailyCount} / {limit}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* 1. Order Confirmation */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg">Order Confirmation</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={localSettings.sendOnCreate} onChange={e => handleChange('sendOnCreate', e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                            <TemplateInput
                                label="Message Template"
                                field="templateCreate"
                                placeholder="Hi {{customerName}}..."
                            />
                        </div>

                        {/* 2. Order Ready */}
                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg">Ready for Pickup</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={localSettings.sendOnComplete} onChange={e => handleChange('sendOnComplete', e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                            <TemplateInput
                                label="Message Template"
                                field="templateComplete"
                                placeholder="Good news {{customerName}}..."
                            />
                        </div>

                        {/* 3. Invoice */}
                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg">Invoice Message</h3>
                            </div>
                            <TemplateInput
                                label="Message Template"
                                field="templateInvoice"
                                placeholder="Here is your invoice..."
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-between">
                    <Button variant="outline" onClick={resetDefaults} className="text-gray-400 hover:text-gray-600">
                        <RotateCcw className="h-4 w-4 mr-2" /> Reset Defaults
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                            <Save className="h-4 w-4 mr-2" /> Save Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
