import { UserDto } from "@/types/api/user-dto";
import { apiClient } from "../client";

type loginRequest = {
  username: string;
  password: string;
}

type loginResponse = {
    access_token: string,
    refresh_token: string,
    scope: string,
    token_type: string,
    expires_in: number,
}

export async function loginRequest(request: loginRequest): Promise<loginResponse> {
  try {
    console.log("url", apiClient.defaults.baseURL + "/auths/oauth/token");
    const { data } = await apiClient.post("/auths/oauth/token", {}, { params:  {username: request.username, password: request.password, grant_type: "password"}} );
    console.log("Login request successful: ", data);
    return data;
  } catch (error) {
    console.log("Login request failed: ", error);
    throw new Error("Failed to login");
  }
}

export async function fetchCurrentUser(username: string): Promise<UserDto> {
  console.log("Fetching current user for username: ", username);
  if(!username) {
    throw new Error("Username is required to fetch current user");
  }
  const { data } = await apiClient.post(`/um/auth/sign-in/${username}`);
  return data;
}