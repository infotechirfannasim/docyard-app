import { loginRequest } from "@/api/endpoints/auth";
import { registerLogoutHandler } from "@/auth/auth-event";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USERNAME } from "@/constants/constant-variables";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  username: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function encryptUsingAES256(text: any): string {
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

   useEffect(() => {
    registerLogoutHandler(logout); // register once, so the interceptor can call it later
    (async () => {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const username = await SecureStore.getItemAsync(USERNAME);

      setIsLoggedIn(!!token);
      setIsLoading(false);
      setUsername(username || "");
    })();
  }, []);


   const login = async (username: string, password: string) => {
    const encryptedPassword = encryptUsingAES256(password);
    const { access_token : token, refresh_token : refreshToken } = await loginRequest({ username, password: encryptedPassword  });
    console.log("Token received: ", token);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    await SecureStore.setItemAsync(USERNAME, username);
    setIsLoggedIn(true);
    setUsername(username);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USERNAME);
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, username, login, logout }}>
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