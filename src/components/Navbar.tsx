
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
import RoleToggle from "@/components/RoleToggle";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar() {
  const { totalItems } = useCart();
  const { customer, isAuthenticated, setCustomer } = useCustomer();
  const { userRole } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCustomer(null);
    toast({
      title: "Logged out",
      description: "You've been logged out successfully."
    });
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <Link to="/" className="text-2xl font-bold text-primary transition-transform hover:scale-105">
          QuickOrderVerse
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <RoleToggle />
          )}
          
          {isAuthenticated && userRole === "seller" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/seller">
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage Orders</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                Hello, {customer?.name?.split(' ')[0] || customer?.name}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/account">
                      <Button variant="ghost" size="icon" aria-label="Account">
                        <User className="w-5 h-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Account</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Logout"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="hover:bg-primary/10 hover:text-primary">Login / Register</Button>
            </Link>
          )}
          {userRole === "consumer" && (
            <Link to="/cart" className="relative">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Shopping Cart">
                      <ShoppingCart className="w-5 h-5" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs text-white bg-primary rounded-full">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Cart {totalItems > 0 ? `(${totalItems})` : ""}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
