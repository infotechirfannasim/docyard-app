import FilesView from '@/components/files-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';

export default function Favourites() {
  const { files: filesData, isFilesLoading, user, isUserLoading, error } = useGetFilesData("favourite");
  
    return (
      <FilesView header="Favourites" files={filesData ?? []} isFolder={false} viewType="favourite" isLoading={isFilesLoading || isUserLoading} errorMessage={error?.message} />
    );
}