import type { Joseki } from '../data/joseki';
import type { Coordinate, Move } from '../types/go';

export interface Question {
  josekiId: string;
  josekiName: string;
  moveNumber: number;
  position: Move[];
  correctAnswer: Coordinate;
  options: Coordinate[];
  hint?: string;
}

export interface QuizSession {
  totalQuestions: number;
  currentQuestionIndex: number;
  answers: {
    question: Question;
    userAnswer: Coordinate;
    isCorrect: boolean;
  }[];
  score: number;
  isComplete: boolean;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: Coordinate;
  explanation?: string;
}

/**
 * Create a new quiz session
 */
export function createQuizSession(totalQuestions: number): QuizSession {
  return {
    totalQuestions,
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    isComplete: false,
  };
}

/**
 * Generate a random question from joseki database
 */
export function generateQuestion(josekiList: Joseki[]): Question {
  // Pick a random joseki
  const joseki = josekiList[Math.floor(Math.random() * josekiList.length)];

  // Pick a random move (not the first one, to have some context)
  const minMove = 2;
  const maxMove = Math.max(minMove, joseki.mainLine.length - 1);
  const moveNumber = Math.floor(Math.random() * (maxMove - minMove + 1)) + minMove;

  const position = joseki.mainLine.slice(0, moveNumber);
  const correctAnswer = joseki.mainLine[moveNumber].coordinate;

  // Generate 3 wrong options
  const wrongOptions = generateWrongOptions(
    joseki,
    correctAnswer,
    moveNumber,
    3
  );

  // Combine and shuffle
  const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

  return {
    josekiId: joseki.id,
    josekiName: joseki.name,
    moveNumber: moveNumber + 1,
    position,
    correctAnswer,
    options,
    hint: joseki.mainLine[moveNumber].comment,
  };
}

/**
 * Check user's answer
 */
export function checkAnswer(
  session: QuizSession,
  question: Question,
  answer: Coordinate
): AnswerResult {
  const isCorrect =
    answer[0] === question.correctAnswer[0] &&
    answer[1] === question.correctAnswer[1];

  if (isCorrect) {
    session.score++;
  }

  session.answers.push({
    question,
    userAnswer: answer,
    isCorrect,
  });

  session.currentQuestionIndex++;

  if (session.currentQuestionIndex >= session.totalQuestions) {
    session.isComplete = true;
  }

  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.hint,
  };
}

/**
 * Calculate quiz score percentage
 */
export function calculateQuizScore(session: QuizSession): number {
  if (session.totalQuestions === 0) return 0;
  return Math.round((session.score / session.totalQuestions) * 100);
}

/**
 * Generate wrong answer options
 */
function generateWrongOptions(
  joseki: Joseki,
  correctAnswer: Coordinate,
  moveNumber: number,
  count: number
): Coordinate[] {
  const options: Coordinate[] = [];
  const [cx, cy] = correctAnswer;

  // Generate nearby points as wrong options
  const offsets = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
    [2, 0], [-2, 0], [0, 2], [0, -2],
  ];

  for (const [dx, dy] of offsets) {
    if (options.length >= count) break;

    const wrongCoord: Coordinate = [cx + dx, cy + dy];

    // Check if it's on the board
    if (wrongCoord[0] < 0 || wrongCoord[0] >= 19 || wrongCoord[1] < 0 || wrongCoord[1] >= 19) {
      continue;
    }

    // Check if it's not already occupied in the position
    const isOccupied = joseki.mainLine
      .slice(0, moveNumber + 1)
      .some(m => m.coordinate[0] === wrongCoord[0] && m.coordinate[1] === wrongCoord[1]);

    if (!isOccupied &&
        !options.some(o => o[0] === wrongCoord[0] && o[1] === wrongCoord[1])) {
      options.push(wrongCoord);
    }
  }

  return options;
}
