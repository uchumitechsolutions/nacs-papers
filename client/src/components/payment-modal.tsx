import { useState } from "react";
import { X, Lock, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CartItem } from "@/App";
import { PAYMENT_METHODS } from "@/lib/constants";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  cartItems: CartItem[];
  onPaymentSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  total,
  cartItems,
  onPaymentSuccess
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // M-Pesa specific fields
  const [phoneNumber, setPhoneNumber] = useState("");

  // Visa specific fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = async () => {
    if (!paymentMethod || !email) {
      toast({
        title: "Missing Information",
        description: "Please select a payment method and enter your email.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === PAYMENT_METHODS.MPESA && !phoneNumber) {
      toast({
        title: "Missing Phone Number",
        description: "Please enter your M-Pesa phone number.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === PAYMENT_METHODS.VISA && (!cardNumber || !expiryDate || !cvv)) {
      toast({
        title: "Missing Card Information",
        description: "Please enter your card details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Process payment based on method
      let paymentResponse;
      if (paymentMethod === PAYMENT_METHODS.MPESA) {
        paymentResponse = await apiRequest("POST", "/api/payments/mpesa", {
          phoneNumber,
          amount: total
        });
      } else {
        paymentResponse = await apiRequest("POST", "/api/payments/visa", {
          cardNumber,
          expiryDate,
          cvv,
          amount: total
        });
      }

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Record the sale
        await apiRequest("POST", "/api/sales", {
          customerEmail: email,
          paperIds: cartItems.map(item => item.id),
          totalAmount: total,
          paymentMethod
        });

        toast({
          title: "Payment Successful!",
          description: "Your past papers have been sent to your email.",
        });

        onPaymentSuccess();
        onClose();
        resetForm();
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPaymentMethod("");
    setEmail("");
    setPhoneNumber("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" data-testid="payment-modal">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" data-testid="text-payment-title">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              data-testid="button-close-payment"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span>Subtotal:</span>
              <span data-testid="text-subtotal">KSh {total}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-kenyan-green" data-testid="text-total">KSh {total}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Choose Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-green-50">
                <input
                  type="radio"
                  name="payment"
                  value={PAYMENT_METHODS.MPESA}
                  checked={paymentMethod === PAYMENT_METHODS.MPESA}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-kenyan-green focus:ring-kenyan-green"
                  data-testid="radio-mpesa"
                />
                <div className="ml-3 flex items-center">
                  <div className="w-8 h-8 bg-kenyan-green rounded flex items-center justify-center mr-3">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">M-Pesa</div>
                    <div className="text-sm text-gray-600">Pay with your M-Pesa account</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50">
                <input
                  type="radio"
                  name="payment"
                  value={PAYMENT_METHODS.VISA}
                  checked={paymentMethod === PAYMENT_METHODS.VISA}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                  data-testid="radio-visa"
                />
                <div className="ml-3 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Visa/MasterCard</div>
                    <div className="text-sm text-gray-600">Pay with your credit/debit card</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* M-Pesa specific fields */}
          {paymentMethod === PAYMENT_METHODS.MPESA && (
            <div className="mb-6">
              <Label htmlFor="phone" className="text-sm font-medium">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="254XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-2"
                data-testid="input-phone"
              />
            </div>
          )}

          {/* Visa specific fields */}
          {paymentMethod === PAYMENT_METHODS.VISA && (
            <div className="mb-6 space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-2"
                  data-testid="input-card-number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry" className="text-sm font-medium">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-2"
                    data-testid="input-expiry"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="mt-2"
                    data-testid="input-cvv"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <Label htmlFor="email" className="text-sm font-medium">Email for PDF Delivery</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
              data-testid="input-email"
            />
          </div>
          
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-kenyan-green text-white hover:bg-green-700 font-semibold"
            data-testid="button-pay"
          >
            <Lock className="w-4 h-4 mr-2" />
            {isProcessing ? "Processing..." : "Complete Secure Payment"}
          </Button>
          
          <p className="text-xs text-gray-600 text-center mt-4">
            Your payment is secured with 256-bit SSL encryption. Past papers will be delivered to your email within 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
