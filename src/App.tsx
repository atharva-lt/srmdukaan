
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import Account from "./pages/Account";
import SellerDashboard from "./pages/SellerDashboard";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import { CustomerProvider } from "./context/CustomerContext";
import { RoleProvider } from "./context/RoleContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CustomerProvider>
        <RoleProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/thankyou/:orderId" element={<ThankYou />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </BrowserRouter>
          </CartProvider>
        </RoleProvider>
      </CustomerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
