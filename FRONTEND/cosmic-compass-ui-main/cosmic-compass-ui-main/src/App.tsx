import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import MultimodalDetection from "./pages/MultimodalDetection";
import Chatbot from "./pages/Chatbot";
import MusicPlayer from "./pages/MusicPlayer";
import Journal from "./pages/Journal";
import SnakeGame from "./pages/SnakeGame";
import Exercise from "./pages/Exercise";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/multimodal-detection" element={<MultimodalDetection />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/tools/music" element={<MusicPlayer />} />
          <Route path="/tools/journal" element={<Journal />} />
          <Route path="/tools/game" element={<SnakeGame />} />
          <Route path="/tools/exercise" element={<Exercise />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
