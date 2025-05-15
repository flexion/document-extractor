import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  authorizedFetch,
  ExtractedData,
  FieldData,
  GetDocumentResponse,
  UpdateDocumentResponse,
} from '../../utils/api';

export interface UseVerifyPageHook {
  getDocumentResponseData: GetDocumentResponse | null;
  loading: boolean;
  error: boolean;
  handleVerifySubmit: (
    event: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
    field: FieldData
  ) => void;
  displayFileName: (document_key?: string) => string;
}

export function useVerifyPage(signOut: () => Promise<void>): UseVerifyPageHook {
  const [documentId] = useState<string | null>(() =>
    sessionStorage.getItem('documentId')
  );
  const [getDocumentResponseData, setGetDocumentResponseData] =
    useState<GetDocumentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!documentId) {
      console.error('No documentId found in sessionStorage');
      setLoading(false);
      setError(true);
      return;
    }

    (async () => {
      const { responseData, failure } = await pollGetDocumentApi(documentId);

      setLoading(false);

      if (failure) {
        setError(true);
        if (failure === 'unauthenticated') {
          alert('You are no longer signed in!  Please sign in again.');
          await signOut();
        }

        return;
      }

      if (!responseData) {
        setError(true);
        return;
      }

      setGetDocumentResponseData(responseData);
    })();
  }, []);

  async function handleVerifySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!getDocumentResponseData?.extracted_data) {
      console.log('No extracted data available');
      return;
    }

    const { responseData, failure } = await callUpdateDocumentApi(
      getDocumentResponseData.document_id,
      getDocumentResponseData.extracted_data
    );

    if (failure) {
      if (failure === 'unauthenticated') {
        alert('You are no longer signed in! Please sign in again.');
        await signOut();
      } else {
        alert('An error occurred while saving.');
      }
      return;
    }

    sessionStorage.setItem('verifiedData', JSON.stringify(responseData));
    alert('Data saved successfully!');
    navigate('/download-document');
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
    field: FieldData
  ) {
    setGetDocumentResponseData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        extracted_data: {
          ...prevData.extracted_data,
          [key]: { ...field, value: event.target.value },
        },
      };
    });
  }

  return {
    getDocumentResponseData,
    loading,
    error,
    handleVerifySubmit,
    handleInputChange,
    displayFileName,
  };
}

function displayFileName(document_key?: string): string {
  return document_key ? document_key.replace('input/', '') : ' ';
}

interface PollGetDocumentApiResponse {
  responseData?: GetDocumentResponse;
  failure?: 'unauthenticated' | 'timeout';
}

async function pollGetDocumentApi(
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

async function callUpdateDocumentApi(
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
      alert('Failed to save data: ' + response.statusText);
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
