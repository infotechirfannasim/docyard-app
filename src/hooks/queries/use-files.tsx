import { archivalFile, archiveFile, copyFile, createFolder, fetchArchivalFiles, fetchFavouriteFiles, fetchFileLogs, fetchFiles, fetchHierarchy, fetchMetaData, fetchMetaDataList, fetchRecentFiles, fetchSharedByMefiles, fetchSharedWithMeFiles, fetchTrashFiles, fetchTypeFiles, moveFile, permanentDeleteFile, renameFile, restoreArchivalFiles, restoreArchivedFiles, searchFile, updateFavouriteFile, uploadFile, uploadFolder } from "@/api/endpoints/files";
import { CopyFileDto, CreateFileDto, FolderUploadDto, MoveFileDto, RenameFileDto } from "@/types/api/file-dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFiles(userId: number, folderId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["files", folderId],
    queryFn: () => fetchFiles(userId, folderId),
    enabled: !!userId && enabled, // only fetch if userId is provided and enabled is true
    
  });
}

export function useTypeFiles(userId: number, folderId: number, type: "video" | "doc" | "Image" | "other", enabled: boolean = true) {
  return useQuery({
    queryKey: ["files", type],
    queryFn: () => fetchTypeFiles(userId, folderId, type),
    enabled: !!userId && enabled, // only fetch if userId is provided and enabled is true
    
  });
}

export function useCreateFolder(){
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newFile: CreateFileDto) => createFolder(newFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] }); // auto-refetch affected lists
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
    }
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: number) => archiveFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });

    },
  });
}

export function useArchivalRestoreFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileIds: number[]) => restoreArchivalFiles(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
    },
  });
}

export function useArchivedRestoreFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileIds: number[]) => restoreArchivedFiles(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
    },
  });
}

export function usePermanentDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileIds: number[]) => permanentDeleteFile(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"]})

    },
  });
}

export function useCopyFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CopyFileDto) => copyFile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({queryKey: ["sharedByMeFiles"]});
      queryClient.invalidateQueries({queryKey: ["sharedWithMeFiles"]});
    },
  });
}

export function useMoveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MoveFileDto) => moveFile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({queryKey: ["sharedByMeFiles"]});
      queryClient.invalidateQueries({queryKey: ["sharedWithMeFiles"]});
    },
  });
}


export function useRecentFiles(userId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["recentFiles"],
    queryFn: () => fetchRecentFiles(userId),
    enabled: !!userId && enabled, // only fetch if userId is provided and enabled is true
  });
}

export function useFavouriteFiles(userId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["favouriteFiles"],
    queryFn: () => fetchFavouriteFiles(userId), // Assuming fetchFiles can take a third parameter for favourites
    enabled: !!userId && enabled, // only fetch if userId is provided and enabled is true
  });
}

export function useUpdateFavouriteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, value }: { fileId: number; value: boolean }) => updateFavouriteFile(fileId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
    },
  });
}

export function useRenameFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RenameFileDto) => renameFile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedWithMeFiles"] });
    },
  });
}

export function useFileLogs(folderId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["fileLogs", folderId],
    queryFn: () => fetchFileLogs(folderId),
    enabled: enabled,
  });
}

export function useTrashFiles(userId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["trashFiles"],
    queryFn: () => fetchTrashFiles(userId),
    enabled: !!userId && enabled, // only fetch if userId is provided and enabled is true
  });
}


export function useHierarchy(fileId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["hierarchy", fileId],
    queryFn: () => fetchHierarchy(fileId),
    enabled: !!fileId && enabled,
  });
}



export function useSharedByMeFiles(userId: number, folderId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sharedByMeFiles", folderId],
    queryFn: () => fetchSharedByMefiles(userId, folderId),
    enabled: !!userId && enabled,
  });
}

export function useSharedWithMeFiles(userId: number, folderId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sharedWithMeFiles", folderId],
    queryFn: () => fetchSharedWithMeFiles(userId, folderId),
    enabled: !!userId && enabled,
  });
}


export function useArchivalFiles(userId: number, folderId: number, enabled: boolean = true) {
  
  return useQuery({
    queryKey: ["archivalFiles"],
    queryFn: () => fetchArchivalFiles(userId, folderId),
    enabled: !!userId && enabled,
  });
}

export function useUpdateArchivalFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: number) => archivalFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
    },
  });
}

export function useMetaDataTemplates(enabled: boolean = true) {
  return useQuery({
    queryKey: ["metaDataTemplates"],
    queryFn: fetchMetaDataList,
    enabled,
  });
}

export function useMetaDataTemplateDetail(templateId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["metaDataTemplateDetail", templateId],
    queryFn: () => fetchMetaData(templateId!),
    enabled: !!templateId && enabled,
  });
}

export function useSearchFile(searchKey: string, userId: number) {
  return useQuery({
    queryKey: ["searchResults", searchKey],
    queryFn: () => searchFile(searchKey, userId),
    enabled: searchKey.length > 0 && userId > 0,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formData, activity, onProgress }: { formData: FormData; activity?: boolean; onProgress?: (pct: number) => void }) => uploadFile(formData, activity, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({queryKey: ["sharedByMeFiles"]});
      queryClient.invalidateQueries({queryKey: ["sharedWithMeFiles"]});
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"]})
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });

    },
  });
}

export function useUploadFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FolderUploadDto) => uploadFolder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"]})

    },
  });
}
