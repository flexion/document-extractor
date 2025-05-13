import { describe, expect, it } from '@jest/globals';

import { generateCsvData } from './downloadPageController';

const extractedData = {
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
