import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { callCreateTokenApi } from './signInPageController';
import { CreateTokenResponse } from '../../utils/api';

// Mock the global fetch function
const originalFetch = globalThis.fetch;

describe('callCreateTokenApi', () => {
  beforeEach(() => {
    // Replace the global fetch with a mock function
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore the original fetch after each test
    globalThis.fetch = originalFetch;
  });

  it('should return response data when API call is successful', async () => {
    const mockResponseData: CreateTokenResponse = {
      access_token: 'test-token',
      token_type: 'Bearer',
    };

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponseData),
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse
    );

    const testUser = 'DogCow';
    const testPassword = 'Moof';
    const result = await callCreateTokenApi(testUser, testPassword);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUser, password: testPassword }),
    });

    expect(result).toEqual({
      responseData: mockResponseData,
      failure: undefined,
    });
  });

  it('should return failure message when API returns non-ok response', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse
    );

    const result = await callCreateTokenApi('testuser', 'wrongpassword');

    // Verify the result contains the expected failure message
    expect(result).toEqual({
      responseData: undefined,
      failure: "The email or password you've entered is wrong.",
    });
  });

  it('should handle fetch exceptions and return error message', async () => {
    // Mock a network error
    const errorMessage = 'Network error';
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error(errorMessage)
    );

    const result = await callCreateTokenApi('testuser', 'password123');

    expect(result).toEqual({
      responseData: undefined,
      failure: errorMessage,
    });
  });

  it('should handle unknown exceptions and return generic error message', async () => {
    // Mock an unknown error (not an Error instance)
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      'Unknown error'
    );

    const result = await callCreateTokenApi('testuser', 'password123');

    expect(result).toEqual({
      responseData: undefined,
      failure: 'An unexpected error occurred',
    });
  });
});
