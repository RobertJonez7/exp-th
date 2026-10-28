import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Document } from './document.model';
import { DocumentsStore } from './documents.store';

@Injectable()
export class DocumentsService implements OnModuleInit {
  private documentsCache: Document[] = [];

  constructor(private readonly store: DocumentsStore) { }

  // The list endpoint is hit on every page load and the document set is small,
  // so we keep a ready-to-serve copy in memory instead of rebuilding it per request.
  onModuleInit(): void {
    this.refreshCache();
  }

  async findAll(): Promise<Document[]> {
    return this.documentsCache;
  }

  async create(title: string): Promise<Document> {
    const document = this.store.insert(title);
    this.refreshCache()

    return document

  }

  async delete(id: string): Promise<void> {
    const document = this.store.findById(id);

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    if (document.lockedBy !== null) {
      throw new ConflictException(`Document: ${document.title} is locked by ${document.lockedBy}`);
    }

    this.store.remove(id);
    this.refreshCache()
  }

  async update(id: string, doc: Document): Promise<Document> {
    const document = this.store.findById(id);

    if (!document) {
      throw new NotFoundException(`Document ${doc.title} not found`);
    }

    const updated = this.store.update(doc)!;
    this.refreshCache();

    return updated;
  }

  private refreshCache() {
    this.documentsCache = this.store.all();
  }
}
