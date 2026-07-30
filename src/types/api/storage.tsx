import { CommonFields } from "../common-fields";

export type StorageRequestDto = CommonFields & {
  additionalMemory: string;
  email: string;
  nameOfUser: string;
  remarks?: string | null;
  status: string;
  userId: number;
};