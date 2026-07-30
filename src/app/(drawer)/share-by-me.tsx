import FilesView from '@/components/files-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';

export default function ShareByMe() {
  const { files: filesData, isFilesLoading, user, isUserLoading, error } = useGetFilesData("share-by-me");

  return (
    <FilesView header="Share By Me" files={filesData ?? []} isFolder={true} viewType="shared-by-me" isLoading={isFilesLoading || isUserLoading} errorMessage={error?.message} />
  );
}