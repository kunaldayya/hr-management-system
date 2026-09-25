import axios, { type AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({
  baseURL: 'https://localhost:7169',
  withCredentials: true, // This tells the browser to send the HttpOnly cookies!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Redirect to login on 401 Unauthorized
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const axiosInstance = <T>(
  url: string,
  config: AxiosRequestConfig & { body?: any; headers?: any }
): Promise<T> => {
  const { body, headers, ...restConfig } = config;
  const requestData = typeof body === 'string' ? JSON.parse(body) : body;

  return AXIOS_INSTANCE({
    url,
    ...restConfig,
    data: requestData,
    headers: {
      ...headers,
      // REMOVED the manual Bearer token injection
    },
  }).then((response) => response.data);
};