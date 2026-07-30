import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isLoggedIn ? "/(drawer)/(tabs)/home" as any : "/login");
  }, [isLoggedIn, isLoading]);

  return null;
}
