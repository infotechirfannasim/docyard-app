import FilesView from '@/components/files-view';
import { useAuth } from '@/context/auth-context';
import { useTypeFiles } from '@/hooks/queries/use-files';
import { useLocalSearchParams } from 'expo-router';

const typeHeaderMap: Record<string, "Images" | "Videos" | "Documents" | "Others"> = {
  Image: "Images",
  video: "Videos",
  doc: "Documents",
  other: "Others",
};

export default function DocumentTypeScreen() {
    const { type } = useLocalSearchParams<{ type: "Image" | "video" | "doc" | "other" }>();
    const { user, isLoading: isUserLoading } = useAuth();
    const { data: typeFiles, isLoading: isTypeLoading, error } = useTypeFiles(user?.id!, 0, type, !!user?.id);

    return (
        <FilesView header={typeHeaderMap[type]} files={typeFiles ?? []} isFolder={false} viewType="document-library" isLoading={isUserLoading || isTypeLoading} errorMessage={error?.message} />
    );
}
