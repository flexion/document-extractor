function shouldUseTextarea(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return value.includes('\n');
}

export { shouldUseTextarea };
