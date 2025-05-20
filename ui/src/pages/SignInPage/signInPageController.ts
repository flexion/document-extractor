import { CreateTokenResponse } from '../../utils/api.ts';

interface CallCreateTokenApiResponse {
  responseData?: CreateTokenResponse;
  failure?: string;
}

export async function callCreateTokenApi(
  username: string,
  password: string
): Promise<CallCreateTokenApiResponse> {
  try {
    const response = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      return { failure: "The email or password you've entered is wrong." };
    }

    const data = (await response.json()) as CreateTokenResponse;

    return { responseData: data };
  } catch (err) {
    if (err instanceof Error) {
      return { failure: err.message };
    } else {
      return { failure: 'An unexpected error occurred' };
    }
  }
}
