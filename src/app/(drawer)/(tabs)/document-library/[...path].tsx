import FilesView from '@/components/files-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';
import { useLocalSearchParams } from 'expo-router';

export default function DocumentLibraryFolder() {
    const { path, fileId, isFolder } = useLocalSearchParams<{ path?: string[]; fileId: string; isFolder?: string }>();

const { files: filesData, isFilesLoading, user, isUserLoading, error } = useGetFilesData("document-library", fileId ? Number(fileId) : undefined);

  return (
  <FilesView header="Document Library" files={filesData ?? []} fileId={Number(fileId)} isFolder={isFolder === "true"} viewType='document-library' isLoading={isFilesLoading || isUserLoading} errorMessage={error?.message} />
  );
}