import { RawOrderLine } from "../models/order.model";
import { IOrderFilter } from "../interfaces/orders.interface";

export class OrderFilterService implements IOrderFilter {
  applyFilters(orders: RawOrderLine[]): RawOrderLine[] {
    return [...orders];
  }
}
