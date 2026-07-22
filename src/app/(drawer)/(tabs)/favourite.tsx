import FilesView from '@/components/files-view';
import { ThemedView } from '@/components/themed-view';
import { useGetFilesData } from '@/hooks/queries/use-get-files-data.tsx';
import { ActivityIndicator } from 'react-native';

import { StyleSheet } from 'react-native';

export default function Favourites() {
  const { files: filesData, isFilesLoading, user, isUserLoading } = useGetFilesData("favourite");
  
    return (
      isUserLoading || isFilesLoading ? (
        <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large"  />
        </ThemedView>
      ) : 
      <FilesView header="Favourites" files={filesData!} isFolder={false} viewType="favourite" />
    );
}


const styles = StyleSheet.create({
    container: {
    flex: 1,
    padding: "3%"
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // borderWidth: 1,
    paddingHorizontal: 5,
    marginBottom: 15,

  },
  content: {

  }

});