import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";

interface JournalEntry {
  date: string;
  content: string;
}

const Journal = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const stored = localStorage.getItem("diaryEntries");
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading entries:", error);
      }
    }
  };

  const saveEntry = () => {
    if (!input.trim()) return;

    const newEntry: JournalEntry = {
      date: new Date().toLocaleString(),
      content: input.trim(),
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem("diaryEntries", JSON.stringify(updatedEntries));
    setInput("");
  };

  const deleteEntry = (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    localStorage.setItem("diaryEntries", JSON.stringify(updatedEntries));
  };

  return (
    <div className="relative min-h-screen cosmic-bg">
      <StarField />
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        {/* Close Button */}
        <button
          onClick={() => navigate("/chatbot")}
          className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all shadow-xl hover:scale-110 backdrop-blur-md"
          aria-label="Close"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">
          📝 My Personal Diary
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Write your thoughts and feelings here
        </p>

        <div className="glass-card p-6 rounded-2xl mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-40 bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                saveEntry();
              }
            }}
          />
          <button
            onClick={saveEntry}
            className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all"
          >
            <Plus size={18} />
            Save Entry
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Press Ctrl+Enter to save
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-4">📖 Your Entries</h2>
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center text-muted-foreground">
              No entries yet. Start writing your thoughts!
            </div>
          ) : (
            entries.map((entry, index) => (
              <div key={index} className="glass-card p-5 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-muted-foreground">{entry.date}</div>
                  <button
                    onClick={() => deleteEntry(index)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-foreground whitespace-pre-wrap">
                  {entry.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;

