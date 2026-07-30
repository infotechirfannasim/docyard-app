import FilesView from '@/components/files-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';

export default function Archive() {
     const { files: filesData, isFilesLoading, user, isUserLoading, error } = useGetFilesData("archival");
    
      return (
        <FilesView header="Archival" files={filesData ?? []} isFolder={true} viewType="archival" isLoading={isFilesLoading || isUserLoading} errorMessage={error?.message} />
      );
}