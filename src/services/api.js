const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED';

export const getApiUrl = path => `${API_BASE_URL}${path}`;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiRequest = async (path, options = {}) => {
  const {
    token,
    fetchImplementation = fetch,
    body,
    headers = {},
    ...requestOptions
  } = options;

  const requestHeaders = { ...headers };
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetchImplementation(getApiUrl(path), {
      ...requestOptions,
      headers: requestHeaders,
      ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) })
    });
  } catch (error) {
    throw new ApiError('Unable to connect to the server.', 0);
  }

  const contentType = response.headers?.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(`The server returned an unexpected response (${response.status}).`, response.status);
    }
    throw new ApiError('The server returned an unexpected response.', response.status);
  }

  const data = await response.json();
  if (!response.ok) {
    const error = new ApiError(data.error || 'The request failed.', response.status);
    if (response.status === 401) error.code = AUTH_TOKEN_EXPIRED;
    throw error;
  }
  return data;
};

export default apiRequest;
