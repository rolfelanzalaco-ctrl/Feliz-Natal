export interface Song {
  id: string;
  name: string;
  url: string;
  file: File;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSongId: string | null;
  currentTime: number;
  duration: number;
}