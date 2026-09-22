import axios, { type AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({
  baseURL: 'https://localhost:7169',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosInstance = <T>(
  url: string,
  config: AxiosRequestConfig & { body?: any }
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