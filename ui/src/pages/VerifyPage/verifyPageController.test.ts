import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  displayFileName,
  pollGetDocumentApi,
  callUpdateDocumentApi,
} from './verifyPageController';
import * as api from '../../utils/api';

// Mock the authorizedFetch function
vi.mock('../../utils/api', () => ({
  authorizedFetch: vi.fn(),
}));

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
  const mockAuthorizedFetch = api.authorizedFetch as ReturnType<typeof vi.fn>;
  const documentId = 'test-document-id';

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return response data when API returns complete status', async () => {
    // Mock a successful response with complete status
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        status: 'complete',
        document_id: documentId,
        document_key: 'input/test.pdf',
      }),
    };
    mockAuthorizedFetch.mockResolvedValue(mockResponse);

    const result = await pollGetDocumentApi(documentId, 1);

    expect(mockAuthorizedFetch).toHaveBeenCalledWith(
      `/api/document/${documentId}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );
    expect(result).toEqual({
      responseData: {
        status: 'complete',
        document_id: documentId,
        document_key: 'input/test.pdf',
      },
      failure: undefined,
    });
  });

  it('should return unauthenticated failure when API returns 401', async () => {
    // Mock a 401 unauthorized response
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    };
    mockAuthorizedFetch.mockResolvedValue(mockResponse);

    const result = await pollGetDocumentApi(documentId, 1);

    expect(result).toEqual({
      failure: 'unauthenticated',
      responseData: undefined,
    });
  });

  it('should return unauthenticated failure when API returns 403', async () => {
    // Mock a 403 forbidden response
    const mockResponse = {
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    };
    mockAuthorizedFetch.mockResolvedValue(mockResponse);

    const result = await pollGetDocumentApi(documentId, 1);

    expect(result).toEqual({
      failure: 'unauthenticated',
      responseData: undefined,
    });
  });

  it('should retry when API returns non-complete status and eventually succeed', async () => {
    // Mock responses: first with processing status, second with complete status
    const mockProcessingResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        status: 'processing',
        document_id: documentId,
      }),
    };

    const mockCompleteResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        status: 'complete',
        document_id: documentId,
        document_key: 'input/test.pdf',
      }),
    };

    mockAuthorizedFetch
      .mockResolvedValueOnce(mockProcessingResponse)
      .mockResolvedValueOnce(mockCompleteResponse);

    // not awaiting because need to skip past the sleep
    const resultPromise = pollGetDocumentApi(documentId, 2, 1000);

    // fast-forward time to speed-up the retry
    await vi.advanceTimersByTimeAsync(1000);

    // now await the promise
    const result = await resultPromise;

    expect(mockAuthorizedFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      responseData: {
        status: 'complete',
        document_id: documentId,
        document_key: 'input/test.pdf',
      },
      failure: undefined,
    });
  });

  it('should return timeout failure after max attempts', async () => {
    // Mock a response with non-complete status
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        status: 'processing',
        document_id: documentId,
      }),
    };

    mockAuthorizedFetch.mockResolvedValue(mockResponse);

    const resultPromise = pollGetDocumentApi(documentId, 2, 1000);

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    expect(result).toEqual({
      failure: 'timeout',
      responseData: undefined,
    });
  });

  it('should retry when API returns error response', async () => {
    // Mock a failed response followed by a successful one
    const mockErrorResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    };

    const mockSuccessResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        status: 'complete',
        document_id: documentId,
        document_key: 'input/test.pdf',
      }),
    };

    mockAuthorizedFetch
      .mockResolvedValueOnce(mockErrorResponse)
      .mockResolvedValueOnce(mockSuccessResponse);

    const resultPromise = pollGetDocumentApi(documentId, 2, 1000);

    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    expect(mockAuthorizedFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      responseData: {
        status: 'complete',
        document_id: documentId,
        document_key: 'input/test.pdf',
      },
      failure: undefined,
    });
  });

  it('should retry when fetch throws an exception', async () => {
    // Mock a thrown exception followed by a successful response
    mockAuthorizedFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          status: 'complete',
          document_id: documentId,
          document_key: 'input/test.pdf',
        }),
      });

    const resultPromise = pollGetDocumentApi(documentId, 2, 1000);

    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    expect(mockAuthorizedFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      responseData: {
        status: 'complete',
        document_id: documentId,
        document_key: 'input/test.pdf',
      },
      failure: undefined,
    });
  });
});

describe('callUpdateDocumentApi', () => {
  const mockAuthorizedFetch = api.authorizedFetch as ReturnType<typeof vi.fn>;
  const documentId = 'test-document-id';
  const mockExtractedData = {
    field1: { value: 'value1', confidence: '0.9' },
    field2: { value: 'value2', confidence: '0.8' },
  };

  it('should return response data when API call is successful', async () => {
    // Mock a successful response
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        extracted_data: mockExtractedData,
      }),
    };
    mockAuthorizedFetch.mockResolvedValue(mockResponse);

    const result = await callUpdateDocumentApi(documentId, mockExtractedData);

    expect(mockAuthorizedFetch).toHaveBeenCalledWith(
      `/api/document/${documentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockExtractedData),
      }
    );
    expect(result).toEqual({
      responseData: {
        extracted_data: mockExtractedData,
      },
      failure: undefined,
    });
  });

  it('should return unauthenticated failure when API returns 401', async () => {
    // Mock a 401 unauthorized response
    const mockResponse = {
      ok: false,
      status: 401,
    };
    mockAuthorizedFetch.mockResolvedValue(mockResponse);

    const result = await callUpdateDocumentApi(documentId, mockExtractedData);

    expect(result).toEqual({
      failure: 'unauthenticated',
      responseData: undefined,
    });
  });

  it('should return unauthenticated failure when API returns 403', async () => {
    // Mock a 403 forbidden response
    const mockResponse = {
      ok: false,
      status: 403,
    };
    mockAuthorizedFetch.mockResolvedValue(mockResponse);

    const result = await callUpdateDocumentApi(documentId, mockExtractedData);

    expect(result).toEqual({
      failure: 'unauthenticated',
      responseData: undefined,
    });
  });

  it('should return other failure when API returns other error status', async () => {
    // Mock a 500 server error response
    const mockResponse = {
      ok: false,
      status: 500,
    };
    mockAuthorizedFetch.mockResolvedValue(mockResponse);

    const result = await callUpdateDocumentApi(documentId, mockExtractedData);

    expect(result).toEqual({
      failure: 'other',
      responseData: undefined,
    });
  });

  it('should return other failure when fetch throws an exception', async () => {
    // Mock a network error
    mockAuthorizedFetch.mockRejectedValue(new Error('Network error'));

    const result = await callUpdateDocumentApi(documentId, mockExtractedData);

    expect(result).toEqual({
      failure: 'other',
      responseData: undefined,
    });
  });
});
