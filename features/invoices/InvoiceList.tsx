
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { useInvoices } from './useInvoices';
import { useInvoiceExporter } from './useInvoiceExporter';
import { useWhatsAppNotifications } from '../../features/whatsapp/useWhatsAppNotifications';
import { formatCurrency, getStatusColor } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { FileText, FileSpreadsheet, Download, Search, Filter, Plus, Trash2, AlertTriangle, Send } from 'lucide-react'; // Removed Eye
import { InputModal } from '../../components/ui/InputModal';
import { InvoiceSettingsToggle } from './InvoiceSettingsToggle';
import { WhatsAppSettingsModal } from './WhatsAppSettingsModal';
import { MessageCircle } from 'lucide-react';

export const InvoiceList: React.FC = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { invoices, deleteInvoice } = useInvoices();
  const { downloadInvoice } = useInvoiceExporter(); // Removed viewInvoice usage
  const { sendInvoice } = useWhatsAppNotifications();

  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [isWhatsAppSettingsOpen, setIsWhatsAppSettingsOpen] = useState(false);

  const currency = organization.currency;

  // Role Check
  const isAdmin = user?.role === 'admin';

  const handleDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete);
      setInvoiceToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Auto-generated invoices for <span className="text-primary font-bold">{organization.name}</span>.
          </p>
        </div>
        <div>
          {/* FORCE RENDER TOGGLE IF ADMIN */}
          {/* FORCE RENDER TOGGLE IF ADMIN */}
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsWhatsAppSettingsOpen(true)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                WhatsApp
              </button>
              <InvoiceSettingsToggle />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-50 dark:border-gray-800">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer / Period</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No invoices generated yet.</p>
                    <p className="text-xs text-gray-400 mt-2">Go to Orders &gt; Invoices to generate one.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${inv.format === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {inv.format === 'pdf' ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                        </div>
                        <div>
                          <span className="block text-sm font-bold dark:text-white">{inv.invoiceNumber}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{inv.format}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black dark:text-white">{inv.customerName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{inv.periodLabel}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium dark:text-gray-400">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-black dark:text-white">
                      {formatCurrency(inv.totalAmount, currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => downloadInvoice(inv)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const phone = (inv.snapshot && inv.snapshot.length > 0) ? inv.snapshot[0].whatsappNumber : '';
                            // Construct a virtual order to satisfy the hook's signature
                            const virtualOrder: any = {
                              id: inv.invoiceNumber.replace('INV-', ''),
                              customerName: inv.customerName,
                              total: inv.totalAmount,
                              whatsappNumber: phone,
                              items: [] // Not used in invoice template
                            };
                            sendInvoice(virtualOrder);
                          }}
                          className="p-2 text-gray-400 hover:text-[#25D366] transition-colors"
                          title="Send via WhatsApp"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setInvoiceToDelete(inv.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete (Admin Only)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InputModal
        isOpen={Boolean(invoiceToDelete)}
        title="Delete Invoice?"
        description="This invoice is a financial record. Deleting it cannot be undone."
        fields={[]}
        onSubmit={handleDelete}
        onCancel={() => setInvoiceToDelete(null)}
        submitLabel="Delete Invoice"
        variant="danger"
      />
      <WhatsAppSettingsModal
        isOpen={isWhatsAppSettingsOpen}
        onClose={() => setIsWhatsAppSettingsOpen(false)}
      />
    </div>
  );
};
