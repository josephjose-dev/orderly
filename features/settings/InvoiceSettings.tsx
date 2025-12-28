import React, { useRef } from 'react';
import { useInvoiceSettings } from '../../hooks/useInvoiceSettings';
import type { InvoiceSettings } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { X, Upload, RotateCcw } from 'lucide-react';

interface InvoiceSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InvoiceSettingsModal: React.FC<InvoiceSettingsProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { settings, updateSettings, resetSettings } = useInvoiceSettings();
    const [localSettings, setLocalSettings] = React.useState<InvoiceSettings>(settings);
    const [isSaving, setIsSaving] = React.useState(false);

    // Sync when opening
    React.useEffect(() => {
        if (isOpen) {
            setLocalSettings(settings);
        }
    }, [isOpen, settings]);

    if (!isOpen) return null;
    if (user?.role !== 'admin') return null;

    const handleChange = (field: keyof InvoiceSettings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (field: 'logoUrl' | 'signatureUrl', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB
            alert("File is too large. Max 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            handleChange(field, result);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate network delay for UX
        setTimeout(() => {
            updateSettings(localSettings);
            setIsSaving(false);
            onClose();
        }, 500);
    };

    const handleReset = () => {
        if (confirm("Reset all invoice settings to defaults?")) {
            resetSettings();
            setLocalSettings(settings); // Settings will update via hook, but safer to sync
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex justify-end">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Invoice Settings</h2>
                        <p className="text-sm text-gray-500">Customize your invoice appearance.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* SECTION: BRANDING */}
                    <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4 border-b pb-2">Branding</h3>

                        {/* Logo */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Business Logo</label>
                            <div className="flex items-center gap-4">
                                {localSettings.logoUrl ? (
                                    <div className="relative group">
                                        <img src={localSettings.logoUrl} alt="Logo" className="h-16 w-16 object-contain border rounded-lg" />
                                        <button
                                            onClick={() => handleChange('logoUrl', '')}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={(e) => handleImageUpload('logoUrl', e)}
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Max 2MB. PNG/JPG.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: BUSINESS INFO */}
                    <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4 border-b pb-2">Business Info</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    value={localSettings.companyName}
                                    onChange={(e) => handleChange('companyName', e.target.value)}
                                    placeholder="e.g. My Awesome Shop"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <textarea
                                    value={localSettings.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Full business address..."
                                    rows={3}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={localSettings.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+123..."
                                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tax ID / GST</label>
                                    <input
                                        type="text"
                                        value={localSettings.taxId}
                                        onChange={(e) => handleChange('taxId', e.target.value)}
                                        placeholder="Optional"
                                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={localSettings.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="invoices@example.com"
                                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: TEMPLATE & FINANCIALS */}
                    <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4 border-b pb-2">Templates & Financials</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Brand Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={localSettings.primaryColor || '#2563eb'}
                                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                                        className="h-10 w-10 p-1 rounded cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-500 uppercase">{localSettings.primaryColor || '#2563eb'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={localSettings.taxRate ?? 0}
                                        onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Due Date (+Days)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={localSettings.dueDateDays ?? 14}
                                        onChange={(e) => handleChange('dueDateDays', parseInt(e.target.value) || 0)}
                                        placeholder="14"
                                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: CONTENT */}
                    <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4 border-b pb-2">Invoice Content</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Invoice Title</label>
                                <input
                                    type="text"
                                    value={localSettings.invoiceTitle}
                                    onChange={(e) => handleChange('invoiceTitle', e.target.value)}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Footer Note</label>
                                <input
                                    type="text"
                                    value={localSettings.footerNote}
                                    onChange={(e) => handleChange('footerNote', e.target.value)}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions</label>
                                <textarea
                                    value={localSettings.termsText}
                                    onChange={(e) => handleChange('termsText', e.target.value)}
                                    placeholder="Payment due within 14 days..."
                                    rows={2}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: DISPLAY */}
                    <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4 border-b pb-2">Display Options</h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={localSettings.showOrderIds}
                                    onChange={(e) => handleChange('showOrderIds', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Show Order IDs</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={localSettings.showCustomerName}
                                    onChange={(e) => handleChange('showCustomerName', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Show Customer Names</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={localSettings.showNotes}
                                    onChange={(e) => handleChange('showNotes', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Show Notes</span>
                            </label>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">Digital Signature</label>
                        <div className="flex items-center gap-4">
                            {localSettings.signatureUrl ? (
                                <div className="relative group">
                                    <img src={localSettings.signatureUrl} alt="Sig" className="h-12 object-contain border rounded-lg" />
                                    <button
                                        onClick={() => handleChange('signatureUrl', '')}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="h-12 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                                    <span className="text-[10px]">Sign</span>
                                </div>
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={(e) => handleImageUpload('signatureUrl', e)}
                                    className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 mt-6 border-t border-gray-100 flex justify-between items-center gap-4">
                    <button
                        onClick={handleReset}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                    >
                        <RotateCcw className="h-3 w-3" /> Reset Defaults
                    </button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
