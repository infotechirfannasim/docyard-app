import FilesView from '@/components/files-view';
import { useLocalSearchParams } from 'expo-router';

export default function DocumentLibraryRoot() {
  const { fileId, isFolder, path } = useLocalSearchParams<{ fileId?: string; isFolder?: string, path? : string[] }>();
  console.log("DocumentLibraryRoot path: ", path);
  console.log("DocumentLibraryRoot fileId: ", fileId);
  return (
  <FilesView header="Document Library" path={path || []} fileId={Number(fileId)} isFolder={isFolder === "true"} isRecentDocuments={false} />
  );
}