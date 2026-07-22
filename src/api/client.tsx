import { triggerLogout } from "@/auth/auth-event";
import { AUTH_TOKEN_KEY } from "@/constants/constant-variables";
import axios, { AxiosError } from "axios";
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // move to env config, see below
const API_BASIC_AUTH = process.env.EXPO_PUBLIC_API_BASIC_AUTH; // move to env config, see below

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach auth token automatically to every request
apiClient.interceptors.request.use(async (config) => {
    const token = await getStoredAuthToken(); 
  if (token) {
    config.headers.Authorization = `bearer ${token}`;
  }
  else{
    
    console.log("No token found, using basic auth"  , API_BASIC_AUTH);
    config.headers.Authorization = `Basic ${API_BASIC_AUTH}`; // Replace with actual token retrieval logic
  }
  return config;
});

// Handle expired/invalid tokens globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.log("API error: ", error.response?.status, error.response?.data, error.response?.config.url);
    if (error.response?.status === 401) {
      console.log("Unauthorized access - token might be invalid or expired. Logging out the user.");
      triggerLogout();
    }
    return Promise.reject(error);
  }
);


async function getStoredAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}