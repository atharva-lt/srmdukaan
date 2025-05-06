
import React, { useState, useEffect } from "react";
import { useCustomer } from "@/context/CustomerContext";
import { useRole } from "@/context/RoleContext";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus, fetchOrderDetails } from "@/services/api";
import { OrderSummary, OrderWithItems } from "@/types";
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
import { Check, X, RefreshCw, ChevronDown, ChevronUp, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SellerDashboard() {
  const { isAuthenticated } = useCustomer();
  const { userRole } = useRole();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  return (
    <div className="container p-8 mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6" />
            Seller Dashboard
          </CardTitle>
          <CardDescription>
            Manage customer orders and inventory
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Orders</CardTitle>
            <Button 
              variant="outline" 
              onClick={loadOrders} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
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
                        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
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
                      <TableRow className="group hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => toggleOrderDetails(order.order_id)}
                          >
                            {expandedOrder === order.order_id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
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
                          <TableCell colSpan={7} className="bg-muted/30 p-0">
                            <div className="p-4">
                              {loadingDetails ? (
                                <div className="flex justify-center p-4">
                                  <RefreshCw className="animate-spin h-6 w-6 text-primary" />
                                </div>
                              ) : orderDetails?.items && orderDetails.items.length > 0 ? (
                                <div className="space-y-4">
                                  <h4 className="font-medium">Order Items</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {orderDetails.items.map((item) => (
                                      <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-md bg-white">
                                        {item.product.image_url && (
                                          <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="w-12 h-12 object-cover rounded-md"
                                          />
                                        )}
                                        <div>
                                          <p className="font-medium">{item.product.name}</p>
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
    </div>
  );
}
