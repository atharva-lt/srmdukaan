
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogOut, Store, Menu, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { totalItems } = useCart();
  const { customer, isAuthenticated, setCustomer } = useCustomer();
  const { userRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setCustomer(null);
    toast({
      title: "Logged out",
      description: "You've been logged out successfully."
    });
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={`sticky top-0 z-50 w-full bg-white ${isScrolled ? 'shadow-md' : 'border-b border-gray-200'} transition-shadow`}>
      <div className="container mx-auto">
        {/* Top bar with contact info */}
        <div className="hidden md:flex items-center justify-between text-xs py-2 border-b border-gray-100">
          <div className="flex items-center space-x-6">
            <span>Customer Support: +1 (555) 123-4567</span>
            <span>Free Shipping on Orders over $50</span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <span>Hello, {customer?.name?.split(' ')[0] || customer?.name}</span>
            ) : (
              <Link to="/login" className="text-primary hover:underline">Sign In / Register</Link>
            )}
          </div>
        </div>
        
        {/* Main navbar */}
        <div className="flex items-center justify-between h-16 px-4 md:px-0">
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col h-full">
                  <Link to="/" className="text-xl font-bold text-primary py-4">
                    QuickOrderVerse
                  </Link>
                  <nav className="flex flex-col space-y-4 py-8">
                    <Link to="/" className="hover:text-primary transition-colors">
                      Home
                    </Link>
                    <Link to="/cart" className="hover:text-primary transition-colors">
                      Cart
                    </Link>
                    {isAuthenticated && (
                      <>
                        <Link to="/account" className="hover:text-primary transition-colors">
                          My Account
                        </Link>
                        {userRole === "seller" && (
                          <Link to="/seller" className="hover:text-primary transition-colors">
                            Seller Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="text-left hover:text-primary transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    )}
                    {!isAuthenticated && (
                      <Link to="/login" className="hover:text-primary transition-colors">
                        Login / Register
                      </Link>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary transition-transform hover:scale-105">
            QuickOrderVerse
          </Link>

          {/* Search bar - desktop */}
          <form className="hidden md:flex items-center max-w-md w-full mx-4" onSubmit={handleSearch}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="default" className="ml-2">
              Search
            </Button>
          </form>

          {/* User actions */}
          <div className="flex items-center space-x-1 md:space-x-4">
            {isAuthenticated && (
              <div className="hidden md:block">
                <RoleToggle />
              </div>
            )}
            
            {isAuthenticated && userRole === "seller" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/seller">
                      <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1.5">
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
              <div className="flex items-center space-x-1 md:space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/account">
                        <Button variant="ghost" size="icon">
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
              <div className="hidden md:block">
                <Link to="/login">
                  <Button variant="outline" className="hover:bg-primary/10 hover:text-primary">
                    Login / Register
                  </Button>
                </Link>
              </div>
            )}
            
            {userRole === "consumer" && (
              <Link to="/cart" className="relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ShoppingCart className="w-5 h-5" />
                        {totalItems > 0 && (
                          <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                            {totalItems}
                          </Badge>
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
        
        {/* Navigation menu - desktop */}
        <nav className="hidden md:flex items-center justify-center h-12 border-t border-gray-100 text-sm font-medium">
          <Link to="/" className="px-4 h-full flex items-center hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/?category=Electronics" className="px-4 h-full flex items-center hover:text-primary transition-colors">
            Electronics
          </Link>
          <Link to="/?category=Clothing" className="px-4 h-full flex items-center hover:text-primary transition-colors">
            Clothing
          </Link>
          <Link to="/?category=Footwear" className="px-4 h-full flex items-center hover:text-primary transition-colors">
            Footwear
          </Link>
          <Link to="/?category=Kitchen" className="px-4 h-full flex items-center hover:text-primary transition-colors">
            Kitchen
          </Link>
          <Link to="/?category=Fitness" className="px-4 h-full flex items-center hover:text-primary transition-colors">
            Fitness
          </Link>
        </nav>
        
        {/* Mobile search bar */}
        <form 
          className="md:hidden flex items-center p-3 border-t border-gray-100" 
          onSubmit={handleSearch}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="default" size="sm" className="ml-2">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
