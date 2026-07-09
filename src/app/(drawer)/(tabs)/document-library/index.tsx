import FilesView from '@/components/files-view';
import { useLocalSearchParams } from 'expo-router';

export default function DocumentLibraryRoot() {
  const { fileId, isFolder } = useLocalSearchParams<{ fileId?: string; isFolder?: string }>();
  return (
  <FilesView path={[]} fileId={Number(fileId)} isFolder={isFolder === "true"} isRecentDocuments={false} />
  );
}