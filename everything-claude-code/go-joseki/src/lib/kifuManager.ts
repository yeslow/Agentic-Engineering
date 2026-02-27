import type { BoardState } from '../types/go';
import { boardToSgf, sgfToBoard } from './sgf';

/**
 * Export current game record as SGF file
 * Triggers browser download with the specified filename
 */
export function exportKifu(
  board: BoardState,
  filename?: string,
  options?: {
    blackPlayer?: string;
    whitePlayer?: string;
  }
): void {
  const sgf = boardToSgf(board, options);
  const blob = new Blob([sgf], { type: 'application/x-go-sgf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  // Generate filename with timestamp if not provided
  const name = filename || generateKifuFilename(board);

  link.href = url;
  link.download = name.endsWith('.sgf') ? name : `${name}.sgf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ImportKifuResult {
  board: BoardState;
  blackPlayer?: string;
  whitePlayer?: string;
}

/**
 * Import game record from SGF file
 * Returns a Promise that resolves to the ImportKifuResult
 */
export function importKifu(file: File): Promise<ImportKifuResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          reject(new Error('Empty file'));
          return;
        }
        const result = sgfToBoard(content);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse SGF file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Generate a filename for the current game record
 * Includes board size and move count
 */
function generateKifuFilename(board: BoardState): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.toTimeString().slice(0, 5).replace(/:/g, '');
  return `kifu_${board.size}路_${board.moveHistory.length}手_${dateStr}_${timeStr}.sgf`;
}

/**
 * Create a file input element for importing kifu
 * Returns a Promise that resolves when a file is selected
 */
export function createFileInput(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sgf,.txt';
    input.multiple = false;

    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        resolve(files[0]);
      } else {
        reject(new Error('No file selected'));
      }
    };

    input.oncancel = () => {
      reject(new Error('File selection cancelled'));
    };

    input.click();
  });
}

/**
 * Combined function to import kifu via file picker
 * Opens file dialog and returns the parsed BoardState
 */
export async function importKifuWithPicker(): Promise<ImportKifuResult> {
  const file = await createFileInput();
  return importKifu(file);
}
