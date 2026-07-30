// hooks/queries/use-recent-files-for-current-user.ts

import { useAuth } from "@/context/auth-context";
import { useArchivalFiles, useFavouriteFiles, useFiles, useRecentFiles, useSharedByMeFiles, useSharedWithMeFiles, useTrashFiles } from "./use-files";

export function useGetFilesData(
  fileType: "recent" | "favourite" | "trash" | "document-library" | "share-by-me" | "share-to-me" | "archival",
  fileId?: number | undefined,
) {
  const { user, isLoading: isUserLoading } = useAuth();
  
  const userId = user?.id;

  // Call every hook unconditionally, gate each with `enabled` inside the hook itself
  const recent = useRecentFiles(userId!,  fileType === "recent" && !!userId,);
  const favourite = useFavouriteFiles(userId!,  fileType === "favourite" && !!userId );
  const trash = useTrashFiles(userId!,  fileType === "trash" && !!userId );
  const library = useFiles(userId!, fileId ? Number(fileId) : 0, 
    fileType === "document-library" && !!userId,
  );
  const sharedByMe = useSharedByMeFiles(userId!, fileId ? Number(fileId) : 0,
    fileType === "share-by-me" && !!userId,
  );
  const sharedWithMe = useSharedWithMeFiles(userId!, fileId ? Number(fileId) : 0,
    fileType === "share-to-me" && !!userId,
  );
  const archival = useArchivalFiles(userId!, fileId ? Number(fileId) : 0,
  fileType === "archival" && !!userId,
  );


  const active =
    fileType === "recent" ? recent :
    fileType === "favourite" ? favourite :
    fileType === "trash" ? trash :
    fileType === "document-library" ? library :
    fileType === "share-by-me" ? sharedByMe :
    fileType === "share-to-me" ? sharedWithMe :
    fileType === "archival" ? archival :
    undefined;

  return {
    files: active?.data ?? [],
    isFilesLoading: (active?.isFetching ?? false) || isUserLoading,
    isFilesPending: (active?.isFetching ?? false) || isUserLoading,
    user,
    isUserLoading,
    error: active?.error ?? (user === null ? new Error("Could not load user. Please check your connection.") : null),
  };
}