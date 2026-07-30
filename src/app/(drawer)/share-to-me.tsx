import FilesView from '@/components/files-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';

export default function ShareToMe() {
  const { files: filesData, isFilesLoading, user, isUserLoading, error } = useGetFilesData("share-to-me");

  return (
    <FilesView header="Share To Me" files={filesData ?? []} isFolder={true} viewType="shared-with-me" isLoading={isFilesLoading || isUserLoading} errorMessage={error?.message} />
  );
}