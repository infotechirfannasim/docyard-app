import { fetchCurrentUser } from "@/api/endpoints/auth";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser(username: string){
    const { isLoggedIn } = useAuth();
    
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: () => fetchCurrentUser(username),
        enabled: isLoggedIn, // only fetch if logged in
    })
}