import { CommonFields } from "../common-fields";
export type FileDto = CommonFields & {
  title: string;
  name: string;
  size: string;
  sizeBytes?: number | null;
  mimeType?: string | null;
  location?: string | null;
  extension?: string | null;
  currentVersion?: number | null;
  content?: string | null;
  shared?: boolean | null;
  shareType?: string | null;
  archived: boolean;
  archival: boolean;
  archivedOn?: string | null;
  daysArchived?: number | null;
  description?: string | null;
  folder?: boolean | null;
  parentId?: number | null;
  updatedOnDetail?: string;
  favourite?: boolean | null;

  // Additional File-Specific Fields
  checkIn?: boolean | null;
  checkInBy?: number | null;
  checkInOn?: string | null;
  checkInOnDetail?: string | null;
  checkOutOn?: string | null;
  checkOutOnDetail?: string | null;
  dlDocumentCommentDTOList?: unknown[] | null;
  dlDocumentCommentsCount?: number;
  dlShareDTO?: unknown | null;
  dlShareId?: number | null;
  documentActivityIds?: number[] | null;
  documentCommentIds?: number[] | null;
  documentTagIds?: number[] | null;
  guId?: string | null;
  isLeafNode?: boolean;
  metaJson?: string | null;
  ocrDone?: boolean;
  ocrSupported?: boolean;
  status?: string;
  subject?: string | null;
  sysGenPassword?: string | null;
  templateId?: number | null;
  version?: number | null;
  versionGUId?: string | null;
  workflowExecuted?: boolean | null;
};
export type CreateFileDto = {
    createdBy: number,
    createdOn: string,
    daysArchived: number,
    name: string,
    parentId: number | null,
    title: string,
    updatedBy: number,
    updatedOn: string
};

export type CopyFileDto = {
    destinationFolderId: number;
    loggedInUserId: number;
    sourceDLDocumentIds: number[];
}

export type MoveFileDto = CopyFileDto;

export type RenameFileDto = {
    id: number,
    name: string,
    updatedBy: string
}

export type FileLogsDto = {
    action: string;
    activityPerformedOn: string;
    activityType: string;
    comment?: string | null;
    createdBy: number;
    createdByName?: number | null;
    createdByUsername?: number | null;
    createdOn: string; // ISO 8601 Date string
    docId: number;
    docName: string;
    entityId: number;
    id: number;
    toFolderName?: string | null;
    updatedBy: number;
    updatedOn: string; // ISO 8601 Date string
    userId: number;
    userName: string;
};

export type FolderUploadDto = {
    createdBy: number;
    updatedBy: number;
    ownerId: number;
    daysArchived: number;
    shared: boolean;
    checkIn: boolean;
    createdOn: string;
    updatedOn: string;
    name: string;
    parentId: number | null;
    title: string;
    metaJson: string;
    templateId: number;
};

export type MetaDataTemplateAttribute = {
  id: number;
  createdBy: number;
  createdOn: string;
  updatedBy: number;
  updatedOn: string;
};

export type MetaDataTemplateListDto = {
  id: number;
  title: string;
  description: string;
  status: string;
  createdBy: number;
  createdOn: string;
  updatedBy: number;
  updatedOn: string;
  metaDataTemplateAttributesList: MetaDataTemplateAttribute[];
};

export type MetaDataAttributeDto = {
  id: number;
  createdBy: number;
  createdByName?: string | null;
  createdByUsername?: string | null;
  createdOn: string;
  description: string;
  name: string;
  type: string;
  updatedBy: number;
  updatedOn: string;
};

export type MetaDataTemplateDto = {
  id: number;
  title: string;
  description: string;
  status: string;
  createdBy: number;
  createdByName?: string | null;
  createdByUsername?: string | null;
  createdOn: string;
  updatedBy: number;
  updatedOn: string;
  metaDataAttributeDTOList: MetaDataAttributeDto[];
};

export type WorkFlowDto = CommonFields & {
  docId: number;
  docName: string;
  remarks?: string | null;
  status: string;
  wfLevel: string;
  wfName: string;
  wfProcessDefId: string;
  wfProcessId: string;
  wfTaskId: string;
  wfXML?: string | null;
};

export type FileTagDto = CommonFields & {
  docId: number;
  message: string;
  nameOfUser: string;
  userId: number;
};

export type CreateFileTagDto = {
  docId: number;
  message: string;
  userId: number;
};

export type SharedUserDto = CommonFields & {
  dlShareId?: number | null;
  dlCollId?: number | null;
  dlCollName: string;
  dlCollEmail: string;
  dlCollUsername: string;
  accessRight: string;
  dlCollPic?: string | null;
};

export type SharePermission = "VIEW" | "EDITOR" | "COMMENT" | "TAG" ;
export type ShareType = "ANYONE" | "RESTRICTED" | "NO_SHARING" | string;

export type SharePayloadDto = {
  appContextPath: string;
  confirmPassword?: string | null;
  departmentIds: number[];
  dlCollaborators: String[];
  dlDocId: number;
  externalUserShareLink?: string;
  folder: boolean;
  linkExpiredOn?: string | null;
  message?: string;
  password?: string | null;
  shareLink: string;
  sharePermission: SharePermission;
  shareType: ShareType;
  userId: string;
};


export type ShareDto = CommonFields & {
  dlDocumentId: number;
  permanentLink: string;
  shareType: string;
  accessRight: string;
  shareNotes?: string | null;
  status: string;
  password?: string | null;
  confirmPassword?: string | null;
  dlShareCollaboratorDTOList: ShareCollaboratorDto[]; // Replace 'unknown' with CollaboratorDto if available
  linkExpiredOn?: string | null;
};

export type ShareCollaboratorDto = CommonFields & {
  accessRight: string;
  dlCollaboratorEmail: string;
  dlCollaboratorId: number;
  dlShareId: number;
};

export type DepartmentDto = CommonFields & {
  code: string;
  name: string;
  status: string;
};

export type CreateFileCommentDto = {
  createdBy: number;
  docId: number;
  message: string;
  updatedBy: number;
  userId: number;
};

export type FileCommentDto = CommonFields & {
  docId: number;
  message: string;
  nameOfUser: string;
  postedOn: string;
  userId: number;
};

export type UpdateFileCommentDto = {
  createdBy: number;
  docId: number;
  id: number,
  message: string;
  updatedBy: number;
  userId: number;
};

export type ProcessDefinitionDto = {
  id: string; // Note: String UUID format here, unlike numerical IDs in other DTOs
  category: string;
  deploymentId: string;
  description?: string | null;
  diagram?: string | null;
  historyTimeToLive?: number | null;
  key: string;
  name: string;
  resource: string;
  startableInTasklist: boolean;
  suspended: boolean;
  tenantId?: string | null;
  version: number;
  versionTag?: string | null;
};

export type AutomateResponseDto = {
  data: {
    DOCUMENT: FileDto;
    DOCUMENT_STATUS: string;
    TEMPLATE_NAME: string;
  };
  message: string;
}


export type DocumentActivityDto = CommonFields & {
  action: string;
  activityPerformedOn: string;
  activityType: string;
  docId?: number | null;
  docName?: string | null;
  entityId?: number | null;
  toFolderName?: string | null;
  userId?: number | null;
  userName: string;
};

