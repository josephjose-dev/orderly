import React from 'react';
import { Button } from '../../components/ui/Button';
import { MessageCircle, CheckCircle, Home } from 'lucide-react';
import { Order } from '../../types';
import { useWhatsAppNotifications } from '../whatsapp/useWhatsAppNotifications';

interface OrderConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ isOpen, onClose, order }) => {
    const { sendOrderConfirmation } = useWhatsAppNotifications();

    if (!isOpen || !order) return null;

    const handleSend = () => {
        sendOrderConfirmation(order);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 text-center">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
                <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>

                <h2 className="text-2xl font-black mb-2">Order Confirmed!</h2>
                <p className="text-gray-500 font-medium mb-8">
                    Order #{order.id.slice(0, 8)} for <span className="text-gray-900 font-bold">{order.customerName}</span> has been created.
                </p>

                <div className="space-y-3">
                    <Button onClick={handleSend} size="lg" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl shadow-green-200 py-6 text-lg rounded-2xl">
                        <MessageCircle className="h-6 w-6 mr-2" />
                        Send Confirmation
                    </Button>
                    <Button onClick={onClose} variant="outline" className="w-full py-6 rounded-2xl border-2 font-bold text-gray-500 hover:text-gray-900">
                        <Home className="h-5 w-5 mr-2" /> Return to Home
                    </Button>
                </div>
            </div>
        </div>
    );
};
