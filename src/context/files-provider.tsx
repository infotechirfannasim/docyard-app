// context/files-provider.tsx
import { dummyFiles as initialFiles } from "@/data/dummy-file-data";
import { FileDto } from "@/types/api/file-dto";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type FilesContextType = {
  files: FileDto[];
  addFile: (file: FileDto) => void;
  updateFile: (id: number, updates: Partial<FileDto>) => void;
  deleteFile: (id: number) => void;
  visibleFiles: FileDto[];
};

const FilesContext = createContext<FilesContextType | undefined>(undefined);

export const FilesProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<FileDto[]>(initialFiles);

  const addFile = (file: FileDto) => {
    setFiles((prev) => [...prev, file]);
  };

  const updateFile = (id: number, updates: Partial<FileDto>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFile = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const visibleFiles = useMemo(() => files.filter((file) => !file.archived).sort((a, b) => a.folder === b.folder ? 0 : a.folder ? -1 : 1), [files]); // folders first

  return (
    <FilesContext.Provider value={{ files, addFile, updateFile, deleteFile, visibleFiles }}>
      {children}
    </FilesContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FilesContext);
  if (!context) {
    throw new Error("useFiles must be used within a FilesProvider");
  }
  return context;
};