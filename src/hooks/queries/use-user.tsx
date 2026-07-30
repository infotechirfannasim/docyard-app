import { fetchCurrentUser } from "@/api/endpoints/auth";
import { fetchAllUsers } from "@/api/endpoints/files";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser(username: string){
    const { isLoggedIn } = useAuth();
    
    return useQuery({
        queryKey: ["currentUser", username],
        queryFn: () => fetchCurrentUser(username),
        enabled: isLoggedIn,
        gcTime: Infinity,
    })
}

export function useAllUsers(enabled: boolean = true) {
    return useQuery({
        queryKey: ["allUsers"],
        queryFn: fetchAllUsers,
        enabled,
    });
}