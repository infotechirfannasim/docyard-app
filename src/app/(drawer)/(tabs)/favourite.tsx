import FilesView from '@/components/files-view';
import { StyleSheet } from 'react-native';

export default function Favourites() {

  return (
  <FilesView header="Favourites" fileId={undefined} path={[]} isFolder={false} isFavourite={true} />
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