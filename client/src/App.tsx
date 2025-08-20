import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Navigation from "@/components/navigation";
import ShoppingCart from "@/components/shopping-cart";
import PaymentModal from "@/components/payment-modal";
import Home from "@/pages/home";
import Browse from "@/pages/browse";
import Admin from "@/pages/admin";
import Account from "@/pages/account";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";

export interface CartItem {
  id: string;
  title: string;
  grade: string;
  price: number;
}

function Router() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  return (
    <>
      <Navigation 
        cartCount={cart.length}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
      />
      
      <ShoppingCart
        items={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsPaymentModalOpen(true);
        }}
        total={cartTotal}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={cartTotal}
        cartItems={cart}
        onPaymentSuccess={clearCart}
      />

      <Switch>
        <Route path="/" component={() => <Home onAddToCart={addToCart} />} />
        <Route path="/browse" component={() => <Browse onAddToCart={addToCart} />} />
        <Route path="/account" component={Account} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
