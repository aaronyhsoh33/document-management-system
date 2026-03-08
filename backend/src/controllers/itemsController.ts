import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getRootItems(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) === 'desc' ? 'desc' : 'asc';
    const skip = (page - 1) * limit;

    const validSortFields = ['name', 'createdAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: { parentId: null },
        orderBy: [{ type: 'asc' }, { [sortField]: order }],
        skip,
        take: limit,
      }),
      prisma.item.count({ where: { parentId: null } }),
    ]);

    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function getChildren(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = parseInt(req.params.id as string);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) === 'desc' ? 'desc' : 'asc';
    const skip = (page - 1) * limit;

    const validSortFields = ['name', 'createdAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';

    const parent = await prisma.item.findUnique({ where: { id: parentId } });
    if (!parent) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }
    if (parent.type !== 'folder') {
      res.status(400).json({ error: 'Item is not a folder' });
      return;
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: { parentId },
        orderBy: [{ type: 'asc' }, { [sortField]: order }],
        skip,
        take: limit,
      }),
      prisma.item.count({ where: { parentId } }),
    ]);

    res.json({ items, total, page, limit, parent });
  } catch (err) {
    next(err);
  }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, type, parentId, mimeType, size, createdBy } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (name.trim().length > 255) {
      res.status(400).json({ error: 'Name must be 255 characters or fewer' });
      return;
    }
    if (type !== 'folder' && type !== 'document') {
      res.status(400).json({ error: 'Type must be folder or document' });
      return;
    }
    if (!createdBy || typeof createdBy !== 'string') {
      res.status(400).json({ error: 'createdBy is required' });
      return;
    }
    if (type === 'document' && !mimeType) {
      res.status(400).json({ error: 'mimeType is required for documents' });
      return;
    }

    if (parentId != null) {
      const parent = await prisma.item.findUnique({ where: { id: parentId } });
      if (!parent) {
        res.status(404).json({ error: 'Parent folder not found' });
        return;
      }
      if (parent.type !== 'folder') {
        res.status(400).json({ error: 'Parent must be a folder' });
        return;
      }
    }

    const duplicate = await prisma.item.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        type,
        parentId: parentId ?? null,
      },
    });
    if (duplicate) {
      const label = type === 'folder' ? 'folder' : 'file';
      res.status(409).json({ error: `A ${label} with this name already exists` });
      return;
    }

    const item = await prisma.item.create({
      data: {
        name: name.trim(),
        type,
        parentId: parentId ?? null,
        mimeType: type === 'document' ? mimeType : null,
        size: type === 'document' ? (size ?? null) : null,
        createdBy,
      },
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    await prisma.item.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function deleteItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids must be a non-empty array' });
      return;
    }

    const numericIds = ids.map(Number).filter((id) => !isNaN(id));
    if (numericIds.length === 0) {
      res.status(400).json({ error: 'ids must be numeric' });
      return;
    }

    await prisma.item.deleteMany({ where: { id: { in: numericIds } } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function searchItems(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) || '';
    if (q.trim() === '') {
      res.json({ items: [] });
      return;
    }

    const items = await prisma.item.findMany({
      where: {
        name: { contains: q.trim(), mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}
