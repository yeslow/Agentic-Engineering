import { describe, it, expect } from 'vitest';
import {
  createQuizSession,
  generateQuestion,
  checkAnswer,
  calculateQuizScore,
  type QuizSession,
} from './quizEngine';
import { josekiDatabase } from '../data/joseki';

describe('createQuizSession', () => {
  it('should create a quiz session with specified number of questions', () => {
    const session = createQuizSession(5);

    expect(session.totalQuestions).toBe(5);
    expect(session.currentQuestionIndex).toBe(0);
    expect(session.answers).toEqual([]);
    expect(session.score).toBe(0);
    expect(session.isComplete).toBe(false);
  });
});

describe('generateQuestion', () => {
  it('should generate a question from joseki database', () => {
    const question = generateQuestion(josekiDatabase);

    expect(question).toBeDefined();
    expect(question.josekiId).toBeDefined();
    expect(question.position).toBeDefined();
    expect(question.correctAnswer).toBeDefined();
    expect(question.options).toHaveLength(4);
    expect(question.moveNumber).toBeGreaterThan(0);
  });

  it('should include correct answer in options', () => {
    const question = generateQuestion(josekiDatabase);

    const correctInOptions = question.options.some(
      opt => opt[0] === question.correctAnswer[0] && opt[1] === question.correctAnswer[1]
    );
    expect(correctInOptions).toBe(true);
  });

  it('should generate different questions', () => {
    const q1 = generateQuestion(josekiDatabase);
    const q2 = generateQuestion(josekiDatabase);

    // They should be different (though there's a small chance they could be the same)
    expect(q1.josekiId !== q2.josekiId || q1.moveNumber !== q2.moveNumber).toBe(true);
  });
});

describe('checkAnswer', () => {
  it('should return correct for right answer', () => {
    const question = generateQuestion(josekiDatabase);
    const session = createQuizSession(5);

    const result = checkAnswer(session, question, question.correctAnswer);

    expect(result.isCorrect).toBe(true);
    expect(session.score).toBe(1);
    expect(session.answers).toHaveLength(1);
  });

  it('should return incorrect for wrong answer', () => {
    const question = generateQuestion(josekiDatabase);
    const session = createQuizSession(5);

    // Pick a wrong option
    const wrongOption = question.options.find(
      opt => opt[0] !== question.correctAnswer[0] || opt[1] !== question.correctAnswer[1]
    )!;

    const result = checkAnswer(session, question, wrongOption);

    expect(result.isCorrect).toBe(false);
    expect(result.correctAnswer).toEqual(question.correctAnswer);
    expect(session.score).toBe(0);
  });

  it('should advance to next question', () => {
    const question = generateQuestion(josekiDatabase);
    const session = createQuizSession(5);

    checkAnswer(session, question, question.correctAnswer);

    expect(session.currentQuestionIndex).toBe(1);
  });
});

describe('calculateQuizScore', () => {
  it('should return 100 for perfect score', () => {
    const session: QuizSession = {
      totalQuestions: 5,
      currentQuestionIndex: 5,
      answers: [],
      score: 5,
      isComplete: true,
    };

    expect(calculateQuizScore(session)).toBe(100);
  });

  it('should return 0 for no correct answers', () => {
    const session: QuizSession = {
      totalQuestions: 5,
      currentQuestionIndex: 5,
      answers: [],
      score: 0,
      isComplete: true,
    };

    expect(calculateQuizScore(session)).toBe(0);
  });

  it('should return correct percentage', () => {
    const session: QuizSession = {
      totalQuestions: 5,
      currentQuestionIndex: 5,
      answers: [],
      score: 3,
      isComplete: true,
    };

    expect(calculateQuizScore(session)).toBe(60);
  });
});
