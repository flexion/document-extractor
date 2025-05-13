import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  authorizedFetch,
  FieldData,
  GetDocumentResponse,
  UpdateDocumentResponse,
} from '../utils/api';
import { useNavigate } from 'react-router';
import { shouldUseTextarea } from '../utils/formUtils';

interface VerifyPageProps {
  signOut: () => Promise<void>;
}

export default function VerifyPage({ signOut }: VerifyPageProps) {
  const [documentId] = useState<string | null>(() =>
    sessionStorage.getItem('documentId')
  );
  const [responseData, setResponseData] = useState<GetDocumentResponse | null>(
    null
  ); // API response
  const [loading, setLoading] = useState<boolean>(true); // tracks if page is loading
  const [error, setError] = useState<boolean>(false); // tracks when there is an error

  const navigate = useNavigate();

  async function pollApiRequest(attempts = 30, delay = 2000) {
    // Helper function to sleep for the specified delay
    const sleep = () => new Promise((resolve) => setTimeout(resolve, delay));

    if (!documentId) {
      console.error('No documentId available for API request');
      setLoading(false);
      setError(true);
      return;
    }

    for (let i = 0; i < attempts; i++) {
      try {
        const response = await authorizedFetch(`/api/document/${documentId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          alert('You are no longer signed in!  Please sign in again.');
          signOut();
          return;
        } else if (!response.ok) {
          console.warn(`Attempt ${i + 1} failed: ${response.statusText}`);
          await sleep();
          continue;
        }

        const result = (await response.json()) as GetDocumentResponse; // parse response

        if (result.status !== 'complete') {
          console.info(
            `Attempt ${i + 1} is not complete.  Trying again in a little bit.`
          );
          await sleep();
          continue;
        }

        setResponseData(result); // store API data in state
        setLoading(false); // stop loading when data is received
        setError(false); // clear any previous errors
        return;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        await sleep();
      }
    }

    console.error('Attempt failed after max attempts');
    setLoading(false);
    setError(true);
  }

  async function handleVerifySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!responseData || !responseData.extracted_data) {
      console.log('no extracted data available');
      return;
    }

    const formData = {
      extracted_data: responseData.extracted_data,
    };

    try {
      const apiUrl = `/api/document/${responseData.document_id}`;
      const response = await authorizedFetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = (await response.json()) as UpdateDocumentResponse;
        sessionStorage.setItem('verifiedData', JSON.stringify(result));
        navigate('/download-document');
        alert('Data saved successfully!');
      } else if (response.status === 401 || response.status === 403) {
        alert('You are no longer signed in!  Please sign in again.');
        signOut();
      } else {
        const result = await response.json();
        alert('Failed to save data: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('An error occurred while saving.');
    }
  }

  useEffect(() => {
    if (!documentId) {
      console.error('No documentId found in sessionStorage');
      setLoading(false);
      setError(true);
      return;
    }
    pollApiRequest();
  }, []); // runs only once when the component mounts

  function displayFileName(): string {
    return responseData?.document_key
      ? responseData?.document_key.replace('input/', '')
      : ' ';
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
    field: FieldData
  ) {
    setResponseData((prevData) => {
      if (!prevData) return null;

      return {
        ...prevData, // keep previous data
        extracted_data: {
          ...prevData.extracted_data, // keep other fields the same
          [key]: { ...field, value: event.target.value },
        },
      };
    });
  }

  function displayExtractedData() {
    if (!responseData?.extracted_data) {
      console.warn('No extracted data found.');
      return;
    }

    return Object.entries(responseData.extracted_data)
      .sort(([keyA], [keyB]) =>
        keyA.localeCompare(keyB, undefined, { numeric: true })
      )
      .map(([key, field]) => {
        return (
          <div key={key}>
            <label className="usa-label" htmlFor={`field-${key}`}>
              {key}{' '}
              <span className="text-accent-cool-darker display-inline-block width-full padding-top-2px">
                {field.confidence
                  ? `(Confidence ${parseFloat(field.confidence).toFixed(2)})`
                  : 'Confidence'}
              </span>
            </label>
            {shouldUseTextarea(field.value) ? (
              <textarea
                className="usa-textarea"
                id={`field-${key}`}
                name={`field-${key}`}
                rows={2}
                value={field.value || ''}
                onChange={(event) => handleInputChange(event, key, field)}
              />
            ) : (
              <input
                className="usa-input"
                id={`field-${key}`}
                name={`field-${key}`}
                value={field.value || ''}
                onChange={(event) => handleInputChange(event, key, field)}
              />
            )}
          </div>
        );
      });
  }

  function displayFilePreview() {
    if (!responseData || !responseData.base64_encoded_file) return null;

    // get file extension
    const fileExtension =
      responseData.document_key?.split('.').pop()?.toLowerCase() || '';

    const mimeType =
      fileExtension === 'pdf' ? 'application/pdf' : `image/${fileExtension}`;
    // Base64 URL to display image
    const base64Src = `data:${mimeType};base64,${responseData.base64_encoded_file}`;

    return (
      <div id="file-display-container">
        {fileExtension === 'pdf' ? (
          <iframe
            src={base64Src}
            width="100%"
            height="600px"
            title="Document Preview"
          ></iframe>
        ) : (
          <img
            src={base64Src}
            alt="Uploaded Document"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )}
      </div>
    );
  }

  function displayStatusMessage() {
    if (loading) {
      return (
        <div className="loading-overlay">
          <div className="loading-content-el">
            <div className="loading-content">
              <p className="font-body-lg text-semi-bold">
                Processing your document
              </p>
              <p>We&apos;re extracting your data and it&apos;s on the way.</p>
              <div className="spinner" aria-label="loading"></div>
            </div>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="loading-overlay">
          <div className="loading-content-el">
            <div className="loading-content">
              <p className="font-body-lg text-semi-bold">No data found</p>
              <p>
                We couldn&apos;t extract the data from this document. Please
                check the file format and then try again. If the issue persists,
                reach out to support.
              </p>
              <a href="/">Upload document</a>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <Layout signOut={signOut}>
      {/* Start step indicator section  */}
      <div className="grid-container">
        <div
          className="usa-step-indicator usa-step-indicator--counters margin-y-2"
          aria-label="Document processing steps"
        >
          <ol className="usa-step-indicator__segments">
            <li className="usa-step-indicator__segment usa-step-indicator__segment--complete">
              <span className="usa-step-indicator__segment-label">
                Upload documents{' '}
                <span className="usa-sr-only">— completed</span>
              </span>
            </li>
            <li
              className="usa-step-indicator__segment usa-step-indicator__segment--current"
              aria-current="step"
            >
              <span className="usa-step-indicator__segment-label">
                Verify documents and data
                <span className="usa-sr-only">— current step</span>
              </span>
            </li>
            <li className="usa-step-indicator__segment">
              <span className="usa-step-indicator__segment-label">
                Save and download CSV file
                <span className="usa-sr-only">— not completed</span>
              </span>
            </li>
          </ol>
        </div>
      </div>
      {/* End step indicator section  */}
      <div className="border-top-2px border-base-lighter">
        <div className="grid-container position-relative">
          {displayStatusMessage()}
          <div className="grid-row">
            <div className="grid-col-12 tablet:grid-col-8">
              {/* Start card section  */}
              <ul className="usa-card-group">
                <li className="usa-card width-full">
                  <div className="usa-card__container file-preview-col">
                    <div className="usa-card__body">
                      <div id="file-display-container"></div>
                      <div>{displayFilePreview()}</div>
                      <p>{displayFileName()}</p>
                    </div>
                  </div>
                </li>
              </ul>
              {/* End card section  */}
            </div>
            <div className="grid-col-12 maxh-viewport border-bottom-2px border-base-lighter tablet:grid-col-4 tablet:border-left-2px tablet:border-base-lighter tablet:border-bottom-0">
              {/* Start verify form section  */}
              <form id="verify-form" onSubmit={handleVerifySubmit}>
                <ul className="usa-card-group">
                  <li className="usa-card width-full">
                    <div className="usa-card__container verify-col">
                      <div className="usa-card__body overflow-y-scroll minh-mobile-lg maxh-mobile-lg">
                        {displayExtractedData()}
                      </div>
                      <div className="usa-card__footer border-top-1px border-base-lighter">
                        <button
                          id="verify-button"
                          className="usa-button"
                          type="submit"
                        >
                          Data verified
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </form>
              {/* End verify form section  */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
