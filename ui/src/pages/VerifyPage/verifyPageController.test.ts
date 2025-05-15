import { describe, expect, it } from 'vitest';
import { displayFileName } from './verifyPageController';

describe('displayFileName', () => {
  it('should remove input/ prefix from document key', () => {
    const result = displayFileName('input/document.pdf');
    expect(result).toBe('document.pdf');
  });

  it('should return the original string if no input/ prefix exists', () => {
    const result = displayFileName('document.pdf');
    expect(result).toBe('document.pdf');
  });

  it('should return a space character when document_key is undefined', () => {
    const result = displayFileName(undefined);
    expect(result).toBe(' ');
  });

  it('should handle empty string correctly', () => {
    const result = displayFileName('');
    expect(result).toBe(' ');
  });

  it('should handle input/ as the entire string', () => {
    const result = displayFileName('input/');
    expect(result).toBe('');
  });
});

describe('pollGetDocumentApi', () => {
  it('does things', () => {});
});

describe('callUpdateDocumentApi', () => {
  it('does things', () => {});
});
