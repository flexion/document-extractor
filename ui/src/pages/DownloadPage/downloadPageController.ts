import { ExtractedData } from '../../utils/api';

export function generateCsvData(extractedData: ExtractedData): string {
  let csvData = 'Field,Value\n';

  const sortedEntries = Object.entries(extractedData).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB, undefined, { numeric: true })
  );

  // Construct CSV content
  sortedEntries.forEach(([key, field]) => {
    let value = field.value !== undefined ? `"${field.value}"` : '""';
    csvData += `"${key}",${value}\n`;
  });

  return csvData;
}
