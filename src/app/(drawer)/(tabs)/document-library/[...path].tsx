import FilesView from '@/components/files-view';
import { useLocalSearchParams } from 'expo-router';

export default function DocumentLibraryFolder() {
    const { fileId, isFolder, path } = useLocalSearchParams<{ fileId: string; isFolder?: string, path: string[]  }>();
    console.log("DocumentLibraryFolder path: ", path);
    console.log("DocumentLibraryFolder fileId: ", fileId);
  return (
    <FilesView header="Document Library"  path={path} fileId={Number(fileId)} isFolder={isFolder === "true"} isRecentDocuments={false} />
  )
}