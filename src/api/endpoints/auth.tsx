import { UserDto } from "@/types/api/user-dto";
import { AxiosError } from "axios";
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
  } catch (error : any) {
    const err = error as AxiosError;
    if(err.response?.status === 401 || err.response?.status === 400) {
      throw Error("Invalid credentials provided, Please verify.");
    } else if(err.response?.status === 500) {
      throw Error("Server error. Please try again later.");
    }
    else{
      throw Error("Internet error. Please ensure a stable internet connection before trying again." , );
    }
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