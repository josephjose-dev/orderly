import { OrderItem, TaxConfig, Order } from '../types';

/**
 * Calculate tax amount based on subtotal and tax rate
 * @param subtotal - Order subtotal (sum of items)
 * @param taxRate - Percentage (e.g., 18 for 18%)
 * @returns Tax amount rounded to 2 decimals
 */
export function calculateTaxAmount(subtotal: number, taxRate: number): number {
    if (taxRate <= 0) return 0;
    // Use a small epsilon for better floating point handling if needed, 
    // but for basic currency 2 decimals is standard.
    return Number((subtotal * (taxRate / 100)).toFixed(2));
}

/**
 * Calculate order totals with tax
 * @param items - Order items
 * @param taxConfig - Business tax configuration
 * @param customTaxRate - Optional: Override rate for editable mode
 * @param discount - Optional discount amount
 * @returns Complete order amounts
 */
export function calculateOrderTotals(
    items: OrderItem[],
    taxConfig: TaxConfig,
    customTaxRate?: number, // @deprecated: Legacy support or specific overrides if needed in future
    discount: number = 0
) {
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity); // Note: item.price is unit price
    }, 0);

    // Calculate Taxes
    const activeTaxes = taxConfig.taxes.filter(t => t.enabled);
    let totalTaxAmount = 0;

    const taxSnapshots = activeTaxes.map(tax => {
        const amount = calculateTaxAmount(subtotal, tax.rate);
        totalTaxAmount += amount;
        return {
            id: tax.id,
            name: tax.name,
            rate: tax.rate,
            amount: amount
        };
    });

    // Calculate total
    // Total = Subtotal + Total Tax - Discount
    const total = subtotal + totalTaxAmount - discount;

    return {
        subtotal: Number(subtotal.toFixed(2)),
        taxSnapshots,
        taxAmount: Number(totalTaxAmount.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        total: Number(total.toFixed(2))
    };
}

/**
 * Calculate invoice summary from multiple orders
 * @param orders - Array of orders in date range
 * @returns Aggregated summary with totals and tax breakdown
 */
export function calculateInvoiceSummary(orders: Order[]) {
    const initialSummary = {
        totalOrders: 0,
        subtotal: 0,
        taxAmount: 0,
        discount: 0,
        grandTotal: 0,
        taxBreakdown: {} as Record<string, number>
    };

    const summary = orders.reduce((acc, order) => {
        // Graceful fallback for legacy orders without new fields
        const ordSubtotal = order.subtotal || order.total; // Fallback to total if subtotal missing
        const ordTaxAmount = order.taxAmount || 0;
        const ordDiscount = order.discount || 0;
        const ordTotal = order.total;

        // Aggregate Tax Breakdown
        if (order.taxSnapshots) {
            order.taxSnapshots.forEach(snap => {
                const current = acc.taxBreakdown[snap.name] || 0;
                acc.taxBreakdown[snap.name] = current + snap.amount;
            });
        } else if (ordTaxAmount > 0) {
            // Legacy fallback: if taxAmount exists but no snapshots, put it under "Tax"
            const name = (order as any).taxName || "Tax";
            const current = acc.taxBreakdown[name] || 0;
            acc.taxBreakdown[name] = current + ordTaxAmount;
        }

        return {
            totalOrders: acc.totalOrders + 1,
            subtotal: acc.subtotal + ordSubtotal,
            taxAmount: acc.taxAmount + ordTaxAmount,
            discount: acc.discount + ordDiscount,
            grandTotal: acc.grandTotal + ordTotal,
            taxBreakdown: acc.taxBreakdown
        };
    }, initialSummary);

    // Round all values
    return {
        totalOrders: summary.totalOrders,
        subtotal: Number(summary.subtotal.toFixed(2)),
        taxAmount: Number(summary.taxAmount.toFixed(2)),
        discount: Number(summary.discount.toFixed(2)),
        grandTotal: Number(summary.grandTotal.toFixed(2)),
        taxBreakdown: summary.taxBreakdown // Map of Tax Name -> Total Amount
    };
}
