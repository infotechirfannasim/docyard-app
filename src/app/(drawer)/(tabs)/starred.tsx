import FilesView from '@/components/files-view';
import { useTheme } from '@/context/theme-provider';
import { dummyFiles } from '@/data/dummy-file-data';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

export default function Starred() {

  const [isGridView, setGridView] = useState(true);
  const theme = useTheme();
  const dummyFilesData = dummyFiles.filter((file) => file.favourite === true);

  return (
  <FilesView  fileId={undefined} path={[]} isFolder={false} isStarred={true} />


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