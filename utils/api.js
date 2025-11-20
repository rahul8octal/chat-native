import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants?.expoConfig?.extra?.apiUrl ?? "";

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

// ----------------------
// MIDDLEWARE FUNCTION
// ----------------------
async function axiosMiddleware(method, url, data = {}, options = {}) {
  switch (method) {
    case "post":
      return apiClient.post(url, data, options);

    case "patch":
      return apiClient.patch(url, data, options);

    case "put":
      return apiClient.put(url, data, options);

    case "head":
      return apiClient.head(url, options);

    case "delete":
      // delete uses params
      return apiClient.delete(url, { data, ...options });

    default: // GET
      return apiClient.get(url, { params: data, ...options });
  }
}

// ----------------------
// EXPORT WRAPPER
// ----------------------
const api = {
  get: (url, data = {}, options = {}) => axiosMiddleware("get", url, data, options),
  post: (url, data = {}, options = {}) => axiosMiddleware("post", url, data, options),
  patch: (url, data = {}, options = {}) => axiosMiddleware("patch", url, data, options),
  put: (url, data = {}, options = {}) => axiosMiddleware("put", url, data, options),
  delete: (url, data = {}, options = {}) => axiosMiddleware("delete", url, data, options),
  head: (url, data = {}, options = {}) => axiosMiddleware("head", url, data, options),
};

export default api;
