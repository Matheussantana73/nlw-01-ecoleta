import connection from "../database/connection";
import { Request, Response } from "express";

class PointersControllers{
  async index(req: Request, res: Response) {

    const {items, city, uf} = req.query;

    const parsedItems = String(items).split(',').map(item => Number(item.trim()));

    const points = await connection('points')
      .join('point_items', 'point_items.point_id', '=', 'points.id')
      .whereIn('point_items.item_id', parsedItems)
      .where('points.city', String(city))
      .where('points.uf', String(uf))
      .select('points.*')
      .distinct();

    const serealizedPoints = points.map(point => {
      return {
        ...point,
        url_image: `http://192.168.0.104:8000/uploads/${point.image}`
      }
    });

    return res.json(serealizedPoints);
  }

  async show(req: Request, res: Response) {

    const { id } = req.params;
    const  pointer = await connection('points').select('*').where('id', id).first();

    if (!pointer) {
      return res.status(400).json({message: 'Point not found.'})
    }
    
    const items = await connection('items')
      .join('point_items', 'point_items.item_id', '=', 'items.id')
      .select('items.id', 'items.title')
      .where('point_id', id);

    const serealizedPointer ={
      ...pointer,
      url_image: `http://192.168.0.104:8000/uploads/${pointer.image}`
      
    };

   return res.json({pointer: serealizedPointer, items});
  }

  async create(req: Request, res: Response){
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;
    const trx = await connection.transaction();

    const pointer = {
      name,
      image: req.file.filename,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedPointsIds = await trx('points').insert(pointer);

    const point_id = insertedPointsIds[0];

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
      return {
        point_id,
        item_id,
      }
    });

    await trx('point_items').insert(pointItems);
    trx.commit();
    return res.json({id: point_id ,...pointer});
  }

}

export default PointersControllers;