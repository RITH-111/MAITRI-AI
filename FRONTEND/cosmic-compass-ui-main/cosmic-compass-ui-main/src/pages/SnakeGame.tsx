import { useEffect, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";

const SnakeGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef({
    snake: [{ x: 10 * 20, y: 10 * 20 }],
    direction: "RIGHT",
    food: { x: 0, y: 0 },
    gameInterval: null as NodeJS.Timeout | null,
  });

  const box = 20;
  const rows = 20;

  useEffect(() => {
    startGame();
    const handleKeyPress = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.key === "ArrowLeft" && state.direction !== "RIGHT") state.direction = "LEFT";
      if (e.key === "ArrowUp" && state.direction !== "DOWN") state.direction = "UP";
      if (e.key === "ArrowRight" && state.direction !== "LEFT") state.direction = "RIGHT";
      if (e.key === "ArrowDown" && state.direction !== "UP") state.direction = "DOWN";
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const generateFood = () => {
    const state = gameStateRef.current;
    let valid = false;
    while (!valid) {
      state.food = {
        x: Math.floor(Math.random() * rows) * box,
        y: Math.floor(Math.random() * rows) * box,
      };

      valid = true;
      for (let i = 0; i < state.snake.length; i++) {
        if (state.snake[i].x === state.food.x && state.snake[i].y === state.food.y) {
          valid = false;
          break;
        }
      }
    }
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < state.snake.length; i++) {
      ctx.fillStyle = i === 0 ? "#00ff00" : "#00cc00";
      ctx.fillRect(state.snake[i].x, state.snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(state.food.x, state.food.y, box, box);

    let headX = state.snake[0].x;
    let headY = state.snake[0].y;

    if (state.direction === "LEFT") headX -= box;
    if (state.direction === "UP") headY -= box;
    if (state.direction === "RIGHT") headX += box;
    if (state.direction === "DOWN") headY += box;

    const newHead = { x: headX, y: headY };

    // Wall collision
    if (
      headX < 0 ||
      headY < 0 ||
      headX >= canvas.width ||
      headY >= canvas.height
    ) {
      handleGameOver();
      return;
    }

    // Self collision
    for (let i = 0; i < state.snake.length; i++) {
      if (state.snake[i].x === newHead.x && state.snake[i].y === newHead.y) {
        handleGameOver();
        return;
      }
    }

    // Eat food
    if (headX === state.food.x && headY === state.food.y) {
      setScore((prev) => prev + 1);
      generateFood();
    } else {
      state.snake.pop();
    }

    state.snake.unshift(newHead);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 390);
  };

  const handleGameOver = () => {
    const state = gameStateRef.current;
    if (state.gameInterval) {
      clearInterval(state.gameInterval);
      state.gameInterval = null;
    }
    setGameOver(true);
  };

  const startGame = () => {
    const state = gameStateRef.current;
    state.snake = [{ x: 10 * box, y: 10 * box }];
    state.direction = "RIGHT";
    setScore(0);
    setGameOver(false);
    generateFood();

    if (state.gameInterval) {
      clearInterval(state.gameInterval);
    }

    state.gameInterval = setInterval(drawGame, 200);
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
          🐍 Snake Game
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Use Arrow Keys to Play
        </p>

        <div className="flex flex-col items-center">
          <div className="glass-card p-6 rounded-2xl mb-4">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-foreground">Score: {score}</div>
              {gameOver && (
                <div className="text-destructive text-xl font-semibold mt-2">
                  Game Over!
                </div>
              )}
            </div>
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="border-2 border-border rounded-lg bg-black"
            />
          </div>
          <button
            onClick={startGame}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all"
          >
            <RotateCcw size={18} />
            Restart Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;

