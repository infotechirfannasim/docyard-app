import { archivalFile, archiveFile, changePassword, checkInFile, checkOutFile, copyFile, createFileComment, createFileTag, createFolder, createShare, createStorageRequest, deleteComment, deleteFileTag, deleteShare, deleteSharedUserData, fetchArchivalFiles, fetchDepartments, fetchDocumentActivity, fetchFavouriteFiles, fetchFileComments, fetchFileLogs, fetchFiles, fetchFileTags, fetchFileVersion, fetchHierarchy, fetchLargeFiles, fetchMetaData, fetchMetaDataList, fetchProcessDefinition, fetchProcessDefinitionXML, fetchRarelyUsedFiles, fetchRecentFiles, fetchSharedByMefiles, fetchSharedUserData, fetchSharedWithMeFiles, fetchTrashFiles, fetchTypeFiles, fetchWorkflowList, forgotPassword, moveFile, permanentDeleteFile, renameFile, restoreArchivalFiles, restoreArchivedFiles, searchFile, startAutomate, updateComment, updateFavouriteFile, updateSharedUserData, uploadFile, uploadFileRNFS, uploadFileVersionRNFS, uploadFolder, uploadProfilePicture, type RNFSUploadParams } from "@/api/endpoints/files";
import { CopyFileDto, CreateFileCommentDto, CreateFileDto, CreateFileTagDto, DocumentActivityDto, FileDto, FolderUploadDto, MoveFileDto, RenameFileDto, SharePayloadDto, UpdateFileCommentDto } from "@/types/api/file-dto";
import { StorageRequestDto } from "@/types/api/storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

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

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["Creating folder..."],
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
    mutationKey: ["Moving to trash..."],
    mutationFn: (fileId: number) => archiveFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["fileVersions"] });
      queryClient.invalidateQueries({ queryKey: ["rarelyUsedFiles"] });
      queryClient.invalidateQueries({ queryKey: ["largeFiles"] });

    },
  });
}

export function useArchivalRestoreFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Restoring from archival..."],
    mutationFn: (fileIds: number[]) => restoreArchivalFiles(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useArchivedRestoreFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Restoring..."],
    mutationFn: (fileIds: number[]) => restoreArchivedFiles(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["fileVersions"] });
      queryClient.invalidateQueries({ queryKey: ["rarelyUsedFiles"] });
      queryClient.invalidateQueries({ queryKey: ["largeFiles"] });
    },
  });
}

export function usePermanentDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Deleting permanently..."],
    mutationFn: (fileIds: number[]) => permanentDeleteFile(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
      queryClient.invalidateQueries({ queryKey: ["fileVersions"] })

    },
  });
}

export function useCopyFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Copying..."],
    mutationFn: (payload: CopyFileDto) => copyFile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedWithMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useMoveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Moving..."],
    mutationFn: (payload: MoveFileDto) => moveFile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedWithMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
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
    mutationKey: ["Updating favourite..."],
    mutationFn: ({ fileId, value }: { fileId: number; value: boolean }) => updateFavouriteFile(fileId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useRenameFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Renaming..."],
    mutationFn: (payload: RenameFileDto) => renameFile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedWithMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["fileVersions"] });
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

export function useFileVersions(fileId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["fileVersions", fileId],
    queryFn: () => fetchFileVersion(fileId),
    enabled: !!fileId && enabled,
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
    mutationKey: ["Archiving..."],
    mutationFn: (fileId: number) => archivalFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
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
    mutationKey: ["Uploading..."],
    mutationFn: (params: { formData: FormData; activity?: boolean; onProgress?: (pct: number) => void } | RNFSUploadParams) => {
      if ('fileUri' in params) {
        return uploadFileRNFS(params);
      }
      return uploadFile(params.formData, params.activity, params.onProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedWithMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });

    },
  });
}

export function useUploadFileVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Uploading version..."],
    mutationFn: (params: RNFSUploadParams) => uploadFileVersionRNFS(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileVersions"] });
    },
  });
}

export function useUploadFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Uploading folder..."],
    mutationFn: (payload: FolderUploadDto) => uploadFolder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })

    },
  });
}

export function useWorkflowList(fileId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["workflowList", fileId],
    queryFn: () => fetchWorkflowList(fileId),
    enabled: !!fileId && enabled,
  });
}

export function useFileTags(fileId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["fileTags", fileId],
    queryFn: () => fetchFileTags(fileId),
    enabled: !!fileId && enabled,
  });
}

export function useSharedUserData(fileId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["fileShare", fileId],
    queryFn: () => fetchSharedUserData(fileId),
    enabled: !!fileId && enabled,
  });
}

export function useFileComments(fileId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["fileComments", fileId],
    queryFn: () => fetchFileComments(fileId),
    enabled: !!fileId && enabled,
  });
}

