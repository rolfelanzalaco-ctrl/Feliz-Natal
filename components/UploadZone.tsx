import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesAdded }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="
        relative flex flex-col items-center justify-center w-full h-24 
        border-2 border-dashed border-white/20 rounded-2xl 
        hover:bg-white/5 hover:border-amber-400/50 hover:text-amber-400
        transition-all cursor-pointer group bg-black/20
      ">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="flex items-center gap-2 text-white/60 group-hover:text-amber-400 transition-colors">
            <UploadCloud size={24} />
            <p className="text-sm font-medium">
              Adicionar Músicas MP3
            </p>
          </div>
          <p className="text-xs text-white/40 mt-1">Arraste ou clique para selecionar</p>
        </div>
        <input 
          type="file" 
          accept="audio/mp3,audio/*" 
          multiple 
          className="hidden" 
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};