import { useAuth } from "@/context/auth-context";
import { useDepartments } from "./queries/use-files";
import { useAllUsers } from "./queries/use-user";

export function useAppInitializer() {
    const { isLoggedIn, isLoading } = useAuth();
    const isReady = !isLoading && isLoggedIn;

    useAllUsers(isReady);
    useDepartments(isReady);

}