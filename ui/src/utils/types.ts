export interface FieldData {
  value?: string;
  confidence?: string;
}

export interface ExtractedData {
  [key: string]: FieldData;
}

export interface VerifiedData {
  extracted_data?: ExtractedData;
  [key: string]: any;
}
