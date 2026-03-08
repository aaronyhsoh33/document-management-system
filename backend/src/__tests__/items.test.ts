import request from 'supertest';
import app from '../app';
import { prismaMock, mockItem, mockDocument } from '../__mocks__/prisma';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/items', () => {
  it('returns root items with pagination', async () => {
    prismaMock.item.findMany.mockResolvedValue([mockItem]);
    prismaMock.item.count.mockResolvedValue(1);

    const res = await request(app).get('/api/items');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
  });

  it('respects page and limit query params', async () => {
    prismaMock.item.findMany.mockResolvedValue([]);
    prismaMock.item.count.mockResolvedValue(0);

    const res = await request(app).get('/api/items?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(prismaMock.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });
});

describe('GET /api/items/:id/children', () => {
  it('returns children of a folder', async () => {
    prismaMock.item.findUnique.mockResolvedValue(mockItem);
    prismaMock.item.findMany.mockResolvedValue([mockDocument]);
    prismaMock.item.count.mockResolvedValue(1);

    const res = await request(app).get('/api/items/1/children');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.parent).toBeDefined();
  });

  it('returns 404 for non-existent folder', async () => {
    prismaMock.item.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/items/999/children');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Folder not found');
  });

  it('returns 400 if item is not a folder', async () => {
    prismaMock.item.findUnique.mockResolvedValue(mockDocument);

    const res = await request(app).get('/api/items/2/children');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Item is not a folder');
  });
});

describe('POST /api/items', () => {
  it('creates a folder', async () => {
    prismaMock.item.findUnique.mockResolvedValue(null);
    prismaMock.item.create.mockResolvedValue(mockItem);

    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test Folder', type: 'folder', createdBy: 'John Green' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Folder');
    expect(res.body.type).toBe('folder');
  });

  it('creates a document', async () => {
    prismaMock.item.create.mockResolvedValue(mockDocument);

    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Report.pdf', type: 'document', mimeType: 'application/pdf', createdBy: 'John Green' });

    expect(res.status).toBe(201);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ type: 'folder', createdBy: 'John Green' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name is required');
  });

  it('returns 400 when type is invalid', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test', type: 'invalid', createdBy: 'John Green' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Type must be folder or document');
  });

  it('returns 400 when mimeType missing for document', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Doc', type: 'document', createdBy: 'John Green' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('mimeType is required for documents');
  });

  it('returns 400 when createdBy is missing', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test', type: 'folder' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('createdBy is required');
  });
});

describe('DELETE /api/items/:id', () => {
  it('deletes an item and returns 204', async () => {
    prismaMock.item.findUnique.mockResolvedValue(mockItem);
    prismaMock.item.delete.mockResolvedValue(mockItem);

    const res = await request(app).delete('/api/items/1');

    expect(res.status).toBe(204);
  });

  it('returns 404 for non-existent item', async () => {
    prismaMock.item.findUnique.mockResolvedValue(null);

    const res = await request(app).delete('/api/items/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });
});

describe('GET /api/items/search', () => {
  it('returns matching items', async () => {
    prismaMock.item.findMany.mockResolvedValue([mockItem]);

    const res = await request(app).get('/api/items/search?q=Test');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it('returns empty array for blank query', async () => {
    const res = await request(app).get('/api/items/search?q=');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});
