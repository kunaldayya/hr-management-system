import axios, { type AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({
  baseURL: 'https://localhost:7169',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically clear stale token on 401 so the user gets redirected to login
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);

// Orval 8 passes headers as AxiosHeaders which is incompatible with HeadersInit.
// We type headers as `any` to accommodate both Axios and Fetch header shapes.
export const axiosInstance = <T>(
  url: string,
  config: AxiosRequestConfig & { body?: any; headers?: any }
): Promise<T> => {
  const token = localStorage.getItem('accessToken');

  // Extract body and map it to data for Axios
  const { body, headers, ...restConfig } = config;
  const requestData = typeof body === 'string' ? JSON.parse(body) : body;

  return AXIOS_INSTANCE({
    url,
    ...restConfig,
    data: requestData,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then((response) => response.data);
};