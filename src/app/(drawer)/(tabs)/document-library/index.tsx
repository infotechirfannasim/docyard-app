import FilesView from '@/components/files-view';
import { ThemedView } from '@/components/themed-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function DocumentLibraryRoot() {
  const { fileId, isFolder } = useLocalSearchParams<{ fileId?: string; isFolder?: string }>();

  const { files: filesData, isFilesLoading, user, isUserLoading } = useGetFilesData("document-library", fileId ? Number(fileId) : undefined);

  return (
    isUserLoading || isFilesLoading ? (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    ) :
      <FilesView header="Document Library" files={filesData!} fileId={Number(fileId)} isFolder={isFolder === "true"} />
  );
}