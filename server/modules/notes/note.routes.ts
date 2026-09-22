import { Router, Request, Response } from 'express';
import { memoryStore } from '../../config/db';
import { ApiError } from '../../errors/apiError';

export const noteRouter = Router();

// GET all notes
noteRouter.get('/', (req: Request, res: Response) => {
  const { search, tag } = req.query;
  let list = memoryStore.notes;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }

  if (tag && typeof tag === 'string') {
    list = list.filter(n => n.tags.includes(tag));
  }

  res.json({ success: true, data: list });
});

// POST create note
noteRouter.post('/', (req: Request, res: Response) => {
  const { title, content, tags, courseId, isPinned } = req.body;
  if (!title || !content) {
    throw ApiError.badRequest('Tiêu đề và nội dung ghi chú là bắt buộc');
  }

  const newNote = {
    id: `note-${Date.now()}`,
    title,
    content,
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : []),
    courseId,
    isPinned: Boolean(isPinned),
    updatedAt: new Date().toISOString().split('T')[0]
  };

  memoryStore.notes.unshift(newNote);
  res.status(201).json({ success: true, data: newNote });
});

// PUT/PATCH update note
const updateNoteHandler = (req: Request, res: Response) => {
  const idx = memoryStore.notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) {
    throw ApiError.notFound('Không tìm thấy ghi chú');
  }

  const current = memoryStore.notes[idx];
  const { title, content, tags, courseId, isPinned } = req.body;
  const updated = {
    ...current,
    ...(title !== undefined ? { title } : {}),
    ...(content !== undefined ? { content } : {}),
    ...(tags !== undefined ? { 
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []) 
    } : {}),
    ...(courseId !== undefined ? { courseId } : {}),
    ...(isPinned !== undefined ? { isPinned: Boolean(isPinned) } : {}),
    id: current.id,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  memoryStore.notes[idx] = updated;
  res.json({ success: true, data: updated });
};

noteRouter.put('/:id', updateNoteHandler);
noteRouter.patch('/:id', updateNoteHandler);

// DELETE note
noteRouter.delete('/:id', (req: Request, res: Response) => {
  const initialLen = memoryStore.notes.length;
  memoryStore.notes = memoryStore.notes.filter(n => n.id !== req.params.id);
  if (memoryStore.notes.length === initialLen) {
    throw ApiError.notFound('Không tìm thấy ghi chú để xoá');
  }
  res.json({ success: true, message: 'Đã xoá ghi chú thành công' });
});
