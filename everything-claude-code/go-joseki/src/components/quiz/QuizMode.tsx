import { useState, useEffect, useRef } from 'react';
import { useProgressStore } from '../../store/progressStore';
import { josekiDatabase } from '../../data/joseki';
import {
  createQuizSession,
  generateQuestion,
  checkAnswer,
  calculateQuizScore,
  type Question,
  type QuizSession,
} from '../../lib/quizEngine';
import {
  calculateBoardDimensions,
  coordinateToPixel,
  drawBoard,
  drawStone,
} from '../../lib/boardRenderer';

export function QuizMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { recordQuiz } = useProgressStore();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const size = 400;

  // Initialize quiz
  useEffect(() => {
    startNewQuiz();
  }, []);

  // Draw board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentQuestion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBoard(ctx, size, size, 19);

    const dims = calculateBoardDimensions(size, 19);

    // Draw position (moves up to current question)
    for (const move of currentQuestion.position) {
      const { x, y } = coordinateToPixel(move.coordinate, dims);
      drawStone(ctx, x, y, dims.stoneRadius, move.color);
    }

    // Draw options as ghost stones
    if (!showResult) {
      for (let i = 0; i < currentQuestion.options.length; i++) {
        const opt = currentQuestion.options[i];
        const { x, y } = coordinateToPixel(opt, dims);

        // Draw number label
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = i === selectedOption ? '#1A6B9C' : '#666';
        ctx.beginPath();
        ctx.arc(x, y, dims.stoneRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), x, y);
      }
    } else {
      // Show correct and selected answers
      for (let i = 0; i < currentQuestion.options.length; i++) {
        const opt = currentQuestion.options[i];
        const { x, y } = coordinateToPixel(opt, dims);
        const isCorrect = opt[0] === currentQuestion.correctAnswer[0] &&
                         opt[1] === currentQuestion.correctAnswer[1];
        const isSelected = i === selectedOption;

        ctx.globalAlpha = 0.8;
        if (isCorrect) {
          ctx.fillStyle = '#22c55e'; // Green
        } else if (isSelected && !isCorrect) {
          ctx.fillStyle = '#ef4444'; // Red
        } else {
          ctx.fillStyle = '#666';
        }

        ctx.beginPath();
        ctx.arc(x, y, dims.stoneRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw correct answer as stone
      const { x, y } = coordinateToPixel(currentQuestion.correctAnswer, dims);
      const lastMove = currentQuestion.position[currentQuestion.position.length - 1];
      const color = lastMove?.color === 'black' ? 'white' : 'black';
      drawStone(ctx, x, y, dims.stoneRadius, color);
    }
  }, [currentQuestion, selectedOption, showResult, size]);

  const startNewQuiz = () => {
    const newSession = createQuizSession(5);
    setSession(newSession);
    setIsComplete(false);
    loadQuestion(newSession);
  };

  const loadQuestion = (_sess: QuizSession) => {
    const question = generateQuestion(josekiDatabase);
    setCurrentQuestion(question);
    setSelectedOption(null);
    setShowResult(false);
    setResultMessage('');
  };

  const handleOptionSelect = (index: number) => {
    if (showResult || !session || !currentQuestion) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !session || !currentQuestion) return;

    const answer = currentQuestion.options[selectedOption];
    const result = checkAnswer(session, currentQuestion, answer);

    setShowResult(true);
    setResultMessage(
      result.isCorrect
        ? '✅ 正确！'
        : `❌ 不正确。正确答案是 ${coordinateToLabel(result.correctAnswer)}`
    );

    // Record progress
    const josekiId = currentQuestion.josekiId;
    recordQuiz(josekiId, result.isCorrect);

    if (session.isComplete) {
      setIsComplete(true);
    }
  };

  const handleNext = () => {
    if (!session) return;

    if (session.isComplete) {
      setIsComplete(true);
    } else {
      loadQuestion(session);
    }
  };

  const coordinateToLabel = (coord: [number, number]): string => {
    const [x, y] = coord;
    const col = String.fromCharCode(65 + x);
    const row = 19 - y;
    return `${col}${row}`;
  };

  if (!session || !currentQuestion) return null;

  if (isComplete) {
    const score = calculateQuizScore(session);
    return (
      <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-8 text-center">
        <h2 className="text-2xl font-bold text-ogs-text mb-4">🎉 测验完成！</h2>
        <div className="text-6xl font-bold text-ogs-accent mb-4">{score}%</div>
        <p className="text-ogs-muted mb-6">
          答对 {session.score} / {session.totalQuestions} 题
        </p>
        <button
          onClick={startNewQuiz}
          className="px-6 py-3 bg-ogs-accent text-white rounded-lg hover:bg-ogs-accent/90 transition-colors"
        >
          再测一次
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-ogs-text">测验模式</h2>
        <span className="text-sm text-ogs-muted">
          第 {session.currentQuestionIndex + 1} / {session.totalQuestions} 题
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-shrink-0">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="rounded border border-ogs-border"
          />
          <p className="text-xs text-ogs-muted mt-2 text-center">
            根据当前局面，选择下一手
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <div className="bg-ogs-bg rounded p-3">
            <p className="text-sm text-ogs-muted">
              来自定式: <span className="font-medium text-ogs-text">{currentQuestion.josekiName}</span>
            </p>
          </div>

          {showResult && (
            <div className={`p-3 rounded ${resultMessage.includes('✅') ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}`}>
              <p className="text-sm font-medium">{resultMessage}</p>
              {currentQuestion.hint && (
                <p className="text-xs text-ogs-muted mt-1">{currentQuestion.hint}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-ogs-text">选择下一手：</p>
            {currentQuestion.options.map((opt, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showResult}
                className={`w-full p-3 text-left rounded border transition-colors ${
                  selectedOption === index
                    ? 'border-ogs-accent bg-blue-50'
                    : 'border-ogs-border hover:bg-gray-50'
                } ${showResult ? 'opacity-50' : ''}`}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 bg-ogs-accent text-white rounded-full text-sm mr-3">
                  {index + 1}
                </span>
                {coordinateToLabel(opt)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="flex-1 px-4 py-3 bg-ogs-accent text-white rounded-lg hover:bg-ogs-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                提交答案
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                下一题 →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
