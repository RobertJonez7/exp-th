import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsStore } from './documents.store';

describe('DocumentsController', () => {
  let moduleRef: TestingModule;
  let controller: DocumentsController;
  let store: DocumentsStore;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [DocumentsService, DocumentsStore],
    }).compile();

    await moduleRef.init();

    controller = moduleRef.get(DocumentsController);
    store = moduleRef.get(DocumentsStore);
  });

  describe('bulkDelete', () => {
    it('reports success when every document is deleted', async () => {
      const result = await controller.bulkDelete({ ids: ['doc-01', 'doc-02'] });

      expect(result).toEqual({ success: true, errors: [] });
      expect(store.all()).toHaveLength(18);
    });

    it('deletes what it can and collects an error per failure', async () => {
      const result = await controller.bulkDelete({ ids: ['doc-01', 'doc-03', 'doc-99', 'doc-02'] });

      expect(result.success).toBe(false);
      expect(result.errors).toEqual([
        'Document: Master Services Agreement — Northwind is locked by priya.raman',
        'Document doc-99 not found',
      ]);
      expect(store.findById('doc-01')).toBeUndefined();
      expect(store.findById('doc-02')).toBeUndefined();
      expect(store.findById('doc-03')).toBeDefined();
    });
  });
});
