import FilesView from '@/components/files-view';
import { useAuth } from '@/context/auth-context';
import { useTypeFiles } from '@/hooks/queries/use-files';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';
import { useLocalSearchParams } from 'expo-router';

const typeHeaderMap: Record<string, "Images" | "Videos" | "Documents" | "Others"> = {
  Image: "Images",
  video: "Videos",
  doc: "Documents",
  other: "Others",
};

export default function DocumentLibraryFolder() {
    const { path, fileId, isFolder } = useLocalSearchParams<{ path?: string[]; fileId: string; isFolder?: string }>();

    if (path?.[0] === 'type' && path[1]) {
      return <TypeFilesView typeParam={path[1] as "Image" | "video" | "doc" | "other"} />;
    }

const { files: filesData, isFilesLoading, user, isUserLoading, error } = useGetFilesData("document-library", fileId ? Number(fileId) : undefined);

  return (
  <FilesView header="Document Library" files={filesData ?? []} fileId={Number(fileId)} isFolder={isFolder === "true"} viewType='document-library' isLoading={isFilesLoading || isUserLoading} errorMessage={error?.message} />
  );
}

function TypeFilesView({ typeParam }: { typeParam: "Image" | "video" | "doc" | "other" }) {
  const { user, isLoading: isUserLoading } = useAuth();
  const { data: typeFiles, isLoading: isTypeLoading, error } = useTypeFiles(user?.id!, 0, typeParam, !!user?.id);

  return (
    <FilesView header={typeHeaderMap[typeParam]} files={typeFiles ?? []} isFolder={false} viewType="document-library" isLoading={isUserLoading || isTypeLoading} errorMessage={error?.message} />
  );
}