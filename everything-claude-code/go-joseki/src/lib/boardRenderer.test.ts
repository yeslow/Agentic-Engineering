import { describe, it, expect } from 'vitest';
import {
  calculateBoardDimensions,
  coordinateToPixel,
  pixelToCoordinate,
  getStarPoints,
} from './boardRenderer';

describe('calculateBoardDimensions', () => {
  it('should calculate correct dimensions for 19x19 board', () => {
    const dims = calculateBoardDimensions(600, 19);
    expect(dims.gridSize).toBeGreaterThan(0);
    expect(dims.cellSize).toBeGreaterThan(0);
    expect(dims.stoneRadius).toBeGreaterThan(0);
    expect(dims.padding).toBeGreaterThan(0);
  });

  it('should calculate correct dimensions for 9x9 board', () => {
    const dims = calculateBoardDimensions(400, 9);
    expect(dims.gridSize).toBeGreaterThan(0);
    // 340 / 8 = 42.5 (grid size is width - 2*padding = 340, divided by 8 gaps for 9 lines)
    expect(dims.cellSize).toBe(42.5);
  });

  it('should maintain consistent padding', () => {
    const dims = calculateBoardDimensions(500, 19);
    expect(dims.padding).toBe(30); // Default padding
  });
});

describe('coordinateToPixel', () => {
  it('should convert board coordinates to pixel coordinates', () => {
    const dims = calculateBoardDimensions(400, 9);
    const pixel = coordinateToPixel([0, 0], dims);

    expect(pixel.x).toBe(dims.padding);
    expect(pixel.y).toBe(dims.padding);
  });

  it('should convert center coordinate correctly', () => {
    const dims = calculateBoardDimensions(400, 9);
    const pixel = coordinateToPixel([4, 4], dims);

    expect(pixel.x).toBe(dims.padding + 4 * dims.cellSize);
    expect(pixel.y).toBe(dims.padding + 4 * dims.cellSize);
  });

  it('should convert last coordinate correctly', () => {
    const dims = calculateBoardDimensions(400, 9);
    const pixel = coordinateToPixel([8, 8], dims);

    expect(pixel.x).toBe(dims.padding + 8 * dims.cellSize);
    expect(pixel.y).toBe(dims.padding + 8 * dims.cellSize);
  });
});

describe('pixelToCoordinate', () => {
  it('should convert pixel to board coordinate', () => {
    const dims = calculateBoardDimensions(400, 9);
    const coord = pixelToCoordinate(
      { x: dims.padding, y: dims.padding },
      dims
    );

    expect(coord).toEqual([0, 0]);
  });

  it('should convert center pixel correctly', () => {
    const dims = calculateBoardDimensions(400, 9);
    const centerX = dims.padding + 4 * dims.cellSize;
    const centerY = dims.padding + 4 * dims.cellSize;

    const coord = pixelToCoordinate({ x: centerX, y: centerY }, dims);

    expect(coord).toEqual([4, 4]);
  });

  it('should return null for pixels outside board', () => {
    const dims = calculateBoardDimensions(400, 9);

    expect(pixelToCoordinate({ x: 5, y: 5 }, dims)).toBeNull();
    expect(pixelToCoordinate({ x: 500, y: 500 }, dims)).toBeNull();
  });

  it('should handle click near intersection with tolerance', () => {
    const dims = calculateBoardDimensions(400, 9);
    // Click slightly off center
    const coord = pixelToCoordinate(
      { x: dims.padding + 5, y: dims.padding + 5 },
      dims
    );

    expect(coord).toEqual([0, 0]);
  });
});

describe('getStarPoints', () => {
  it('should return correct star points for 19x19', () => {
    const stars = getStarPoints(19);

    // Standard 19x19 star points (3-3, 3-9, 3-15, etc.)
    expect(stars).toContainEqual([3, 3]);
    expect(stars).toContainEqual([3, 9]);
    expect(stars).toContainEqual([3, 15]);
    expect(stars).toContainEqual([9, 3]);
    expect(stars).toContainEqual([9, 9]); // Center (tengen)
    expect(stars).toContainEqual([9, 15]);
    expect(stars).toContainEqual([15, 3]);
    expect(stars).toContainEqual([15, 9]);
    expect(stars).toContainEqual([15, 15]);
    expect(stars).toHaveLength(9);
  });

  it('should return correct star points for 13x13', () => {
    const stars = getStarPoints(13);

    expect(stars).toContainEqual([3, 3]);
    expect(stars).toContainEqual([3, 9]);
    expect(stars).toContainEqual([6, 6]); // Center
    expect(stars).toContainEqual([9, 3]);
    expect(stars).toContainEqual([9, 9]);
    expect(stars).toHaveLength(5);
  });

  it('should return correct star points for 9x9', () => {
    const stars = getStarPoints(9);

    expect(stars).toContainEqual([2, 2]);
    expect(stars).toContainEqual([2, 6]);
    expect(stars).toContainEqual([4, 4]); // Center
    expect(stars).toContainEqual([6, 2]);
    expect(stars).toContainEqual([6, 6]);
    expect(stars).toHaveLength(5);
  });
});

// Canvas rendering tests skipped - jsdom doesn't fully support Canvas 2D API
// These would be better tested with E2E tests or visual regression tests
/*
describe('drawBoard', () => {
  it('should draw board with correct colors', () => {
    // Canvas tests require real browser environment
  });
});

describe('drawStone', () => {
  it('should draw black stone with shadow', () => {
    // Canvas tests require real browser environment
  });
});
*/
