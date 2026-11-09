const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(
        `Unable to connect to the backend at ${API_BASE_URL}. Start the FastAPI server or enable demo mode with VITE_USE_MOCK_DATA=true.`,
        0,
        error
      );
    }
    throw error;
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(
      `API Error (${response.status}): ${response.statusText}`,
      response.status,
      errorData
    );
  }

  // Handle blob responses (for PDF reports)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/pdf')) {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}
