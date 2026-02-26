# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development
npm run dev          # Start Vite dev server (port 5173)
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build locally

# Testing
npm run test         # Run Vitest in watch mode
npm run test -- --run    # Run tests once (CI mode)
npm run test -- src/lib/goLogic.test.ts   # Run single test file
npm run test:coverage      # Run with coverage report

# Linting
npm run lint         # ESLint check
```

## Architecture

### Tech Stack
- **React 19** + TypeScript + Vite 7
- **Shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS 4** with custom theme variables (dark theme)
- **Zustand** for state management with persist middleware (LocalStorage)
- **React Router v7** for client-side routing
- **Vitest** + React Testing Library for testing

### Project Structure

```
src/
├── components/
│   ├── ui/            # Shadcn/ui components (Button, Card, etc.)
│   ├── board/         # GoBoard (Canvas rendering), BoardControls
│   ├── joseki/        # JosekiList, JosekiViewer, JosekiFilter
│   ├── practice/      # PracticeMode
│   ├── quiz/          # QuizMode
│   └── dashboard/     # Dashboard
├── lib/               # Core business logic (no React dependencies)
│   ├── goLogic.ts     # Board state, move validation, captures, ko
│   ├── boardRenderer.ts  # Canvas drawing functions
│   ├── practiceEngine.ts # Practice session logic
│   └── quizEngine.ts     # Quiz generation and scoring
├── store/             # Zustand stores
│   ├── boardStore.ts     # Current game state
│   ├── josekiStore.ts    # Selected joseki, filters
│   └── progressStore.ts  # User learning progress (persisted)
├── data/joseki/       # 20 joseki pattern definitions
└── types/go.ts        # Shared TypeScript types
```

### Key Design Patterns

**Coordinate System**: All board positions use `[x, y]` arrays where x is column (0-18), y is row (0-18) from top-left.

**Board State**: Immutable BoardState object tracks stones as arrays of coordinates per color, not a grid matrix. Captures and ko status are computed during move validation.

**Canvas Rendering**: The board uses HTML5 Canvas for performance. The `boardRenderer.ts` handles all drawing (grid, stones, markers). Stones are drawn with radial gradients for 3D effect.

**Joseki Data Structure**: Each joseki has `mainLine` (required moves in order) and `variations` (alternative branches). Moves include coordinates, color, and optional comments.

**State Management**: Three separate stores:
- `boardStore`: Active game board, current player, move history
- `josekiStore`: Selected joseki for viewing/practice, filter state
- `progressStore`: User's mastery levels and practice history (persisted to LocalStorage)

**Path Aliases**: Use `@/` prefix for imports from src/ (configured in vite.config.ts and tsconfig.app.json).

### Styling

Dark theme is configured via CSS variables in `src/index.css`. Key colors:
- Background: `hsl(0 0% 10%)` (#1a1a1a)
- Card: `hsl(0 0% 14%)`
- Primary (blue): `hsl(217 91% 60%)`
- Board background: `#C9B896` (wood texture color)

Shadcn components use `cn()` utility from `lib/utils.ts` for conditional class merging.

### Testing

Tests are co-located with source files (e.g., `goLogic.test.ts`). Tests use jsdom environment with `@testing-library/jest-dom` matchers. Board logic has comprehensive coverage; UI components have minimal test coverage.

### Data Persistence

All user data (progress, stats) is stored in browser LocalStorage via Zustand's persist middleware. No backend required. Data can be exported/imported via Dashboard page.

### Adding New Joseki

1. Define joseki object in `src/data/joseki/[category].ts` following the `Joseki` interface
2. Export from `src/data/joseki/index.ts`
3. Include: id, name, category, type, difficulty, boardSize, mainLine[], explanation, keyPoints[], tags[]
