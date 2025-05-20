import React, { useState } from 'react';
import { UpdateDocumentResponse } from '../../utils/api.ts';
import { generateCsvData } from './downloadPageController.ts';

export function useDownloadPage() {
  const [verifiedData] = useState<UpdateDocumentResponse>(() => {
    const storedData = sessionStorage.getItem('verifiedData');
    return storedData ? JSON.parse(storedData)?.updated_document : {};
  });

  function handleDownloadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!verifiedData.extracted_data) {
      console.error('No data available to download');
      return;
    }

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
      downloadCSV(verifiedData);
    } else {
      downloadJSON(verifiedData);
    }
  }

  return {
    handleDownloadSubmit,
    verifiedData,
  };
}

function downloadCSV(verifiedData: UpdateDocumentResponse) {
  const csvContent = generateCsvData(verifiedData.extracted_data ?? {});

  downloadData(csvContent, 'text/csv', 'document.csv');
}

function downloadJSON(verifiedData: UpdateDocumentResponse) {
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
