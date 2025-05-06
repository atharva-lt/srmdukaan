export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  inventory_count: number | null;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Customer = {
  id: string;
  name: string;
  contact_number: string | null;
  email: string | null;
};

export type Order = {
  id: string;
  customer_id: string | null;
  order_date: string | null;
  status: string | null;
  total_amount: number;
};

export type OrderItem = {
  id: string;
  order_id: string | null;
  product_id: string | null;
  quantity: number;
  price_per_unit: number;
};

export type Payment = {
  id: string;
  order_id: string | null;
  payment_method: string | null;
  amount: number | null;
  payment_date: string | null;
  status: string | null;
};

export type Shipment = {
  id: string;
  order_id: string | null;
  shipment_date: string | null;
  status: string | null;
  tracking_number: string | null;
  address: string;
};

export type OrderSummary = {
  order_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  order_date: string | null;
  status: string | null;
  order_status?: string | null; // Making this optional since it's not in the DB
  payment_status?: string | null; // Making this optional since it's not in the DB
  total_amount: number | null;
  shipment_status: string | null;
  tracking_number: string | null;
  shipping_address?: string | null;
};

export type UserRole = "consumer" | "seller";

export type OrderWithItems = {
  summary: OrderSummary | null;
  items: Array<{
    id: string;
    quantity: number;
    price_per_unit: number;
    product: Product;
  }>;
};
