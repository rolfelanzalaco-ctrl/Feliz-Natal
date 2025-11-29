import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Song, PlayerState } from './types';
import { SongCard } from './components/SongCard';
import { UploadZone } from './components/UploadZone';
import { Sparkles, Music } from 'lucide-react';

export default function App() {
  // State
  const [songs, setSongs] = useState<Song[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentSongId: null,
    currentTime: 0,
    duration: 0,
  });

  // Audio Reference
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Audio Logic ---

  // Handle Play Request
  const handlePlay = (id: string) => {
    const songToPlay = songs.find((s) => s.id === id);
    if (!songToPlay) return;

    if (playerState.currentSongId === id) {
      // Resume
      audioRef.current.play();
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    } else {
      // New Song
      audioRef.current.src = songToPlay.url;
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback error:", e));
      setPlayerState((prev) => ({
        ...prev,
        currentSongId: id,
        isPlaying: true,
        currentTime: 0, // Reset visual time immediately
      }));
    }
  };

  // Handle Pause Request
  const handlePause = () => {
    audioRef.current.pause();
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
  };

  // Handle Seek
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState((prev) => ({ ...prev, currentTime: time }));
    }
  };

  // Handle Rename
  const handleRename = (id: string, newName: string) => {
    setSongs((prev) =>
      prev.map((song) => (song.id === id ? { ...song, name: newName } : song))
    );
  };

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setPlayerState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const onLoadedMetadata = () => {
      setPlayerState((prev) => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    const onEnded = () => {
      setPlayerState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
      // Optional: Auto-play next song logic could go here
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // --- File Management ---

  const handleFilesAdded = (files: File[]) => {
    const newSongs: Song[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      url: URL.createObjectURL(file),
      file: file,
    }));

    setSongs((prev) => [...prev, ...newSongs]);
  };

  // --- Drag and Drop Logic ---

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSongs((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 bg-gradient-to-b from-slate-900 via-red-950 to-slate-900 overflow-x-hidden">
      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-2xl mx-auto pt-10">
        
        {/* Header */}
        <header className="text-center mb-10 relative">
          <div className="inline-block p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Music className="text-amber-400" size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Minhas Músicas de Natal
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-red-200/80 font-serif italic text-lg">
            <Sparkles size={16} />
            <span>Coleção Especial de Rolfe</span>
            <Sparkles size={16} />
          </div>
        </header>

        {/* Upload */}
        <UploadZone onFilesAdded={handleFilesAdded} />

        {/* Song List */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl min-h-[300px]">
          {songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30 text-center">
              <Music size={48} className="mb-4 opacity-50" />
              <p>Sua playlist está vazia.</p>
              <p className="text-sm">Adicione arquivos MP3 para começar a magia.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={songs.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {songs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    playerState={playerState}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onSeek={handleSeek}
                    onRename={handleRename}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-white/20 mt-12 pb-8 text-sm">
          <p>© 2024 Natal de Rolfe. Feito com espírito natalino.</p>
        </footer>
      </div>
    </div>
  );
}