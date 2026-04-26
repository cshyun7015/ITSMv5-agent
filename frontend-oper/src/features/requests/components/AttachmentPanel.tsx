import React, { useRef } from 'react';
import { Paperclip, X, Download, FileText } from 'lucide-react';
import { AttachmentInfo } from '../types';
import { requestApi } from '../api/requestApi';

interface AttachmentPanelProps {
  /** 조회/수정 시 서버에 저장된 기존 첨부파일 목록 */
  existingFiles?: AttachmentInfo[];
  /** 수정 모드에서 삭제 예정인 파일 ID 목록 */
  deletedIds?: number[];
  /** 새로 추가할 파일 목록 */
  newFiles?: File[];
  /** view | edit | create */
  mode: 'view' | 'edit' | 'create';
  /** 파일 삭제 콜백 (edit 모드) */
  onDeleteExisting?: (id: number) => void;
  /** 새 파일 추가 콜백 (edit/create 모드) */
  onAddFiles?: (files: File[]) => void;
  /** 새 파일 제거 콜백 (edit/create 모드) */
  onRemoveNew?: (index: number) => void;
  /** 파일 입력 id (중복 방지) */
  inputId?: string;
}

const formatSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentPanel: React.FC<AttachmentPanelProps> = ({
  existingFiles = [],
  deletedIds = [],
  newFiles = [],
  mode,
  onDeleteExisting,
  onAddFiles,
  onRemoveNew,
  inputId = 'attachment-upload',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleExisting = existingFiles.filter(f => !deletedIds.includes(f.id));
  const hasFiles = visibleExisting.length > 0 || newFiles.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onAddFiles) {
      onAddFiles(Array.from(e.target.files));
      // 동일 파일 재선택 가능하도록 초기화
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && onAddFiles) {
      onAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  return (
    <div className="attachment-panel">
      {/* 기존 파일 목록 */}
      {visibleExisting.length > 0 && (
        <div className="att-file-list">
          {visibleExisting.map(att => (
            <div key={att.id} className="att-item">
              <div
                className="att-info"
                onClick={() => requestApi.downloadAttachment(att.id, att.fileName)}
                title="클릭하여 다운로드"
              >
                <FileText size={14} className="att-icon" />
                <span className="att-name">{att.fileName}</span>
                <span className="att-size">{formatSize(att.fileSize)}</span>
                {mode !== 'create' && (
                  <Download size={13} className="att-download-hint" />
                )}
              </div>
              {mode === 'edit' && onDeleteExisting && (
                <button
                  className="btn-remove-file"
                  onClick={() => onDeleteExisting(att.id)}
                  title="삭제"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 새로 추가된 파일 목록 (edit/create 모드) */}
      {newFiles.length > 0 && (
        <div className="att-file-list">
          {newFiles.map((file, idx) => (
            <div key={`new-${idx}`} className="att-item new-file">
              <div className="att-info">
                <FileText size={14} className="att-icon" />
                <span className="att-name">{file.name}</span>
                <span className="att-size">{formatSize(file.size)} <span className="att-badge-new">NEW</span></span>
              </div>
              {onRemoveNew && (
                <button
                  className="btn-remove-file"
                  onClick={() => onRemoveNew(idx)}
                  title="취소"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 파일 없을 때 + view 모드 */}
      {mode === 'view' && !hasFiles && (
        <div className="no-data">첨부파일이 없습니다.</div>
      )}

      {/* 업로드 드롭존 (edit/create 모드) */}
      {(mode === 'edit' || mode === 'create') && (
        <>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden-file-input"
          />
          <label
            htmlFor={inputId}
            className="file-upload-label compact att-dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Paperclip size={18} />
            <span>클릭하거나 파일을 여기로 끌어다 놓으세요</span>
            {mode === 'edit' && !hasFiles && (
              <span className="att-hint">아직 첨부파일이 없습니다</span>
            )}
          </label>
        </>
      )}
    </div>
  );
};

export default AttachmentPanel;
