import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  authorizedFetch,
  FieldData,
  GetDocumentResponse,
  UpdateDocumentResponse,
} from '../../utils/api';

export interface UseVerifyHook {
  responseData: GetDocumentResponse | null;
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
  displayFileName: () => string;
}

export function useVerify(signOut: () => Promise<void>): UseVerifyHook {
  const [documentId] = useState<string | null>(() =>
    sessionStorage.getItem('documentId')
  );
  const [responseData, setResponseData] = useState<GetDocumentResponse | null>(
    null
  );
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
      const { responseData, failure } = await pollApiRequest(documentId);

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

      setResponseData(responseData);
    })();
  }, []);

  async function handleVerifySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!responseData || !responseData.extracted_data) {
      console.log('No extracted data available');
      return;
    }

    const formData = { extracted_data: responseData.extracted_data };

    try {
      const apiUrl = `/api/document/${responseData.document_id}`;
      const response = await authorizedFetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = (await response.json()) as UpdateDocumentResponse;
        sessionStorage.setItem('verifiedData', JSON.stringify(result));
        navigate('/download-document');
        alert('Data saved successfully!');
      } else if (response.status === 401 || response.status === 403) {
        alert('You are no longer signed in! Please sign in again.');
        signOut();
      } else {
        const result = await response.json();
        alert('Failed to save data: ' + result.error);
      }
    } catch (err) {
      console.error('Error submitting data:', err);
      alert('An error occurred while saving.');
    }
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
    field: FieldData
  ) {
    setResponseData((prevData) => {
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

  function displayFileName(): string {
    return responseData?.document_key
      ? responseData.document_key.replace('input/', '')
      : ' ';
  }

  return {
    responseData,
    loading,
    error,
    handleVerifySubmit,
    handleInputChange,
    displayFileName,
  };
}

interface PollApiRequestResponse {
  responseData?: GetDocumentResponse;
  failure?: 'unauthenticated' | 'timeout';
}

async function pollApiRequest(
  documentId: string,
  attempts = 30,
  delay = 2000
): Promise<PollApiRequestResponse> {
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
