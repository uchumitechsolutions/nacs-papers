import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  cartCount: number;
  onCartToggle: () => void;
}

function UserAuthButton() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-gray-200 animate-pulse rounded h-10 w-24"></div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="default"
          className="bg-kenyan-green text-white hover:bg-green-700"
          data-testid="button-account"
          onClick={() => window.location.href = '/account'}
        >
          <User className="w-4 h-4 mr-2" />
          My Account
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await fetch('/api/logout', { method: 'POST' });
              window.location.href = '/';
            } catch (error) {
              console.error('Logout failed:', error);
            }
          }}
          data-testid="button-logout-nav"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      className="bg-kenyan-green text-white hover:bg-green-700"
      data-testid="button-login"
      onClick={() => window.location.href = '/auth'}
    >
      <User className="w-4 h-4 mr-2" />
      Login
    </Button>
  );
}

export default function Navigation({ cartCount, onCartToggle }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/browse", label: "Past Papers", active: location === "/browse" },
    { href: "#about", label: "About", active: false },
    { href: "#contact", label: "Contact", active: false },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl sm:text-2xl font-bold text-kenyan-green" data-testid="logo">
                  Nacs Consortium
                </h1>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        link.active
                          ? "text-kenyan-green"
                          : "text-gray-600 hover:text-kenyan-green"
                      }`}
                      data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onCartToggle}
              className="relative p-2 text-gray-600 hover:text-kenyan-green transition-colors"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-warm-orange text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center"
                  data-testid="text-cart-count"
                >
                  {cartCount}
                </span>
              )}
            </button>
            
            <UserAuthButton />
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t" data-testid="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`block px-3 py-2 font-medium cursor-pointer ${
                    link.active
                      ? "text-kenyan-green"
                      : "text-gray-600"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
