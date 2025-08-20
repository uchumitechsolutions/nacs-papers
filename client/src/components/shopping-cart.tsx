import { X, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/App";

interface ShoppingCartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  total: number;
}

export default function ShoppingCart({
  items,
  isOpen,
  onClose,
  onRemoveItem,
  onCheckout,
  total
}: ShoppingCartProps) {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      data-testid="shopping-cart"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold" data-testid="text-cart-title">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            data-testid="button-close-cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag className="w-16 h-16 mb-4" />
              <p data-testid="text-empty-cart">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center space-x-4 pb-4 border-b"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
                    alt="Past paper thumbnail"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium" data-testid={`text-item-title-${item.id}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600" data-testid={`text-item-grade-${item.id}`}>
                      {item.grade}
                    </p>
                    <p className="text-kenyan-green font-semibold" data-testid={`text-item-price-${item.id}`}>
                      KSh {item.price}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="border-t p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-kenyan-green" data-testid="text-cart-total">
                KSh {total}
              </span>
            </div>
            <Button
              onClick={onCheckout}
              className="w-full bg-kenyan-green text-white hover:bg-green-700 mb-3"
              data-testid="button-checkout"
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              data-testid="button-continue-shopping"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
