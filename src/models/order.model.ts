export interface Product {
  product_id: number;
  value: string;
}

export interface Order {
  order_id: number;
  total: string;
  date: string;
  products: Product[];
}

export interface UserOrders {
  user_id: number;
  name: string;
  orders: Order[];
}

export interface RawOrderLine {
  user_id: number;
  name: string;
  order_id: number;
  product_id: number;
  value: string;
  date: string;
}

export interface OrderFilters {
  order_id?: number;
  start_date?: string;
  end_date?: string;
}