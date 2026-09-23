import { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  ExternalLink, 
  FileCode, 
  FileArchive, 
  FileSpreadsheet, 
  Eye, 
  X,
  Paperclip
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { FileAttachment } from '../../types';
import { formatBytes } from '../../utils/fileUpload';

interface AttachmentListProps {
  attachments: FileAttachment[];
  onDeleteAttachment?: (id: string) => void;
  canDelete?: boolean;
  title?: string;
  emptyText?: string;
}

export function AttachmentList({
  attachments,
  onDeleteAttachment,
  canDelete = true,
  title,
  emptyText = 'Chưa có tệp đính kèm nào'
}: AttachmentListProps) {
  const { isDark } = useTheme();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) {
    if (!emptyText) return null;
    return (
      <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
        isDark ? 'border-neutral-800 text-neutral-500' : 'border-slate-200 text-slate-400'
      }`}>
        <Paperclip className="w-4 h-4 mx-auto mb-1 opacity-50" />
        <p>{emptyText}</p>
      </div>
    );
  }

  const getFileIcon = (att: FileAttachment) => {
    const cat = att.category || 'other';
    const mime = (att.type || '').toLowerCase();

    if (cat === 'image' || mime.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    }
    if (cat === 'slide') {
      return <FileText className="w-4 h-4 text-amber-500" />;
    }
    if (cat === 'code') {
      return <FileCode className="w-4 h-4 text-sky-500" />;
    }
    if (cat === 'archive') {
      return <FileArchive className="w-4 h-4 text-purple-500" />;
    }
    if (mime.includes('sheet') || mime.includes('excel')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    return <FileText className="w-4 h-4 text-indigo-500" />;
  };

  const isImageFile = (att: FileAttachment) => {
    return (
      att.category === 'image' ||
      (att.type || '').startsWith('image/') ||
      /\.(png|jpe?g|gif|webp|svg)$/i.test(att.name)
    );
  };

  const handleDownload = (att: FileAttachment) => {
    const a = document.createElement('a');
    a.href = att.url;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold tracking-tight flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
            <span>{title} ({attachments.length})</span>
          </h4>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {attachments.map((att) => {
          const isImg = isImageFile(att);

          return (
            <div
              key={att.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all group ${
                isDark 
                  ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700' 
                  : 'bg-white border-slate-200 hover:border-indigo-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Thumbnail or Icon */}
                {isImg && att.url ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(att.url)}
                    className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-neutral-800 relative group/thumb cursor-pointer"
                  >
                    <img
                      src={att.url}
                      alt={att.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Eye className="w-3 h-3" />
                    </div>
                  </button>
                ) : (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {getFileIcon(att)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p 
                    title={att.name}
                    className="text-xs font-bold truncate tracking-tight text-slate-800 dark:text-neutral-200"
                  >
                    {att.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <span>{formatBytes(att.size)}</span>
                    <span>•</span>
                    <span className="uppercase">{att.category || 'TỆP'}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {isImg && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(att.url)}
                    title="Xem ảnh"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDownload(att)}
                  title="Tải về thiết bị"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {canDelete && onDeleteAttachment && (
                  <button
                    type="button"
                    onClick={() => onDeleteAttachment(att.id)}
                    title="Xóa tệp đính kèm"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal for Image preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800 flex flex-col"
          >
            <div className="p-3 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between text-white">
              <span className="text-xs font-semibold">Xem Trước Hình Ảnh</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-black/50">
              <img
                src={previewImage}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="max-h-[80vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
