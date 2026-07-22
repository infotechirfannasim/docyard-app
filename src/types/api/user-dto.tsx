import { CommonFields } from '../common-fields';

export type UserDto = CommonFields & {
    profilePhotoReceived?: string | undefined,
    username: string,
    email: string,
    name: string,
    phoneNumber?: string | undefined,
    mobileNumber?: string | undefined,
    groupId: 8,
    departmentIds?: number[] | undefined,
    status: string,
    address?: string | undefined,
    password: string,
    profilePhoto?: string| undefined,
    groupName: string,
    online?: string | undefined,
    forcePasswordChange: boolean,
    lastLogin?: string | undefined,
    lastPassUpdatedOn? : string | undefined,
    passwordExpired: boolean,
    passwordResetToken?: string | undefined,
    moduleActionList?: ModuleActionList[] | undefined,
    moduleDTOList?: ModuleDTOList[] | undefined,
    totalAllottedSpace: number,
    totalUsedSpace: number,
    spaceUsedFormatted? : string | undefined,
    unsuccessfulLoginAttempt: number,
    maxFileSize: number,
    passExpiryDays?: string | undefined,
    passExpiryAlertDays?: string | undefined,
    showPasswordExpiryAlert?: boolean |undefined ,
    remainingPasswordExpiryDays: number,
    occupiedPercentage?: number | undefined, 
}

export type ModuleActionList = CommonFields & {
    title: string,
    slug: string,
    seq: number
}

export type ModuleDTOList = CommonFields & {
    moduleId: number,
    name: string,
    slug: string,
    route: string,
    icon: string,
    seq: number,
    status: string,
    catSlug?: string | null,
    catName?: string | null,
    viewable: boolean,
    children?: ModuleDTOList[] | undefined,
    moduleActionDTOList?: ModuleActionDTOList[] | undefined | []
}

export type ModuleActionDTOList = CommonFields & {
    moduleActionId: number,
    title: string,
    slug: string,
    seq: number,
    moduleDTO?: string | null
}