export function useCreateFileTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Adding tag..."],
    mutationFn: (payload: CreateFileTagDto) => createFileTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileTags"] });
    },
  });
}

export function useDeleteFileTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Removing tag..."],
    mutationFn: ({ tagId, userId }: { tagId: number; userId: number }) => deleteFileTag(tagId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileTags"] });
    },
  });
}

export function useCreateFileComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Adding comment..."],
    mutationFn: (payload: CreateFileCommentDto) => createFileComment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileComments"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Updating comment..."],
    mutationFn: (payload: UpdateFileCommentDto) => updateComment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileComments"] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Deleting comment..."],
    mutationFn: (fileId: number) => deleteComment(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileComments"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
    },
  });
}

export function useCheckInFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Checking in..."],
    mutationFn: ({ fileId, userId }: { fileId: number; userId: number }) => checkInFile(fileId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
    },
  });
}

export function useCheckOutFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Checking out..."],
    mutationFn: ({ fileId, userId }: { fileId: number; userId: number }) => checkOutFile(fileId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
    },
  });
}

export function useProcessDefinitions(enabled: boolean = true) {
  return useQuery({
    queryKey: ["processDefinitions"],
    queryFn: fetchProcessDefinition,
    enabled,
  });
}

export function useStartAutomate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Starting workflow..."],
    mutationFn: ({ processKey, payload }: { processKey: string; payload: FileDto }) =>
      startAutomate(processKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowList"] });
    },
  });
}

export function useProcessDefinitionXML(processDefId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["processDefinitionXML", processDefId],
    queryFn: () => fetchProcessDefinitionXML(processDefId!),
    enabled: !!processDefId && enabled,
  });
}

export function useCreateShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Sharing..."],
    mutationFn: (payload: SharePayloadDto) => createShare(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileShare"] });
       queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });

    },
  });
}

export function useDeleteShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Removing share..."],
    mutationFn: (payload: SharePayloadDto) => deleteShare(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileShare"] });
       queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["recentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["archivalFiles"] });
      queryClient.invalidateQueries({ queryKey: ["sharedByMeFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
    },
  });
}

export function useUpdateSharedUserData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Updating access..."],
    mutationFn: ({ fileId, dlCollId, access }: { fileId: number; dlCollId: number; access: string }) =>
      updateSharedUserData(fileId, dlCollId, access),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileShare"] });
    },
  });
}

export function useDeleteSharedUserData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["Removing user..."],
    mutationFn: ({ fileId, dlCollId }: { fileId: number; dlCollId: number }) =>
      deleteSharedUserData(fileId, dlCollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileShare"] });
    },
  });
}

export function useDepartments(enabled: boolean = true) {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    enabled,
  });
}

export function useLargeFiles(userId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["largeFiles", userId],
    queryFn: () => fetchLargeFiles(userId),
    enabled: !!userId && enabled,
  });
}

export function useRarelyUsedFiles(userId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["rarelyUsedFiles", userId],
    queryFn: () => fetchRarelyUsedFiles(userId),
    enabled: !!userId && enabled,
  });
}

export function useDocumentActivity(userId: number, enabled: boolean = true) {
  const [page, setPage] = useState(1);
  const [allActivities, setAllActivities] = useState<DocumentActivityDto[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const loadingRef = useRef(false);

  const { data, isFetching } = useQuery({
    queryKey: ["documentActivity", userId, page, resetKey],
    queryFn: () => fetchDocumentActivity(userId, page),
    enabled: !!userId && enabled,
  });

  useEffect(() => {
    if (data) {
      setAllActivities((prev) => {
        if (page === 1) return data;
        return [...prev, ...data];
      });
      loadingRef.current = false;
    }
  }, [data]);

  const loadMore = useCallback(() => {
    if (data?.length === 10 && !isFetching && !loadingRef.current) {
      loadingRef.current = true;
      setPage((p) => p + 1);
    }
  }, [data, isFetching]);

  const reset = useCallback(() => {
    setPage(1);
    setAllActivities([]);
    loadingRef.current = false;
    setResetKey((k) => k + 1);
  }, []);

  return {
    activities: allActivities,
    isLoading: isFetching && page === 1,
    isLoadingMore: isFetching && page > 1,
    loadMore,
    reset,
    hasMore: data?.length === 10,
  };
}

export function useUploadProfilePicture() {
  return useMutation({
    mutationFn: (formData: FormData) => uploadProfilePicture(formData),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword, userId }: { currentPassword: string; newPassword: string; userId: number }) =>
      changePassword(currentPassword, newPassword, userId),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useCreateStorageRequest() {
  return useMutation({
    mutationFn: (payload: StorageRequestDto) => createStorageRequest(payload),
  });
}