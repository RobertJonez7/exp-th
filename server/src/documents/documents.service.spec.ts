import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { DocumentsStore } from './documents.store';

describe('DocumentsService', () => {
  let moduleRef: TestingModule;
  let service: DocumentsService;
  let store: DocumentsStore;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [DocumentsService, DocumentsStore],
    }).compile();

    await moduleRef.init();

    service = moduleRef.get(DocumentsService);
    store = moduleRef.get(DocumentsStore);
  });

  it('returns the full list of documents', async () => {
    const documents = await service.findAll();

    expect(documents).toHaveLength(20);
    expect(documents[0]).toMatchObject({ id: 'doc-01', title: 'Q3 Vendor Agreement' });
  });

  it('creates a document with the given title', async () => {
    const created = await service.create('Renewal Terms — Acme');

    expect(created.title).toBe('Renewal Terms — Acme');
    expect(created.lockedBy).toBeNull();
    expect(created.id).toBeTruthy();
  });

  it('lists a newly created document first', async () => {
    const created = await service.create('Renewal Terms — Acme');
    const documents = await service.findAll();

    expect(documents).toHaveLength(21);
    expect(documents[0]).toEqual(created);
  });

  it('deletes an unlocked document', async () => {
    await service.delete('doc-01');

    expect(store.findById('doc-01')).toBeUndefined();
    expect(store.all()).toHaveLength(19);
  });

  it('removes a deleted document from the list', async () => {
    await service.delete('doc-01');
    const documents = await service.findAll();

    expect(documents).toHaveLength(19);
    expect(documents.find((doc) => doc.id === 'doc-01')).toBeUndefined();
  });

  it('refuses to delete a locked document, naming it by title', async () => {
    const result = service.delete('doc-03');

    await expect(result).rejects.toThrow(ConflictException);
    await expect(result).rejects.toThrow(
      'Document: Master Services Agreement — Northwind is locked by priya.raman',
    );
    expect(store.findById('doc-03')).toBeDefined();
  });

  it('throws when deleting a missing document', async () => {
    await expect(service.delete('doc-99')).rejects.toThrow(NotFoundException);
  });

  it('locks an unlocked document', async () => {
    const doc = store.findById('doc-01')!;
    const updated = await service.update('doc-01', { ...doc, lockedBy: 'robert' });

    expect(updated.lockedBy).toBe('robert');
    expect(store.findById('doc-01')?.lockedBy).toBe('robert');
    expect((await service.findAll()).find((d) => d.id === 'doc-01')?.lockedBy).toBe('robert');
  });

  it('unlocks a locked document', async () => {
    const doc = store.findById('doc-03')!;
    const updated = await service.update('doc-03', { ...doc, lockedBy: null });

    expect(updated.lockedBy).toBeNull();
    expect((await service.findAll()).find((d) => d.id === 'doc-03')?.lockedBy).toBeNull();
    await expect(service.delete('doc-03')).resolves.toBeUndefined();
  });

  it('throws when updating a missing document', async () => {
    const doc = { id: 'doc-99', title: 'Missing', updatedAt: '2026-08-01T00:00:00.000Z', lockedBy: 'robert' };

    await expect(service.update('doc-99', doc)).rejects.toThrow(NotFoundException);
  });
});
