
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { Order } from '../types';

const INVOICE_EXPORT_LIMIT_BETA = 4;
const INVOICE_EXPORT_LIMIT_FREE = 2;

function getInvoiceStorageKey(orgId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `invoice_exports:${orgId}:${year}-${month}`;
}

function getExportCount(storageKey: string): number {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return 0;
    try {
        const data = JSON.parse(stored);
        return data.count || 0;
    } catch {
        return 0;
    }
}

export function useInvoiceExporter() {
    const { user, isEarlyAccess } = useAuth();
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const storageKey = user ? getInvoiceStorageKey(user.organizationId) : '';
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (storageKey) {
            setCount(getExportCount(storageKey));
        }
    }, [storageKey]);

    const isPro = user?.subscriptionPlan === 'pro';
    const limit = isEarlyAccess ? INVOICE_EXPORT_LIMIT_BETA : (isPro ? Infinity : INVOICE_EXPORT_LIMIT_FREE);
    const canExport = isPro || count < limit;

    const incrementCount = () => {
        const newCount = count + 1;
        setCount(newCount);
        localStorage.setItem(storageKey, JSON.stringify({ count: newCount }));
    };

    const exportInvoice = useCallback(async (orders: Order[], includeCancelled: boolean) => {
        if (!canExport || !user) {
            setError("Cannot export invoice. Limit reached or user not found.");
            return;
        }

        const filteredOrders = orders.filter(o => includeCancelled || o.status !== 'cancelled');

        if (filteredOrders.length === 0) {
            alert("No orders in the selected range to export.");
            return;
        }
        
        setIsExporting(true);
        setError(null);

        try {
            // Dynamic imports
            const ExcelJS = (await import('exceljs')).default;
            const FileSaver = (await import('file-saver')).default;

            // Full excel generation logic
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Invoice', {
                views: [{ showGridLines: false }]
            });

            // --- STYLING ---
            const titleFont = { name: 'Arial Black', size: 24, bold: true };
            const headerFont = { name: 'Arial', size: 10, bold: true };
            const subheaderFont = { name: 'Arial', size: 10 };
            const tableHeaderFont = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
            const cellFont = { name: 'Arial', size: 10 };
            const totalFont = { name: 'Arial', size: 12, bold: true };
            const footerFont = { name: 'Arial', size: 8 };

            const tableHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } } as ExcelJS.Fill;

            // --- HEADER ---
            sheet.mergeCells('A1:C2');
            const titleCell = sheet.getCell('A1');
            titleCell.value = user.organizationName || 'Your Business';
            titleCell.font = titleFont;
            titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

            sheet.getCell('H1').value = 'INVOICE';
            sheet.getCell('H1').font = { ...titleFont, size: 20 };
            sheet.getCell('H1').alignment = { horizontal: 'right' };

            const invoiceNum = `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(3, '0')}`;
            sheet.getCell('H2').value = invoiceNum;
            sheet.getCell('H2').font = subheaderFont;
            sheet.getCell('H2').alignment = { horizontal: 'right' };

            sheet.getCell('A4').value = 'Invoice Date:';
            sheet.getCell('A4').font = headerFont;
            sheet.getCell('B4').value = new Date().toLocaleDateString();
            sheet.getCell('B4').font = subheaderFont;
            
            // This is a simplification; a real implementation would get this from the filter UI
            const period = `Orders from the selected period`;
            sheet.getCell('A5').value = 'Period Covered:';
            sheet.getCell('A5').font = headerFont;
            sheet.getCell('B5').value = period;
            sheet.getCell('B5').font = subheaderFont;

            // --- TABLE ---
            const tableStartRow = 8;
            const columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Order ID', key: 'orderId', width: 20 },
                { header: 'Customer', key: 'customer', width: 20 },
                { header: 'WhatsApp', key: 'whatsapp', width: 18 },
                { header: 'Items', key: 'items', width: 40 },
                { header: 'Notes', key: 'notes', width: 25 },
                { header: 'Status', key: 'status', width: 12 },
                { header: 'Amount', key: 'amount', width: 15 },
            ];
            sheet.columns = columns;

            const headerRow = sheet.getRow(tableStartRow);
            headerRow.eachCell(cell => {
                cell.font = tableHeaderFont;
                cell.fill = tableHeaderFill;
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });
            
            let subtotal = 0;
            filteredOrders.forEach(order => {
                const itemsFormatted = order.items
                    .map(item => `${item.productName}${item.selectedOptionLabel ? ` (${item.selectedOptionLabel})` : ''} × ${item.quantity}`)
                    .join('; ');

                sheet.addRow({
                    date: new Date(order.createdAt).toLocaleDateString(),
                    orderId: order.id,
                    customer: order.customerName,
                    whatsapp: order.whatsappNumber,
                    items: itemsFormatted,
                    notes: order.note || '',
                    status: order.status,
                    amount: {
                        formula: order.total.toFixed(2),
                        result: order.total,
                        format: '#,##0.00'
                    }
                });
                subtotal += order.total;
            });
            
            // Style table rows
            for (let i = tableStartRow + 1; i <= sheet.rowCount; i++) {
                const row = sheet.getRow(i);
                row.eachCell(cell => {
                    cell.font = cellFont;
                    cell.alignment = { vertical: 'middle', wrapText: true };
                });
                row.getCell('H').numFmt = `"${user.currency}" #,##0.00`;
            }


            // --- FOOTER ---
            const footerStartRow = sheet.rowCount + 2;
            sheet.mergeCells(`G${footerStartRow}:H${footerStartRow}`);
            const subtotalLabel = sheet.getCell(`F${footerStartRow}`);
            subtotalLabel.value = 'Subtotal';
            subtotalLabel.alignment = { horizontal: 'right' };
            sheet.getCell(`H${footerStartRow}`).value = subtotal;
            sheet.getCell(`H${footerStartRow}`).numFmt = `"${user.currency}" #,##0.00`;

            const taxRow = footerStartRow + 1;
            sheet.mergeCells(`G${taxRow}:H${taxRow}`);
            const taxLabel = sheet.getCell(`F${taxRow}`);
            taxLabel.value = 'Tax (0%)';
            taxLabel.alignment = { horizontal: 'right' };
            sheet.getCell(`H${taxRow}`).value = 0;
            sheet.getCell(`H${taxRow}`).numFmt = `"${user.currency}" #,##0.00`;
            
            const totalRow = footerStartRow + 2;
            sheet.mergeCells(`G${totalRow}:H${totalRow}`);
            const totalLabel = sheet.getCell(`F${totalRow}`);
            totalLabel.value = 'Grand Total';
            totalLabel.font = totalFont;
            totalLabel.alignment = { horizontal: 'right' };
            const totalCell = sheet.getCell(`H${totalRow}`);
            totalCell.value = subtotal; // since tax is 0
            totalCell.font = totalFont;
            totalCell.numFmt = `"${user.currency}" #,##0.00`;

            const generatedRow = sheet.rowCount + 3;
            sheet.mergeCells(`A${generatedRow}:H${generatedRow}`);
            sheet.getCell(`A${generatedRow}`).value = `Generated on ${new Date().toLocaleString()} by Orderly`;
            sheet.getCell(`A${generatedRow}`).font = footerFont;
            sheet.getCell(`A${generatedRow}`).alignment = { horizontal: 'right' };

            // --- SAVE FILE ---
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            FileSaver.saveAs(blob, `Orderly-Invoice-${invoiceNum}.xlsx`);


            incrementCount();
        } catch (e) {
            console.error("Failed to export invoice:", e);
            setError("An unexpected error occurred during export.");
        } finally {
            setIsExporting(false);
        }
    }, [canExport, user, storageKey, count]);

    return {
        isExporting,
        error,
        canExport,
        count,
        limit,
        exportInvoice,
        plan: user?.subscriptionPlan,
        isEarlyAccess
    };
}
