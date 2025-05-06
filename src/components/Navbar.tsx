
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
import RoleToggle from "@/components/RoleToggle";

export default function Navbar() {
  const { totalItems } = useCart();
  const { customer, isAuthenticated, setCustomer } = useCustomer();
  const { userRole } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCustomer(null);
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <Link to="/" className="text-2xl font-bold text-primary">
          QuickOrderVerse
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <RoleToggle />
          )}
          
          {isAuthenticated && userRole === "seller" && (
            <Link to="/seller">
              <Button variant="outline" size="sm">
                <Store className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                Hello, {customer?.name}
              </span>
              <Link to="/account">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Logout"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline">Login / Register</Button>
            </Link>
          )}
          {userRole === "consumer" && (
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Shopping Cart">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-primary rounded-full">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
