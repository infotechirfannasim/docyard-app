import FilesView from '@/components/files-view';

export default function Trash() {
  return (
    <FilesView header='Trash' fileId={undefined} path={[]} isTrash={true} isFolder={true} />
  );
}