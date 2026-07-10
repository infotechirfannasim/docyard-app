import FilesView from '@/components/files-view';
import { useLocalSearchParams } from 'expo-router';

export default function DocumentLibraryFolder() {
    const { fileId, isFolder, path } = useLocalSearchParams<{ fileId: string; isFolder?: string, path: string[]  }>();

  return (
    <FilesView header="Document Library"  path={path} fileId={Number(fileId)} isFolder={isFolder === "true"} isRecentDocumentsView={false} />
  )
}