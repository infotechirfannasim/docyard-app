import FilesView from '@/components/files-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';

export default function Trash() {

  const { files: filesData, isFilesLoading, user, isUserLoading, error } = useGetFilesData("trash");

  return (
    <FilesView header='Trash' files={filesData ?? []} fileId={undefined} viewType="trash" isFolder={true} isLoading={isFilesLoading || isUserLoading} errorMessage={error?.message} />
  );

}