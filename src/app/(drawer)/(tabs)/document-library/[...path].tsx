import FilesView from '@/components/files-view';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';
import { useTypeFiles } from '@/hooks/queries/use-files';
import { useCurrentUser } from '@/hooks/queries/use-user';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

const typeHeaderMap: Record<string, "Images" | "Videos" | "Documents" | "Others"> = {
  Image: "Images",
  video: "Videos",
  doc: "Documents",
  other: "Others",
};

export default function DocumentLibraryFolder() {
    const { path, fileId, isFolder } = useLocalSearchParams<{ path?: string[]; fileId: string; isFolder?: string }>();

    if (path?.[0] === 'type' && path[1]) {
      return <TypeFilesView typeParam={path[1] as "Image" | "video" | "doc" | "other"} />;
    }

const { files: filesData, isFilesLoading, user, isUserLoading } = useGetFilesData("document-library", fileId ? Number(fileId) : undefined);

  return (
    isUserLoading || isFilesLoading ? (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large"  />
      </ThemedView>
    ) : 
  <FilesView header="Document Library" files={filesData!} fileId={Number(fileId)} isFolder={isFolder === "true"} />
  );
}

function TypeFilesView({ typeParam }: { typeParam: "Image" | "video" | "doc" | "other" }) {
  const { username } = useAuth();
  const { data: user, isLoading: isUserLoading } = useCurrentUser(username);
  const { data: typeFiles, isLoading: isTypeLoading } = useTypeFiles(user?.id!, 0, typeParam, !!user?.id);

  return (
    isUserLoading || isTypeLoading ? (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    ) : (
        <FilesView header={typeHeaderMap[typeParam]} files={typeFiles!} isFolder={false} />
    )
  );
}