import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { Document } from './document.model';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Get()
  async findAll() {
    return this.documentsService.findAll();
  }

  @Post()
  async create(@Body() dto: { title: string }) {
    return this.documentsService.create(dto.title);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Document) {
    return this.documentsService.update(id, dto);
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() dto: { ids: string[] }) {
    const errors: string[] = []

    for (const id of dto.ids) {
      try {
        await this.documentsService.delete(id);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(message ?? `Unable to delete document: ${id}`)
      }
    }

    return { success: errors.length === 0, errors };
  }
}
