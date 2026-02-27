import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Plus, Music, Gamepad2, BookOpen, Dumbbell, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";
import LogoBadge from "@/components/LogoBadge";
import { respondWithText, respondWithVoice, invokeConversation, playAudio } from "@/lib/maitri-api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
}

const toolItems = [
  { icon: Music, label: "Music", path: "/tools/music" },
  { icon: Gamepad2, label: "Game", path: "/tools/game" },
  { icon: BookOpen, label: "Journal", path: "/tools/journal" },
  { icon: Dumbbell, label: "Exercise", path: "/tools/exercise" },
];

const Chatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello, I'm Maitri. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Read emotion from URL and auto-invoke conversation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emotion = params.get("emotion");
    if (emotion) {
      setLoading(true);
      invokeConversation(emotion)
        .then((response) => {
          setConversationId(response.conversation_id);
          const assistantMsg: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: response.response_text,
            audioUrl: response.audio_url,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          if (response.audio_url) {
            playAudio(`http://127.0.0.1:5000${response.audio_url}`).catch(console.error);
          }
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to start conversation with detected emotion.",
            variant: "destructive",
          });
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let response;
      if (!conversationId) {
        response = await invokeConversation("neutral");
        setConversationId(response.conversation_id);
      } else {
        response = await respondWithText(conversationId, userText);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response_text,
        audioUrl: response.audio_url,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (response.audio_url) {
        playAudio(`http://127.0.0.1:5000${response.audio_url}`).catch(console.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await handleVoiceMessage(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    setLoading(true);
    const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });

    try {
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const initResponse = await invokeConversation("neutral");
        currentConversationId = initResponse.conversation_id;
        setConversationId(currentConversationId);
      }

      const response = await respondWithVoice(currentConversationId, audioFile);

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: response.transcription,
      };
      setMessages((prev) => [...prev, userMsg]);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response_text,
        audioUrl: response.audio_url,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (response.audio_url) {
        playAudio(`http://127.0.0.1:5000${response.audio_url}`).catch(console.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process voice message.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] cosmic-bg flex flex-col">
      <StarField />

      {/* Chat Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "glass-card text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass-card px-5 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Maitri is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="relative z-10 border-t border-border/30 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {/* Tools */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              {toolsOpen ? <X size={18} /> : <Plus size={18} />}
            </button>
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-14 left-0 glass-card p-2 min-w-[140px] space-y-1"
                >
                  {toolItems.map((t) => (
                    <button
                      key={t.label}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
                      onClick={() => {
                        setToolsOpen(false);
                        navigate(t.path);
                      }}
                    >
                      <t.icon size={16} />
                      {t.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />

          {/* Mic */}
          <button
            onClick={toggleRecording}
            disabled={loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              recording
                ? "bg-primary/15 border-primary/40 text-primary pulse-ring"
                : "bg-secondary border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {recording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              input.trim() && !loading
                ? "bg-primary border-primary text-primary-foreground hover:brightness-110"
                : "bg-secondary border-border/50 text-muted-foreground cursor-not-allowed opacity-50"
            }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;