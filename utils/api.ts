import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import Constants from "expo-constants";

const API_URL: string = Constants?.expoConfig?.extra?.apiUrl ?? "";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// ----------------------
// ADD TOKEN AUTOMATICALLY
// ----------------------
apiClient.interceptors.request.use(async (config) => {
  const updatedConfig = { ...config };
  const token = await AsyncStorage.getItem("token");

  if (token) {
    updatedConfig.headers = updatedConfig.headers ?? {};
    updatedConfig.headers.Authorization = `Bearer ${token}`;
  }

  // Allow FormData uploads
  if (updatedConfig.data instanceof FormData) {
    updatedConfig.headers = updatedConfig.headers ?? {};
    updatedConfig.headers["Content-Type"] = "multipart/form-data";
  }

  return updatedConfig;
});

// ----------------------
// HANDLE ERRORS
// ----------------------
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    console.log("API ERROR:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
    }

    throw error;
  }
);

type HttpMethod = "get" | "post" | "patch" | "put" | "delete" | "head";
type Payload = unknown;

// ----------------------
// MIDDLEWARE FUNCTION
// ----------------------
async function AxiosMiddleware<T = unknown>(
  method: HttpMethod,
  url: string,
  data: Payload = {},
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
  switch (method) {
    case "post":
      return apiClient.post<T>(url, data, options);

    case "patch":
      return apiClient.patch<T>(url, data, options);

    case "put":
      return apiClient.put<T>(url, data, options);

    case "head":
      return apiClient.head<T>(url, options);

    case "delete":
      // delete uses params
      return apiClient.delete<T>(url, { data, ...options });

    default: // GET
      return apiClient.get<T>(url, { params: data, ...options });
  }
}

// ----------------------
// EXPORT WRAPPER
// ----------------------
const api = {
  get: <T = unknown>(url: string, data: Payload = {}, options: AxiosRequestConfig = {}) =>
    AxiosMiddleware<T>("get", url, data, options),

  post: <T = unknown>(url: string, data: Payload = {}, options: AxiosRequestConfig = {}) =>
    AxiosMiddleware<T>("post", url, data, options),

  patch: <T = unknown>(url: string, data: Payload = {}, options: AxiosRequestConfig = {}) =>
    AxiosMiddleware<T>("patch", url, data, options),

  put: <T = unknown>(url: string, data: Payload = {}, options: AxiosRequestConfig = {}) =>
    AxiosMiddleware<T>("put", url, data, options),

  delete: <T = unknown>(url: string, data: Payload = {}, options: AxiosRequestConfig = {}) =>
    AxiosMiddleware<T>("delete", url, data, options),

  head: <T = unknown>(url: string, data: Payload = {}, options: AxiosRequestConfig = {}) =>
    AxiosMiddleware<T>("head", url, data, options),
};

export default api;
