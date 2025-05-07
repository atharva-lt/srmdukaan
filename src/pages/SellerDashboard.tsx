
import React, { useState, useEffect } from "react";
import { useCustomer } from "@/context/CustomerContext";
import { useRole } from "@/context/RoleContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  fetchAllOrders, 
  updateOrderStatus, 
  fetchOrderDetails, 
  fetchAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer 
} from "@/services/api";
import { OrderSummary, OrderWithItems, Product, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { 
  Check, 
  X, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Store as StoreIcon, 
  Users, 
  PencilIcon, 
  TrashIcon,
  UserPlusIcon
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerDialog } from "@/components/CustomerDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

// Define a helper interface to ensure proper typing for order details
interface OrderItemWithProduct {
  id: string;
  quantity: number;
  price_per_unit: number;
  product: Product;  // This now uses the full Product type from types/index.ts
}

interface TypesafeOrderWithItems {
  summary: OrderSummary | null;
  items: OrderItemWithProduct[];
}

export default function SellerDashboard() {
  const { isAuthenticated } = useCustomer();
  const { userRole } = useRole();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<TypesafeOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  // Customer management state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isDeleteCustomerOpen, setIsDeleteCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { redirect: "/seller" } });
      return;
    }

    if (userRole !== "seller") {
      navigate("/");
      return;
    }

    loadOrders();
    loadCustomers();
  }, [isAuthenticated, navigate, userRole]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await fetchAllCustomers();
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleStatusUpdate = async (orderId: string | null, status: string) => {
    if (!orderId) return;
    
    try {
      setProcessingOrder(orderId);
      const success = await updateOrderStatus(orderId, status);
      
      if (success) {
        toast({
          title: "Status Updated",
          description: `Order has been ${status}`,
          variant: "default",
        });
        
        // Update the order status in the local state
        setOrders(orders.map(order => 
          order.order_id === orderId 
            ? { ...order, order_status: status } 
            : order
        ));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const toggleOrderDetails = async (orderId: string | null) => {
    if (!orderId) return;

    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      setOrderDetails(null);
      return;
    }

    setExpandedOrder(orderId);
    setLoadingDetails(true);

    try {
      const details = await fetchOrderDetails(orderId);
      setOrderDetails(details);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Customer management functions
  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    const newCustomer = await createCustomer(customerData);
    if (newCustomer) {
      loadCustomers(); // Refresh the customer list
    }
  };

  const handleEditCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    if (!selectedCustomer) return;
    
    const updatedCustomer = await updateCustomer(selectedCustomer.id, customerData);
    if (updatedCustomer) {
      loadCustomers(); // Refresh the customer list
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    const success = await deleteCustomer(selectedCustomer.id);
    if (success) {
      loadCustomers(); // Refresh the customer list
    }
  };

  const openEditCustomerDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditCustomerOpen(true);
  };

  const openDeleteCustomerDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteCustomerOpen(true);
  };

  return (
    <div className="container p-8 mx-auto">
      <Card className="mb-6 border-srm-100">
        <CardHeader className="bg-gradient-to-r from-srm-600 to-srm-400 text-white">
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <StoreIcon className="w-6 h-6" />
            NewNormal Dashboard
          </CardTitle>
          <CardDescription className="text-white/80">
            Manage customer orders and inventory
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Dashboard Quick Links */}
        <Card className="border-srm-100 hover:border-srm-300 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-srm-700">Products</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground mb-4">Manage your product inventory, add new products, and update stock levels.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-srm-500 hover:bg-srm-600">
              <Link to="/seller/products">
                Manage Products
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-srm-100 hover:border-srm-300 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-srm-700">Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground mb-4">Review and process customer orders, update order status and shipment tracking.</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => document.getElementById('orders-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Orders
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Customers Section */}
      <Card className="border-srm-100 mb-6" id="customers-section">
        <CardHeader className="pb-3 bg-srm-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-srm-700 flex items-center gap-2">
              <Users className="h-5 w-5 text-srm-500" />
              Customers
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={loadCustomers} 
                disabled={loadingCustomers}
                className="flex items-center gap-2 border-srm-200 text-srm-600"
              >
                <RefreshCw className={`w-4 h-4 ${loadingCustomers ? "animate-spin" : ""}`} />
                {loadingCustomers ? "Loading..." : "Refresh"}
              </Button>
              <Button 
                onClick={() => setIsAddCustomerOpen(true)}
                className="flex items-center gap-2 bg-srm-500 hover:bg-srm-600"
              >
                <UserPlusIcon className="w-4 h-4" />
                Add Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-srm-100">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-srm-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-srm-500" />
                          <span>Loading customers...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="w-8 h-8 text-muted-foreground" />
                          <span>No customers found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-srm-50/50">
                        <TableCell>
                          <Avatar className="h-8 w-8 bg-srm-100">
                            <AvatarFallback className="text-srm-700 text-xs">
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email || "—"}</TableCell>
                        <TableCell>{customer.contact_number || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditCustomerDialog(customer)}
                              className="h-8 w-8 p-0"
                            >
                              <PencilIcon className="h-4 w-4 text-srm-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteCustomerDialog(customer)}
                              className="h-8 w-8 p-0"
                            >
                              <TrashIcon className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Section */}
      <Card className="border-srm-100" id="orders-section">
        <CardHeader className="pb-3 bg-srm-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-srm-700">Orders</CardTitle>
            <Button 
              variant="outline" 
              onClick={loadOrders} 
              disabled={loading}
              className="flex items-center gap-2 border-srm-200 text-srm-600"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-srm-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-srm-50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-srm-500" />
                        <span>Loading orders...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="w-8 h-8 text-muted-foreground" />
                        <span>No orders found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <React.Fragment key={order.order_id}>
                      <TableRow className="group hover:bg-srm-50/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => toggleOrderDetails(order.order_id)}
                          >
                            {expandedOrder === order.order_id ? (
                              <ChevronUp className="h-4 w-4 text-srm-600" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-srm-600" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-srm-700">
                          {order.order_id ? order.order_id.slice(0, 8) + "..." : "N/A"}
                        </TableCell>
                        <TableCell>{order.customer_name || "Unknown"}</TableCell>
                        <TableCell>
                          {order.order_date ? formatDate(new Date(order.order_date)) : "N/A"}
                        </TableCell>
                        <TableCell>
                          ${order.total_amount?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.order_status === "approved"
                                ? "bg-green-100 text-green-800"
                                : order.order_status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.order_status || "pending"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.order_status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.order_id, "approved")}
                                disabled={processingOrder === order.order_id}
                                className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleStatusUpdate(order.order_id, "rejected")}
                                disabled={processingOrder === order.order_id}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {(order.order_status === "approved" || order.order_status === "rejected") && (
                            <span className="text-sm text-muted-foreground">
                              {order.order_status === "approved" ? "Approved" : "Rejected"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedOrder === order.order_id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-srm-50/30 p-0">
                            <div className="p-4">
                              {loadingDetails ? (
                                <div className="flex justify-center p-4">
                                  <RefreshCw className="animate-spin h-6 w-6 text-srm-500" />
                                </div>
                              ) : orderDetails?.items && orderDetails.items.length > 0 ? (
                                <div className="space-y-4">
                                  <h4 className="font-medium text-srm-700">Order Items</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {orderDetails.items.map((item) => (
                                      <div key={item.id} className="flex items-center space-x-3 p-3 border border-srm-100 rounded-md bg-white">
                                        {item.product.image_url && (
                                          <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="w-12 h-12 object-cover rounded-md"
                                          />
                                        )}
                                        <div>
                                          <p className="font-medium text-srm-700">{item.product.name}</p>
                                          <div className="text-sm text-muted-foreground">
                                            {item.quantity} × ${item.price_per_unit.toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-muted-foreground">
                                  No order details available
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Dialog Components */}
      <CustomerDialog
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onSave={handleAddCustomer}
        mode="add"
      />

      <CustomerDialog
        open={isEditCustomerOpen}
        onOpenChange={setIsEditCustomerOpen}
        onSave={handleEditCustomer}
        customer={selectedCustomer}
        mode="edit"
      />

      <DeleteConfirmationDialog
        open={isDeleteCustomerOpen}
        onOpenChange={setIsDeleteCustomerOpen}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        description={`Are you sure you want to delete ${selectedCustomer?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
