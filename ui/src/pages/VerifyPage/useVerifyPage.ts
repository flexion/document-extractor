import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FieldData, GetDocumentResponse } from '../../utils/api';
import {
  callUpdateDocumentApi,
  displayFileName,
  pollGetDocumentApi,
} from './verifyPageController.ts';

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
