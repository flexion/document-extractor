export interface CreateTokenResponse {
  access_token: string;
  token_type: string;
}

export interface NewDocumentResponse {
  message: string;
  documentId: string;
}

export interface GetDocumentResponse {
  document_id: string;
  status: string;
  document_key?: string;
  document_type?: string;
  extracted_data?: ExtractedData;
  signed_url?: string;
  base64_encoded_file?: string;
}

export interface ExtractedData {
  [key: string]: FieldData;
}

export interface FieldData {
  value?: string;
  confidence?: string;
}

export interface UpdateDocumentResponse {
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
