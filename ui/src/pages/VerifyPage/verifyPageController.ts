import {
  authorizedFetch,
  ExtractedData,
  GetDocumentResponse,
  UpdateDocumentResponse,
} from '../../utils/api.ts';

export function displayFileName(document_key?: string): string {
  return document_key ? document_key.replace('input/', '') : ' ';
}

interface PollGetDocumentApiResponse {
  responseData?: GetDocumentResponse;
  failure?: 'unauthenticated' | 'timeout';
}

export async function pollGetDocumentApi(
  documentId: string,
  attempts = 30,
  delay = 2000
): Promise<PollGetDocumentApiResponse> {
  const sleep = () => new Promise((resolve) => setTimeout(resolve, delay));

  for (let retryAttempt = 0; retryAttempt < attempts; retryAttempt++) {
    try {
      const response = await authorizedFetch(`/api/document/${documentId}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.status === 401 || response.status === 403) {
        return {
          failure: 'unauthenticated',
        };
      } else if (!response.ok) {
        console.warn(
          `Attempt ${retryAttempt + 1} failed: ${response.statusText}`
        );
        await sleep();
        continue;
      }

      const result = (await response.json()) as GetDocumentResponse;

      if (result.status !== 'complete') {
        console.info(
          `Attempt ${retryAttempt + 1} is not complete. Trying again shortly.`
        );
        await sleep();
        continue;
      }

      return {
        responseData: result,
      };
    } catch (err) {
      console.error(`Attempt ${retryAttempt + 1} failed:`, err);
      await sleep();
    }
  }

  console.error('Attempt failed after max attempts');
  return {
    failure: 'timeout',
  };
}

interface CallUpdateDocumentApiResponse {
  responseData?: UpdateDocumentResponse;
  failure?: 'unauthenticated' | 'other';
}

export async function callUpdateDocumentApi(
  document_id: string,
  extracted_data: ExtractedData
): Promise<CallUpdateDocumentApiResponse> {
  try {
    const apiUrl = `/api/document/${document_id}`;
    const response = await authorizedFetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extracted_data),
    });

    if (response.ok) {
      const result = (await response.json()) as UpdateDocumentResponse;
      return {
        responseData: result,
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        failure: 'unauthenticated',
      };
    } else {
      console.error('Failed to save data: ' + response.statusText);
      return {
        failure: 'other',
      };
    }
  } catch (err) {
    console.error('Error submitting data:', err);
    return {
      failure: 'other',
    };
  }
}
