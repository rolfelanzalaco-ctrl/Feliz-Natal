import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, Pause, Download, GripVertical, Pencil, Check, Music } from 'lucide-react';
import { Song, PlayerState } from '../types';

interface SongCardProps {
  song: Song;
  playerState: PlayerState;
  onPlay: (id: string) => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onRename: (id: string, newName: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  playerState,
  onPlay,
  onPause,
  onSeek,
  onRename,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isCurrentSong = playerState.currentSongId === song.id;
  const isPlaying = isCurrentSong && playerState.isPlaying;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(song.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveName = () => {
    if (editName.trim()) {
      onRename(song.id, editName);
    } else {
      setEditName(song.name); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setEditName(song.name);
      setIsEditing(false);
    }
  };

  // Calculate progress percentage
  const progress = isCurrentSong && playerState.duration > 0
    ? (playerState.currentTime / playerState.duration) * 100
    : 0;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group flex flex-col gap-3 p-4 rounded-xl mb-3 
        backdrop-blur-md border transition-all duration-300
        ${isDragging ? 'shadow-2xl scale-105 bg-white/20 border-amber-400' : 'bg-white/10 hover:bg-white/15 border-white/10 hover:border-white/30'}
      `}
    >
      {/* Upper Row: Drag, Info, Actions */}
      <div className="flex items-center justify-between gap-3">
        
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1 text-white/40 hover:text-white transition-colors"
        >
          <GripVertical size={20} />
        </div>

        {/* Icon & Name */}
        <div className="flex-1 flex items-center gap-3 overflow-hidden">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0
            ${isPlaying ? 'bg-gradient-to-br from-red-600 to-red-800 animate-pulse' : 'bg-white/10'}
          `}>
            <Music size={18} className={isPlaying ? 'text-white' : 'text-white/50'} />
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleKeyDown}
                  className="bg-black/20 text-white rounded px-2 py-1 text-sm w-full outline-none border border-amber-500/50 focus:border-amber-500"
                />
                <button onClick={handleSaveName} className="text-emerald-400 hover:text-emerald-300">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/title">
                <h3 className="font-semibold text-white truncate text-lg leading-tight drop-shadow-sm">
                  {song.name}
                </h3>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover/title:opacity-100 transition-opacity text-white/40 hover:text-amber-400"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={song.url}
            download={song.name + ".mp3"}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-amber-400 transition-colors"
            title="Download MP3"
          >
            <Download size={20} />
          </a>
          
          <button
            onClick={() => isPlaying ? onPause() : onPlay(song.id)}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg
              ${isPlaying 
                ? 'bg-amber-400 text-red-900 hover:bg-amber-300' 
                : 'bg-red-700 text-white hover:bg-red-600 border border-red-500/30'
              }
            `}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
        </div>
      </div>

      {/* Bottom Row: Progress Bar (Only visible if current song) */}
      <div className={`
        transition-all duration-500 overflow-hidden
        ${isCurrentSong ? 'max-h-12 opacity-100 mt-1' : 'max-h-0 opacity-0'}
      `}>
        <div className="flex items-center gap-3 text-xs text-white/60 font-mono">
          <span>{formatTime(playerState.currentTime)}</span>
          <div className="relative flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
             {/* Background track */}
            <div className="absolute inset-0 bg-white/10"></div>
             {/* Progress Fill */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
            {/* Input Range for seeking */}
            <input 
              type="range"
              min="0"
              max={playerState.duration || 100}
              value={playerState.currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span>{formatTime(playerState.duration)}</span>
        </div>
      </div>
    </div>
  );
};