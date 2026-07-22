import FilesView from '@/components/files-view';
import { ThemedView } from '@/components/themed-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';
import { ActivityIndicator } from 'react-native';

export default function ShareByMe() {
  const { files: filesData, isFilesLoading, user, isUserLoading } = useGetFilesData("share-by-me");

  return (
    isUserLoading || isFilesLoading ? (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    ) :
      <FilesView header="Share By Me" files={filesData!} isFolder={true} viewType="shared-by-me" />
  );
}
