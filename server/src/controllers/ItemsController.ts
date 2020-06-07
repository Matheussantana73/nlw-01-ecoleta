import connection from "../database/connection";
import { Request, Response } from "express";

class ItemsController {

  async index(req: Request, res: Response) {
    const items = await connection('items').select('*');

    const serealizedItems = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        url_image: `http://192.168.0.104:8000/uploads/${item.image}`
      }
    });
    return res.json(serealizedItems);
  }
}

export default ItemsController;