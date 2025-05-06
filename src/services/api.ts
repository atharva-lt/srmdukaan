
import { supabase } from "@/integrations/supabase/client";
import { Product, Customer, Order, OrderItem, CartItem } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Product related functions
export async function fetchProducts() {
  try {
    const { data, error } = await supabase.from("product").select("*");
    
    if (error) {
      throw error;
    }
    
    return data as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    toast({
      title: "Error",
      description: "Failed to fetch products",
      variant: "destructive",
    });
    return [];
  }
}

export async function fetchProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to fetch product details",
      variant: "destructive",
    });
    return null;
  }
}

export async function fetchProductsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("category", category);
    
    if (error) {
      throw error;
    }
    
    return data as Product[];
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    toast({
      title: "Error",
      description: "Failed to fetch products by category",
      variant: "destructive",
    });
    return [];
  }
}

// Order related functions
export async function createOrder(
  customer_id: string,
  cartItems: CartItem[],
  address: string
) {
  try {
    // Calculate total amount
    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_id,
          total_amount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsToInsert = cartItems.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_per_unit: item.product.price,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_item")
      .insert(orderItemsToInsert);

    if (orderItemsError) throw orderItemsError;

    // Create payment record
    const { error: paymentError } = await supabase
      .from("payment")
      .insert([
        {
          order_id: orderData.id,
          amount: total_amount,
          status: "pending",
          payment_method: "Credit Card", // Default method
        },
      ]);

    if (paymentError) throw paymentError;

    // Create shipment record
    const { error: shipmentError } = await supabase
      .from("shipment")
      .insert([
        {
          order_id: orderData.id,
          status: "processing",
          address,
          tracking_number: `TRK-${Math.floor(Math.random() * 1000000)}`,
        },
      ]);

    if (shipmentError) throw shipmentError;

    return orderData;
  } catch (error) {
    console.error("Error creating order:", error);
    toast({
      title: "Error",
      description: "Failed to create order",
      variant: "destructive",
    });
    return null;
  }
}

export async function fetchCustomerOrders(customerId: string) {
  try {
    const { data, error } = await supabase
      .from("order_summary")
      .select("*");

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error);
    toast({
      title: "Error",
      description: "Failed to fetch your orders",
      variant: "destructive",
    });
    return [];
  }
}

export async function registerCustomer(
  name: string,
  email: string,
  contactNumber: string
) {
  try {
    // Check if customer exists with this email
    const { data: existingCustomer } = await supabase
      .from("customer")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingCustomer) {
      return existingCustomer as Customer;
    }

    // Create new customer
    const { data, error } = await supabase
      .from("customer")
      .insert([
        {
          name,
          email,
          contact_number: contactNumber,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Customer;
  } catch (error) {
    console.error("Error registering customer:", error);
    toast({
      title: "Error",
      description: "Failed to register customer",
      variant: "destructive",
    });
    return null;
  }
}

// Order management functions for sellers
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    toast({
      title: "Error", 
      description: "Failed to update order status",
      variant: "destructive",
    });
    return false;
  }
}

export async function fetchAllOrders() {
  try {
    const { data, error } = await supabase
      .from("order_summary")
      .select("*")
      .order("order_date", { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast({
      title: "Error",
      description: "Failed to fetch orders",
      variant: "destructive",
    });
    return [];
  }
}

export async function fetchOrderDetails(orderId: string) {
  try {
    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_item")
      .select(`
        id,
        quantity,
        price_per_unit,
        product:product_id (
          id,
          name,
          price,
          image_url
        )
      `)
      .eq("order_id", orderId);
    
    if (itemsError) throw itemsError;
    
    // Fetch order summary
    const { data: orderSummary, error: summaryError } = await supabase
      .from("order_summary")
      .select("*")
      .eq("order_id", orderId)
      .single();
      
    if (summaryError) throw summaryError;
    
    return {
      summary: orderSummary,
      items: orderItems,
    };
  } catch (error) {
    console.error(`Error fetching order details for ${orderId}:`, error);
    toast({
      title: "Error",
      description: "Failed to fetch order details",
      variant: "destructive",
    });
    return { summary: null, items: [] };
  }
}
