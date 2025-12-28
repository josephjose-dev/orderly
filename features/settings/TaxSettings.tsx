import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTaxConfig } from '../../hooks/useTaxConfig';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { TaxLine } from '../../types';

export const TaxSettings: React.FC = () => {
    const { user } = useAuth();
    const { taxConfig, addTax, updateTax, deleteTax } = useTaxConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTax, setEditingTax] = useState<TaxLine | null>(null);

    // Form State
    const [formData, setFormData] = useState<Omit<TaxLine, 'id' | 'enabled'>>({
        name: '',
        rate: 5,
        mode: 'fixed'
    });

    // Guard: Only allow admins
    if (user?.role === 'staff') {
        return (
            <div className="p-12 text-center text-gray-500">
                You do not have permission to view tax settings.
            </div>
        );
    }

    const openAddModal = () => {
        setEditingTax(null);
        setFormData({ name: '', rate: 5, mode: 'fixed' });
        setIsModalOpen(true);
    };

    const openEditModal = (tax: TaxLine) => {
        setEditingTax(tax);
        setFormData({ name: tax.name, rate: tax.rate, mode: tax.mode });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name.trim()) return alert("Name is required");
        if (formData.rate < 0) return alert("Rate cannot be negative");

        if (editingTax) {
            updateTax(editingTax.id, formData);
        } else {
            addTax({
                ...formData,
                enabled: true
            });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Tax Configuration</h2>
                    <p className="text-gray-500 mt-1">Configure tax lines applied to your orders and invoices.</p>
                </div>
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tax
                </Button>
            </div>

            {/* Tax List */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                {taxConfig.taxes.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <p>No taxes configured.</p>
                        <Button variant="outline" className="mt-4" onClick={openAddModal}>Create your first tax</Button>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs font-black uppercase text-gray-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Rate</th>
                                <th className="px-6 py-4">Mode</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {taxConfig.taxes.map(tax => (
                                <tr key={tax.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={tax.enabled}
                                                onChange={(e) => updateTax(tax.id, { enabled: e.target.checked })}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{tax.name}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{tax.rate}%</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${tax.mode === 'fixed' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                            }`}>
                                            {tax.mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(tax)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this tax?')) deleteTax(tax.id);
                                                }}
                                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Preview Area */}
            {taxConfig.taxes.some(t => t.enabled) && (
                <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200">
                    <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Calculated Preview (Sample $1,000)</h3>
                    <div className="bg-white p-4 rounded-xl border shadow-sm max-w-sm mx-auto space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">$1,000.00</span>
                        </div>
                        {taxConfig.taxes.filter(t => t.enabled).map(t => (
                            <div key={t.id} className="flex justify-between text-sm text-gray-600">
                                <span>{t.name} ({t.rate}%)</span>
                                <span>${(1000 * t.rate / 100).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-black text-lg mt-2">
                            <span>Total</span>
                            <span>${(1000 + taxConfig.taxes.filter(t => t.enabled).reduce((sum, t) => sum + (1000 * t.rate / 100), 0)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Config Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <h3 className="text-xl font-black text-gray-900 mb-6">
                            {editingTax ? 'Edit Tax' : 'New Tax Line'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tax Name</label>
                                <input
                                    autoFocus
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
                                    placeholder="e.g. City Tax"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Rate (%)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
                                    placeholder="0"
                                    value={formData.rate}
                                    onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Calculation Mode</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setFormData({ ...formData, mode: 'fixed' })}
                                        className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${formData.mode === 'fixed' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                    >
                                        Fixed Rate
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, mode: 'editable' })}
                                        className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${formData.mode === 'editable' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                    >
                                        Editable
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {formData.mode === 'fixed' ? 'Always applies this exact rate.' : 'Default rate, but distinct per invoice.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleSave}>Save Tax</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
