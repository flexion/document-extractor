import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  generateCsvData,
  downloadData,
  downloadCSV,
  downloadJSON,
} from './downloadPageController';
import { ExtractedData, UpdateDocumentResponse } from '../../utils/api';

const extractedData: ExtractedData = {
  bKey: { value: 'DogCow' },
  aKey: { value: 'Moof' },
  cKey: { value: undefined },
  dKey: { value: 'something with, commas' },
};

describe('generateCsvData', () => {
  it('sorts the entries', () => {
    const csvData = generateCsvData(extractedData);
    expect(csvData.indexOf('aKey')).toBeLessThan(csvData.indexOf('bKey'));
  });

  it('puts empty quotes for undefined values', () => {
    const csvData = generateCsvData(extractedData);
    expect(csvData).toContain('"cKey",""');
  });

  it('puts all the data from the extracted data in the CSV', () => {
    const csvData = generateCsvData(extractedData);
    expect(csvData).toContain('"aKey","Moof"');
    expect(csvData).toContain('"bKey","DogCow"');
    expect(csvData).toContain('"cKey",""');
    expect(csvData).toContain('"dKey","something with, commas"');
  });
});

describe('downloadData', () => {
  const mockRevokeObjectURL = vi.fn();
  const mockClick = vi.fn();

  const mockLink = {
    href: '',
    download: '',
    click: mockClick,
  };

  beforeEach(() => {
    const mockCreateElement = vi.fn();
    vi.stubGlobal('document', {
      createElement: mockCreateElement,
    });
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(),
      revokeObjectURL: mockRevokeObjectURL,
    });
    mockCreateElement.mockReturnValue(mockLink);
  });

  afterEach(() => {
    // Restore original globals
    vi.unstubAllGlobals();
  });

  it('download link is clicked', async () => {
    await downloadData('test content', 'text/plain', 'test.txt');

    expect(mockLink.download).toBe('test.txt');
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should revoke the object URL after download', async () => {
    vi.useFakeTimers();

    await downloadData('test content', 'text/plain', 'test.txt');

    expect(mockRevokeObjectURL).not.toHaveBeenCalled();

    // Fast-forward time to trigger the setTimeout callback
    vi.advanceTimersByTime(1000);

    expect(mockRevokeObjectURL).toHaveBeenCalled();

    vi.useRealTimers();
  });
});

// describe('downloadCSV', () => {
//   const mockVerifiedData: UpdateDocumentResponse = {
//     extracted_data: extractedData,
//     document_id: 'test-id',
//   };
//
//   beforeEach(() => {
//     // Reset mock function calls
//     vi.clearAllMocks();
//   });
//
//   it('should call downloadData with correct parameters', async () => {
//     // Create a mock for downloadData
//     const mockDownloadDataFn = vi.fn();
//
//     vi.mock('./downloadPageController', async(importOriginal) => {
//       // Import the original module
//       const actual = await importOriginal();
//
//       // Return a modified module object
//       return {
//         ...actual, // Keep all original exports
//         downloadData: vi.fn(), // Override fetchData
//       };
//     });
//
//     try {
//       await downloadCSV(mockVerifiedData);
//
//       // Check that downloadData was called with the right parameters
//       expect(mockDownloadDataFn).toHaveBeenCalledWith(
//         expect.any(String),
//         'text/csv',
//         'document.csv'
//       );
//     } finally {
//       // Restore the original function
//     }
//   });
//
//   it('should handle undefined extracted_data', async () => {
//     const dataWithoutExtracted: UpdateDocumentResponse = {
//       document_id: 'test-id',
//     };
//
//     // Create a mock for downloadData
//     const originalDownloadData = downloadData;
//     const mockDownloadDataFn = vi.fn();
//
//     // Replace the real function with our mock just for this test
//     vi.spyOn(globalThis, 'downloadData').mockImplementation(mockDownloadDataFn);
//
//     try {
//       await downloadCSV(dataWithoutExtracted);
//
//       // Check that downloadData was called
//       expect(mockDownloadDataFn).toHaveBeenCalled();
//
//       // The first argument should be the CSV content with just the header
//       expect(mockDownloadDataFn).toHaveBeenCalledWith(
//         expect.stringContaining('Field,Value'),
//         'text/csv',
//         'document.csv'
//       );
//     } finally {
//       // Restore the original function
//       vi.spyOn(global, 'downloadData').mockRestore();
//     }
//   });
// });
//
// describe('downloadJSON', () => {
//   const mockVerifiedData: UpdateDocumentResponse = {
//     extracted_data: extractedData,
//     document_id: 'test-id',
//   };
//
//   beforeEach(() => {
//     // Reset mock function calls
//     vi.clearAllMocks();
//   });
//
//   it('should stringify the data correctly', async () => {
//     // Spy on JSON.stringify
//     const stringifySpy = vi.spyOn(JSON, 'stringify');
//
//     // Create a mock for downloadData to prevent actual download
//     const mockDownloadDataFn = vi.fn();
//     vi.spyOn(global, 'downloadData').mockImplementation(mockDownloadDataFn);
//
//     try {
//       await downloadJSON(mockVerifiedData);
//
//       expect(stringifySpy).toHaveBeenCalledWith(mockVerifiedData, null, 2);
//     } finally {
//       stringifySpy.mockRestore();
//       vi.spyOn(global, 'downloadData').mockRestore();
//     }
//   });
//
//   it('should call downloadData with correct parameters', async () => {
//     // Create a mock for downloadData
//     const mockDownloadDataFn = vi.fn();
//
//     // Replace the real function with our mock just for this test
//     vi.spyOn(global, 'downloadData').mockImplementation(mockDownloadDataFn);
//
//     try {
//       await downloadJSON(mockVerifiedData);
//
//       // Check that downloadData was called with the right parameters
//       expect(mockDownloadDataFn).toHaveBeenCalledWith(
//         expect.any(String),
//         'application/json',
//         'document.json'
//       );
//     } finally {
//       // Restore the original function
//       vi.spyOn(global, 'downloadData').mockRestore();
//     }
//   });
// });
