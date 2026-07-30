import { fetchCurrentUser, loginRequest } from "@/api/endpoints/auth";
import { registerLogoutHandler } from "@/auth/auth-event";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USERNAME } from "@/constants/constant-variables";
import { UserDto } from "@/types/api/user-dto";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  username: string;
  user: UserDto | null | undefined;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function encryptUsingAES256(text: string): string {
    const textToChars = (text: any) => text.split('').map((c: any) => c.charCodeAt(0));
    const byteHex = (n: any) => ('0' + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code: any) => textToChars("DOCYARDINFOTECH").reduce((a: any, b: any) => a ^ b, code);
    return text
        .split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<UserDto | null | undefined>(undefined);

  const loadUser = async (uname: string) => {
    try {
      const result = await fetchCurrentUser(uname);
      setUser(result);
    } catch {
      setUser(null);
    }
  };

   useEffect(() => {
    registerLogoutHandler(logout);
    (async () => {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const storedUsername = await SecureStore.getItemAsync(USERNAME);

      setIsLoggedIn(!!token);
      setUsername(storedUsername || "");

      if (token && storedUsername) {
        loadUser(storedUsername);
      }

      await setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    })();
  }, []);

   const login = async (username: string, password: string) => {
    try {
      const encryptedPassword = encryptUsingAES256(password);
      const { access_token : token, refresh_token : refreshToken } = await loginRequest({ username, password: encryptedPassword  });
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStore.setItemAsync(USERNAME, username);
      setIsLoggedIn(true);
      setUsername(username);
      loadUser(username);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USERNAME);
    setIsLoggedIn(false);
    setUsername("");
    setUser(undefined);
  };

  const reloadUser = async () => {
    if (username) {
      await loadUser(username);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, username, user, login, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};