import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";

const songs = ['song', 'song1', 'song2', 'song3', 'song4', 'song5', 'song6', 'song7'];

const MusicPlayer = () => {
  const navigate = useNavigate();
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleNext);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleNext);
    };
  }, [songIndex]);

  const loadSong = (index: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = `/tools/music/${songs[index]}.mpeg`;
      audio.load();
    }
  };

  useEffect(() => {
    loadSong(songIndex);
  }, [songIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    const newIndex = songIndex === 0 ? songs.length - 1 : songIndex - 1;
    setSongIndex(newIndex);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const handleNext = () => {
    const newIndex = (songIndex + 1) % songs.length;
    setSongIndex(newIndex);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const progressContainer = e.currentTarget;
    const width = progressContainer.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const duration = audio.duration;

    if (duration) {
      audio.currentTime = (clickX / width) * duration;
    }
  };

  return (
    <div className="relative min-h-screen cosmic-bg">
      <StarField />
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Close Button */}
        <button
          onClick={() => navigate("/chatbot")}
          className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all shadow-xl hover:scale-110 backdrop-blur-md"
          aria-label="Close"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">
          Music Player
        </h1>

        <div className="max-w-md mx-auto mt-12">
          <div className="glass-card p-8 rounded-2xl">
            <div className="text-center mb-6">
              <h4 className="text-xl font-semibold text-foreground mb-4">
                {songs[songIndex]}
              </h4>
              <div
                className="w-full h-2 bg-surface rounded-full cursor-pointer mb-4"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <audio ref={audioRef} preload="metadata" />

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-foreground hover:bg-surface-hover transition-colors"
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all shadow-lg"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-foreground hover:bg-surface-hover transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;

