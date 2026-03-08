import { Router } from 'express';
import {
  getRootItems,
  getChildren,
  createItem,
  deleteItem,
  deleteItems,
  searchItems,
} from '../controllers/itemsController';

export const itemsRouter = Router();

itemsRouter.get('/search', searchItems);
itemsRouter.get('/', getRootItems);
itemsRouter.get('/:id/children', getChildren);
itemsRouter.post('/', createItem);
itemsRouter.delete('/', deleteItems);
itemsRouter.delete('/:id', deleteItem);
