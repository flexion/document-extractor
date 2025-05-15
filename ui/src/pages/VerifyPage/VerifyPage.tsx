import Layout from '../../components/Layout';
import { ExtractedData } from '../../utils/api';
import { shouldUseTextarea } from '../../utils/formUtils';
import { useVerifyPage } from './useVerifyPage.ts';

interface VerifyPageProps {
  signOut: () => Promise<void>;
}

export default function VerifyPage({ signOut }: VerifyPageProps) {
  const {
    getDocumentResponseData,
    loading,
    error,
    handleVerifySubmit,
    handleInputChange,
    displayFileName,
  } = useVerifyPage(signOut);

  function displayFilePreview(
    base64_encoded_file: string,
    document_key?: string
  ) {
    // get file extension
    const fileExtension = document_key?.split('.').pop()?.toLowerCase() || '';

    const mimeType =
      fileExtension === 'pdf' ? 'application/pdf' : `image/${fileExtension}`;
    // Base64 URL to display image
    const base64Src = `data:${mimeType};base64,${base64_encoded_file}`;

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

  function displayStatusMessage(loading: boolean, error: boolean) {
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

    return <></>;
  }

  function displayExtractedData(extracted_data: ExtractedData) {
    return Object.entries(extracted_data)
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
          {displayStatusMessage(loading, error)}
          <div className="grid-row">
            <div className="grid-col-12 tablet:grid-col-8">
              {/* Start card section  */}
              <ul className="usa-card-group">
                <li className="usa-card width-full">
                  <div className="usa-card__container file-preview-col">
                    <div className="usa-card__body">
                      <div id="file-display-container"></div>
                      <div>
                        {getDocumentResponseData?.base64_encoded_file &&
                          displayFilePreview(
                            getDocumentResponseData.base64_encoded_file,
                            getDocumentResponseData.document_key
                          )}
                      </div>
                      <p>
                        {displayFileName(getDocumentResponseData?.document_key)}
                      </p>
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
                        {getDocumentResponseData?.extracted_data &&
                          displayExtractedData(
                            getDocumentResponseData?.extracted_data
                          )}
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
