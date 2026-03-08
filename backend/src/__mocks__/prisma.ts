const mockItem = {
  id: 1,
  name: 'Test Folder',
  type: 'folder' as const,
  parentId: null,
  mimeType: null,
  size: null,
  createdBy: 'John Green',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockDocument = {
  id: 2,
  name: 'Report.pdf',
  type: 'document' as const,
  parentId: null,
  mimeType: 'application/pdf',
  size: 1024,
  createdBy: 'John Green',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const prismaMock = {
  item: {
    findMany: jest.fn().mockResolvedValue([mockItem]),
    count: jest.fn().mockResolvedValue(1),
    findUnique: jest.fn().mockResolvedValue(mockItem),
    create: jest.fn().mockResolvedValue(mockItem),
    delete: jest.fn().mockResolvedValue(mockItem),
  },
};

export { mockItem, mockDocument };
export default prismaMock;
