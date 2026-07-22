import { CopyFileDto, CreateFileDto, FileDto, FileLogsDto, FolderUploadDto, MetaDataTemplateDto, MetaDataTemplateListDto, MoveFileDto, RenameFileDto } from "@/types/api/file-dto";
import { apiClient } from "../client";



export async function fetchFiles(userId: number, folderId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/owner/${userId}`, { params: { folderId, archived: false, archival: false, onlyParentVersion: true } });
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return (data["data"] as FileDto[]).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()) ?? [];
}

export async function fetchTypeFiles(userId: number, folderId: number, type: "video" | "doc" | "Image" | "other"): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/owner/${userId}/type/${type}/`, { params: { folderId, archived: false, archival: false, onlyParentVersion: true } });
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return (data["data"] as FileDto[]).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()) ?? [];
}


export async function fetchSharedByMefiles(userId: number, folderId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/shared-by-me/user/${userId}`, { params: { folderId } });
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return (data["data"] as FileDto[]).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()) ?? [];
}

export async function fetchSharedWithMeFiles(userId: number, folderId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/shared-with-me/user/${userId}`, { params: { folderId } });
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return (data["data"] as FileDto[]).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()) ?? [];
}

export async function fetchArchivalFiles(userId: number, folderId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/archival/owner/${userId}`, { params: { folderId } });
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return (data["data"] as FileDto[]).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()) ?? [];
}

export async function fetchFileLogs(folderId: number): Promise<FileLogsDto[]> {
  const { data } = await apiClient.get(`/dl/dl-doc-activity/logs/${folderId}`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] as FileLogsDto[];
}

export async function createFolder(newFile: CreateFileDto): Promise<FileDto[]> {
  const { data } = await apiClient.post(`/dl/dl-document/folder`, newFile);
  return data["data"] ?? [];
}

export async function moveFile(moveFile: MoveFileDto): Promise<FileDto[]> {
  const { data } = await apiClient.put(`/dl/dl-document/move-to`, moveFile);
  return data["data"] ?? [];
}

export async function copyFile(copyFile: CopyFileDto): Promise<FileDto[]> {
  const { data } = await apiClient.put(`/dl/dl-document/copy-to`, copyFile);
  return data["data"] ?? [];
}



export async function renameFile(renameFile: RenameFileDto): Promise<FileDto[]> {
  const { data } = await apiClient.put(`/dl/dl-document/rename/`, renameFile);
  return data["data"] ?? [];
}

export async function fetchRecentFiles(userId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/recent/owner/${userId}`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function fetchFavouriteFiles(userId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/favourite/owner/${userId}`, { params: { folderId: 0, archived: false } });
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function fetchTrashFiles(userId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/trash/owner/${userId}`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}
export async function fetchHierarchy(fileId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/hierarchy/${fileId}`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}
// Temp delete
export async function archiveFile(fileId: number): Promise<void> {
  await apiClient.put(`/dl/dl-document/archive/${fileId}?archive=true`);
}

// Archive File
export async function archivalFile(fileId: number): Promise<void> {
  await apiClient.put(`/dl/dl-document/archival/${fileId}?archival=true`);
}

// Restore from trash
export async function restoreArchivedFiles(fileIds: number[]): Promise<void> {
  await apiClient.put(`/dl/dl-document/restore-archived`, { "dlDocumentIds": fileIds  });
}

// Restore from archive
export async function restoreArchivalFiles(fileIds: number[]): Promise<void> {
  await apiClient.put(`/dl/dl-document/restore-archival`, { "dlDocumentIds": fileIds  });
}


export async function permanentDeleteFile(fileIds: number[]): Promise<string> {
  const { data } = await apiClient.delete(`/dl/dl-document/delete`, { data: { dlDocumentIds: fileIds } });
  return data["message"] ?? "";
}

export async function updateFavouriteFile(fileId: number, value: boolean): Promise<void> {
  await apiClient.put(`/dl/dl-document/${fileId}/?favourite=${value}`);
}

export async function fetchMetaDataList(): Promise<MetaDataTemplateListDto[]> {
  const { data } = await apiClient.get(`/config/metadata-temp/`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}


export async function fetchMetaData(dataId: number): Promise<MetaDataTemplateDto[]> {
  const { data } = await apiClient.get(`/config/metadata-temp/${dataId}`);
  return data["data"];
}

export async function uploadFile(formData: FormData, activity?: boolean, onProgress?: (progress: number) => void): Promise<any> {
  console.log("Uploading file with formData:", formData.getAll("doc"), "reqObj", formData.getAll("reqObj"));
  const queryParams = activity !== undefined ? `?activity=${activity}` : '';
  const { data } = await apiClient.post(`/dl/dl-document/upload${queryParams}`, formData, {
    timeout: 120000,
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
}

export async function uploadFolder(payload: FolderUploadDto): Promise<any> {
  const { data } = await apiClient.post(`/dl/dl-document/folder/upload?activity=true`, payload);
  return data;
}