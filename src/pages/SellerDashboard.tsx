
import React, { useState, useEffect } from "react";
import { useCustomer } from "@/context/CustomerContext";
import { useRole } from "@/context/RoleContext";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus } from "@/services/api";
import { OrderSummary } from "@/types";
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

export default function SellerDashboard() {
  const { isAuthenticated } = useCustomer();
  const { userRole } = useRole();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

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
          description: `Order ${orderId.slice(0, 8)}... has been ${status}`,
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
    } finally {
      setProcessingOrder(null);
    }
  };

  return (
    <div className="container p-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Seller Dashboard</h1>
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Orders</h2>
          <Button variant="outline" onClick={loadOrders} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={6} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.order_id}>
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
                      className={`px-2 py-1 text-xs rounded-full ${
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
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(order.order_id, "rejected")}
                          disabled={processingOrder === order.order_id}
                        >
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
