export interface NewDocumentResponse {
  message: string;
  documentId: string;
}

export interface FieldData {
  value?: string;
  confidence?: string;
}

export interface ExtractedData {
  [key: string]: FieldData;
}

export interface VerifiedData {
  extracted_data?: ExtractedData;
  [key: string]: unknown;
}

export async function authorizedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = sessionStorage.getItem('auth_token');

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  return await fetch(url, fetchOptions);
}
