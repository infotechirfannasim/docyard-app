import { AutomateResponseDto, CopyFileDto, CreateFileCommentDto, CreateFileDto, CreateFileTagDto, DepartmentDto, DocumentActivityDto, FileCommentDto, FileDto, FileLogsDto, FileTagDto, FolderUploadDto, MetaDataTemplateDto, MetaDataTemplateListDto, MoveFileDto, ProcessDefinitionDto, RenameFileDto, ShareDto, SharedUserDto, SharePayloadDto, UpdateFileCommentDto, WorkFlowDto } from "@/types/api/file-dto";
import { StorageRequestDto } from "@/types/api/storage";
import { UserDto } from "@/types/api/user-dto";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { apiClient, getStoredAuthToken } from "../client";

export type RNFSUploadParams = {
  fileUri: string;
  fileName: string;
  fileType: string;
  reqObj: Record<string, any>;
  activity?: boolean;
  onProgress?: (pct: number) => void;
};



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
  const result = data["data"];
  return result ? (Array.isArray(result) ? result : [result]) : [];
}

export async function uploadFile(formData: FormData, activity?: boolean, onProgress?: (progress: number) => void): Promise<any> {
  console.log("Uploading file with formData:", formData.getAll("doc"), "reqObj", formData.getAll("reqObj"));
  const queryParams = activity !== undefined ? `?activity=${activity}` : '';
  const { data } = await apiClient.post(`/dl/dl-document/upload${queryParams}`, formData, {
    timeout: 120000,
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.min(100, Math.round((e.loaded * 100) / e.total)));
    },
  });
  console.log('Upload response:', JSON.stringify(data, null, 2));
  return data;
}

export async function uploadProfilePicture(formData: FormData, activity?: boolean, onProgress?: (progress: number) => void): Promise<any> {
  const { data } = await apiClient.put(`/um/user/profile-picture`, formData, {
    timeout: 120000,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.min(100, Math.round((e.loaded * 100) / e.total)));
    },
  });
  return data;
}


export async function uploadFileVersion(formData: FormData, onProgress?: (progress: number) => void): Promise<any> {
  const { data } = await apiClient.post(`/dl/doc-version/upload`, formData, {
    timeout: 120000,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.min(100, Math.round((e.loaded * 100) / e.total)));
    },
  });
  return data;
}

