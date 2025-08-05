import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Plus, Bot } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  onGenerate?: () => void;
  title: string;
  description: string;
  acceptedTypes?: string;
  maxSize?: number;
  currentFile?: File | null;
  showAIGeneration?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  onGenerate,
  title,
  description,
  acceptedTypes = '.pdf,.doc,.docx',
  maxSize = 10,
  currentFile = null,
  showAIGeneration = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.size <= maxSize * 1024 * 1024) {
      onUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= maxSize * 1024 * 1024) {
      onUpload(file);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-sm text-purple-200 mb-4">{description}</p>
        
        {currentFile ? (
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-200">{currentFile.name}</span>
            <button
              onClick={() => onUpload(currentFile)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200
              ${isDragging
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 hover:border-purple-500/50'
              }`}
          >
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-10 h-10 text-purple-400" />
              <div className="text-center">
                <p className="text-purple-200">
                  Arraste seu arquivo ou
                </p>
                <label className="relative cursor-pointer mt-2">
                  <span className="btn-secondary inline-block">Escolher arquivo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-xs text-purple-300/70 mt-2">
                  {acceptedTypes.split(',').join(', ')} até {maxSize}MB
                </p>
              </div>
            </div>
          </div>
        )}

        {showAIGeneration && (
          <div className="mt-6">
            <div className="border-t border-white/10 pt-6">
              <p className="text-sm text-purple-200 mb-4">
                Ou deixe nossa IA gerar um documento otimizado
              </p>
              <button
                onClick={onGenerate}
                className="btn-primary w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-purple-600"
              >
                <Bot className="w-5 h-5" />
                Gerar com IA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};