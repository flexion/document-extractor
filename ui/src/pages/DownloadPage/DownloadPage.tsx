import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { generateCsvData } from '../../utils/downloadPageController';
import { UpdateDocumentResponse } from '../../utils/api';

interface DownloadPageProps {
  signOut: () => Promise<void>;
}

export default function DownloadPage({ signOut }: DownloadPageProps) {
  const [verifiedData] = useState<UpdateDocumentResponse>(() => {
    const storedData = sessionStorage.getItem('verifiedData');
    return storedData ? JSON.parse(storedData)?.updated_document : {};
  });

  function displayPreviewTable() {
    if (!verifiedData.extracted_data) {
      return <p>No extracted data available</p>;
    }

    return (
      <table className="usa-table">
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Value</th>
            <th scope="col">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(verifiedData.extracted_data)
            .sort(([keyA], [keyB]) =>
              keyA.localeCompare(keyB, undefined, { numeric: true })
            )
            .map(([key, field]) => {
              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td> {field.value ? field.value : ''}</td>
                  <td>
                    {field.confidence
                      ? parseFloat(field.confidence).toFixed(2) + '%'
                      : ''}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    );
  }

  function downloadCSV() {
    if (!verifiedData.extracted_data) {
      console.error('No data available for CSV download');
      return;
    }

    const csvContent = generateCsvData(verifiedData.extracted_data);

    downloadData(csvContent, 'text/csv', 'document.csv');
  }

  function downloadJSON() {
    if (!verifiedData.extracted_data) {
      console.error('No data available for JSON download');
      return;
    }

    const jsonContent = JSON.stringify(verifiedData, null, 2);

    downloadData(jsonContent, 'application/json', 'document.json');
  }

  async function downloadData(
    content: string,
    contentType: string,
    filename: string
  ) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);

    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000); // Small delay to ensure download starts
    }
  }

  function handleDownloadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // get the selected file type (CSV or JSON) from the radio buttons
    const selectedElement = document.querySelector(
      "input[name='download-file-type']:checked"
    ) as HTMLInputElement | null;

    if (!selectedElement) {
      console.error('No file type selected');
      return;
    }

    const fileType = selectedElement.value;

    if (!fileType) {
      console.error('No file type selected');
      return;
    }

    // download function based on the selected file type
    if (fileType === 'csv') {
      downloadCSV();
    } else {
      downloadJSON();
    }
  }

  return (
    <Layout signOut={signOut}>
      <div className="grid-container margin-bottom-15">
        {/* Start of the step indicator section  */}
        <div
          className="usa-step-indicator usa-step-indicator--counters margin-top-2 margin-bottom-6"
          aria-label="Document processing steps"
        >
          <ol className="usa-step-indicator__segments">
            <li className="usa-step-indicator__segment usa-step-indicator__segment--complete">
              <span className="usa-step-indicator__segment-label">
                Upload documents{' '}
                <span className="usa-sr-only">— completed</span>
              </span>
            </li>
            <li className="usa-step-indicator__segment usa-step-indicator__segment--complete">
              <span className="usa-step-indicator__segment-label">
                Verify documents and data{' '}
                <span className="usa-sr-only">— completed</span>
              </span>
            </li>
            <li
              className="usa-step-indicator__segment usa-step-indicator__segment--current"
              aria-current="step"
            >
              <span className="usa-step-indicator__segment-label">
                Save and download CSV file{' '}
                <span className="usa-sr-only">— current step</span>
              </span>
            </li>
          </ol>
        </div>
        {/* End step indicator section  */}
        <form onSubmit={handleDownloadSubmit}>
          <h1>Download document</h1>
          {/* Start of the card section  */}
          <ul className="usa-card-group">
            <li className="usa-card tablet:grid-col-6 widescreen:grid-col-4">
              <div className="usa-card__container">
                <div className="usa-card__header">
                  <h2 className="usa-card__heading font-body-md">
                    File download
                  </h2>
                </div>
                <div className="usa-card__body">
                  {/* Start of the radio button section  */}
                  <fieldset className="usa-fieldset">
                    <legend className="usa-legend usa-legend">
                      File type is
                    </legend>
                    <div className="usa-radio">
                      <input
                        className="usa-radio__input"
                        id="download-file-type-csv"
                        type="radio"
                        name="download-file-type"
                        value="csv"
                        defaultChecked
                      />
                      <label
                        className="usa-radio__label"
                        htmlFor="download-file-type-csv"
                      >
                        CSV
                      </label>
                    </div>
                    <div className="usa-radio">
                      <input
                        className="usa-radio__input"
                        id="download-file-type-json"
                        type="radio"
                        name="download-file-type"
                        value="json"
                      />
                      <label
                        className="usa-radio__label"
                        htmlFor="download-file-type-json"
                      >
                        JSON
                      </label>
                    </div>
                  </fieldset>
                  {/* End radio button section  */}
                </div>
                <div className="usa-card__footer">
                  {/* Start button section  */}
                  <div>
                    {' '}
                    <button
                      id="download-button"
                      className="usa-button"
                      type="submit"
                    >
                      Download file
                    </button>
                  </div>
                  {/* End button section  */}
                </div>
              </div>
            </li>
          </ul>
          {/*  End card section  */}
        </form>
        <div id="preview-section">
          <h2 id="preview-section-title">File Preview</h2>
          <h3 id="preview-section-file-name">File name</h3>
          <div>{displayPreviewTable()}</div>
        </div>
      </div>
    </Layout>
  );
}