export async function uploadFileVersionRNFS(params: RNFSUploadParams): Promise<any> {
  const { fileUri, fileName, fileType, reqObj, onProgress } = params;
  const safeName = fileName.replace(/ /g, '_');
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const token = await getStoredAuthToken();
  const authHeader = token ? `Bearer ${token}` : `Basic ${process.env.EXPO_PUBLIC_API_BASIC_AUTH}`;

  const reqObjUri = FileSystem.cacheDirectory + 'reqObj.json';
  await FileSystem.writeAsStringAsync(reqObjUri, JSON.stringify(reqObj));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiUrl}/dl/doc-version/upload`);
    xhr.setRequestHeader('Authorization', authHeader);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.min(100, Math.round((e.loaded * 100) / e.total)));
    };
    xhr.onload = () => {
      try { resolve(JSON.parse(xhr.responseText)); }
      catch { resolve(xhr.responseText); }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    const formData = new FormData();
    formData.append('reqObj', { uri: reqObjUri, type: 'application/json', name: 'blob' } as any);
    formData.append('doc', { uri: fileUri, type: fileType, name: safeName } as any);
    xhr.send(formData);
  });
}

export async function uploadFileRNFS(params: RNFSUploadParams): Promise<any> {
  const { fileUri, fileName, fileType, reqObj, activity, onProgress } = params;
  const safeName = fileName.replace(/ /g, '_');
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const token = await getStoredAuthToken();
  const authHeader = token ? `Bearer ${token}` : `Basic ${process.env.EXPO_PUBLIC_API_BASIC_AUTH}`;

  const reqObjUri = FileSystem.cacheDirectory + 'reqObj.json';
  await FileSystem.writeAsStringAsync(reqObjUri, JSON.stringify(reqObj));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const queryParams = activity !== undefined ? `?activity=${activity}` : '';
    xhr.open('POST', `${apiUrl}/dl/dl-document/upload${queryParams}`);
    xhr.setRequestHeader('Authorization', authHeader);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.min(100, Math.round((e.loaded * 100) / e.total)));
    };
    xhr.onload = () => {
      try { resolve(JSON.parse(xhr.responseText)); }
      catch { resolve(xhr.responseText); }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    const formData = new FormData();
    formData.append('reqObj', { uri: reqObjUri, type: 'application/json', name: 'blob' } as any);
    formData.append('doc', { uri: fileUri, type: fileType, name: safeName } as any);
    xhr.send(formData);
  });
}

export async function uploadFolder(payload: FolderUploadDto): Promise<any> {
  const { data } = await apiClient.post(`/dl/dl-document/folder/upload?activity=true`, payload);
  return data;
}

export async function searchFile(searchKey: string, userId: number): Promise<FileDto[]> {
  const { data } = await apiClient.post(`/dl/dl-search/search`, {searchKey, userId});
   // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function fetchWorkflowList(fileId: number): Promise<WorkFlowDto[]> {
  const { data } = await apiClient.get(`/dl/dl-document/${fileId}/wf`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function fetchProcessDefinitionXML(processDefId:string, ): Promise<{id:string, bpmn20Xml: string}> {
  const { data } = await apiClient.get(`/wf/engine/process-definition/${processDefId}/xml`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  return data;
}

export async function fetchFileTags(fileId: number): Promise<FileTagDto[]> {
  const { data } = await apiClient.get(`/dl/dl-doc-tag/doc/${fileId}`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function createFileTag(payload: CreateFileTagDto): Promise<FileTagDto> {
  const { data } = await apiClient.post(`/dl/dl-doc-tag/`, payload);
  return data["data"];
}

export async function deleteFileTag(tagId: number, userId: number): Promise<any> {
  const { data } = await apiClient.delete(`/dl/dl-doc-tag/${tagId}/?userId=${userId}`);
  return data;
}

export async function fetchSharedUserData(fileId: number): Promise<SharedUserDto[]> {
  const { data } = await apiClient.get(`/dl/share/dl-document/${fileId}`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function deleteSharedUserData(fileId: number, dlCollId: number): Promise<any> {
  const { data } = await apiClient.delete(`/dl/share/dl-document/${fileId}/collaborator/${dlCollId}`);
  return data["message"] ?? "";
}

export async function updateSharedUserData(fileId: number, dlCollId: number, access: string): Promise<any> {
  const { data } = await apiClient.put(`/dl/share/update-access-permission?dlDocId=${fileId}&collId=${dlCollId}&accessRight=${access}`, {});
  return data["data"];
}

export async function fetchShare(fileShareId: number): Promise<ShareDto[]> {
  const { data } = await apiClient.get(`/dl/share/${fileShareId}`);
  return data["data"];
}

export async function createShare(payload: SharePayloadDto): Promise<any> {
  const { data } = await apiClient.post(`/dl/share/`, payload);
  return data["data"];
}


export async function deleteShare(payload: SharePayloadDto): Promise<any> {
  const { data } = await apiClient.delete(`/dl/share/remove`, { data: payload });
  return data["message"];
}

export async function fetchFileComments(fileId: number): Promise<FileCommentDto[]> {
  const { data } = await apiClient.get(`/dl/dl-doc-comment/?documentId=${fileId}`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}


export async function createFileComment(payload: CreateFileCommentDto): Promise<FileCommentDto> {
  const { data } = await apiClient.post(`/dl/dl-doc-comment/`, payload);
  return data["data"];
}

export async function updateComment(payload: UpdateFileCommentDto): Promise<FileCommentDto> {
  const { data } = await apiClient.put(`/dl/dl-doc-comment/`, payload);
  return data["data"];
}

export async function deleteComment(fileId: number): Promise<any> {
  const { data } = await apiClient.delete(`/dl/dl-doc-comment/${fileId}`);
  return data;
}

export async function checkInFile(fileId: number, userId: number): Promise<FileDto> {
  const { data } = await apiClient.put(`/dl/dl-document/check-in/${fileId}?userId=${userId}`);
  return data;
}

export async function checkOutFile(fileId: number, userId: number): Promise<FileDto> {
  const { data } = await apiClient.put(`/dl/dl-document/check-out/${fileId}?userId=${userId}`);
  return data["data"];
}

export async function fetchFileVersion(fileId: number): Promise<FileDto[]> {
  const { data } = await apiClient.get(`/dl/doc-version/${fileId}`);
  return data["data"];
}

export async function fetchProcessDefinition(): Promise<ProcessDefinitionDto[]> {
  const { data } = await apiClient.get(`/wf/engine/process-definition`);
  return data;
}

export async function startAutomate(processKey: string, payload: FileDto): Promise<AutomateResponseDto> {
  const { data } = await apiClient.post(`/wf/camunda-process/start?processKey=${processKey}&type=MANUAL`, payload);
  return data;
}


export async function downloadFile(fileId: number, fileName: string, userId: number, mimeType: string, type: "file" | "folder", directoryUri?: string): Promise<{ fileUri: string; directoryUri?: string }> {
  const response = await apiClient.get( type === "file" ? `/dl/dl-document/download/${fileId}` : `/dl/dl-document/download/folder/${fileId}`, {
    params: { userId },
    responseType: "arraybuffer",
  });
  console.log(`request response for fileId ${fileId} (${type}):`, response);
  const base64 = Buffer.from(response.data, "binary").toString("base64");

  if (Platform.OS === "android") {
    return saveToAndroidDownloads(fileName, mimeType, base64, directoryUri);
  }

  // iOS fallback — see below
  const destUri = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return { fileUri: destUri };
}

async function saveToAndroidDownloads(fileName: string, mimeType: string, base64: string, directoryUri?: string): Promise<{ fileUri: string; directoryUri: string }> {
  const SAF = FileSystem.StorageAccessFramework;

  const dirUri = directoryUri ?? await (async () => {
    const permissions = await SAF.requestDirectoryPermissionsAsync();
    if (!permissions.granted) throw new Error("Storage permission denied");
    return permissions.directoryUri;
  })();

  const fileUri = await SAF.createFileAsync(dirUri, fileName, mimeType);
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return { fileUri, directoryUri: dirUri };
}

export async function fetchDepartments() : Promise<DepartmentDto[]> {
  const { data } = await apiClient.get(`/um/department/search?code=&name=&status=Active`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function fetchAllUsers() : Promise<UserDto[]>{
  const { data } = await apiClient.get(`/um/user/`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function fetchLargeFiles(userId: number) : Promise<FileDto[]>{
  const { data } = await apiClient.get(`/dl/dl-document/${userId}/large-files/`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function fetchRarelyUsedFiles(userId: number) : Promise<FileDto[]>{
  const { data } = await apiClient.get(`/dl/dl-document/${userId}/rarely-used-files/`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"] ?? [];
}

export async function fetchDocumentActivity(userId: number, pageNumber: number) : Promise<DocumentActivityDto[]>{
  const { data } = await apiClient.get(`/dl/dl-doc-activity/user/${userId}/${pageNumber}/10`);
  // ✅ If response or response.data is missing/undefined/null, force an empty array []
  if (!data || data === "") {
    return [];
  }
  return data["data"]["data"] ?? [];
}

export async function changePassword(currentPassword:string, newPassword: string, userId: number): Promise<any> {
  const { data } = await apiClient.put(`/um/user/change-password`, { currentPassword, newPassword, userId });
  return data["message"];
}

export async function forgotPassword(email: string): Promise<{ message: string; status: number }> {
  const response = await apiClient.put(`/um/un-auth/forgot-password?email=${email}`);
  return { message: response.data?.["message"] ?? "", status: response.status };
}

export async function createStorageRequest(payload: StorageRequestDto): Promise<{ message: string; status: number }> {
  const response = await apiClient.post(`/um/storage/`, payload);
  return { message: response.data?.["message"] ?? "", status: response.status };
}