import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, File, Image as ImageIcon, Loader2, Plus, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { processAndUploadFile, formatBytes } from '../../utils/fileUpload';
import { FileAttachment } from '../../types';

interface FileUploadZoneProps {
  onFilesUploaded: (files: FileAttachment[]) => void;
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  label?: string;
  hint?: string;
  compact?: boolean;
}

export function FileUploadZone({
  onFilesUploaded,
  accept = '*/*',
  maxSizeMb = 15,
  multiple = true,
  label = 'Tải lên tài liệu hoặc hình ảnh',
  hint = 'Kéo thả file vào đây hoặc bấm để chọn từ thiết bị (PDF, Word, Slide, Ảnh, Code, Zip)',
  compact = false
}: FileUploadZoneProps) {
  const { isDark } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    const uploadedList: FileAttachment[] = [];
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > maxSizeBytes) {
          setErrorMessage(`Tệp "${file.name}" vượt quá giới hạn ${maxSizeMb} MB`);
          continue;
        }

        const attachment = await processAndUploadFile(file);
        uploadedList.push(attachment);
        if (!multiple) break;
      }

      if (uploadedList.length > 0) {
        onFilesUploaded(uploadedList);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi xử lý tệp');
    } finally {
      setIsProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
  };

  if (compact) {
    return (
      <div className="space-y-1.5">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => inputRef.current?.click()}
          className={`w-full py-2 px-3 border border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-white'
              : 'border-slate-300 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 hover:border-indigo-300'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Đang tải lên...</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              <span>{label}</span>
            </>
          )}
        </button>
        {errorMessage && (
          <p className="text-[11px] text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer select-none relative overflow-hidden ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : isDark
              ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 hover:bg-neutral-900/40'
              : 'border-slate-200 hover:border-indigo-300 bg-slate-50/70 hover:bg-indigo-50/30'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform ${
            isDragging ? 'scale-110' : ''
          } ${
            isDark ? 'bg-neutral-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>

          <div>
            <p className="text-xs sm:text-sm font-bold tracking-tight">
              {isProcessing ? 'Đang xử lý tệp tin...' : label}
            </p>
            <p className={`text-[11px] sm:text-xs mt-0.5 max-w-md mx-auto ${
              isDark ? 'text-neutral-400' : 'text-slate-500'
            }`}>
              {hint}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
                : 'bg-white border-slate-200 text-slate-500'
            }`}>
              Tối đa {maxSizeMb} MB / tệp
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-indigo-400' 
                : 'bg-white border-slate-200 text-indigo-600'
            }`}>
              {multiple ? 'Chọn nhiều tệp' : 'Chọn 1 tệp'}
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
