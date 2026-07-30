import { triggerLogout } from "@/auth/auth-event";
import { AUTH_TOKEN_KEY } from "@/constants/constant-variables";
import NetInfo from "@react-native-community/netinfo";
import axios, { AxiosError } from "axios";
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // move to env config, see below
const API_BASIC_AUTH = process.env.EXPO_PUBLIC_API_BASIC_AUTH; // move to env config, see below

export const apiClient = axios.create({
  // baseURL: `127.0.0.1:8000`,
  baseURL: `${API_BASE_URL}`,
  timeout: 10000,
});

// Attach auth token automatically to every request
apiClient.interceptors.request.use(async (config) => {
    const netState = await NetInfo.fetch();
    console.log("Network state: ", netState.isConnected);
    if (!netState.isConnected) {
      console.log("No internet connection. Please check your network.");
      return Promise.reject(new Error("No internet connection. Please check your network."));
    }
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
  (response) => {
    const body = response.data;
    if (body && body["message"] && !body["data"]) {
      return Promise.reject({ response: { data: { message: body["message"] } } });
    }
    return response;
  },
  (error: AxiosError) => {
    console.log("API Error: ", error);
    if (error.response?.status === 401) {
      triggerLogout();
    }
    return Promise.reject(error);
  }
);


export async function getStoredAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}