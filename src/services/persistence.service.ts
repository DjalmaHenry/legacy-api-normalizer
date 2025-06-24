import Database from '../database/database';
import { UserOrders } from '../models/order.model';
import { IPersistenceService } from '../interfaces/persistence.interface';

export class PersistenceService implements IPersistenceService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  public persistData(data: UserOrders[]): void {
    try {
      data.forEach((user) => {
        this.db.insertUser(user.user_id, user.name);

        user.orders.forEach((order) => {
          this.db.insertOrder(order.order_id, user.user_id, order.total, order.date);

          this.db.clearProductsForOrder(order.order_id);

          order.products.forEach((product) => {
            this.db.insertProduct(order.order_id, product.product_id, product.value);
          });
        });
      });

      console.log('Dados persistidos com sucesso no SQLite');
    } catch (error) {
      console.error('Erro ao persistir dados no SQLite:', error);
      throw error;
    }
  }
}
