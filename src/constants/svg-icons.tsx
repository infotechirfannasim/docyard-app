import { BmpIcon, DocxIcon, DocyardLogo, FolderIcon, FolderSharedIcon, InfotechLogo, JpegIcon, JpgIcon, OtherIcon, PdfIcon, PngIcon, PptxIcon, RarIcon, TxtIcon } from '@/constants/svgs-import';
import { SvgProps } from 'react-native-svg';

type SvgIconProps = SvgProps & {
    extension: string;
    size?: number;
    color?: string;
    width?: number;
    height?: number;
};

export default function SvgIcon({ style, extension, ...rest }: SvgIconProps) {
    switch (extension) {
        case 'bmp':
            return <BmpIcon height={28} width={28}  {...rest} style={[style]} />;
        case 'docx':
            return <DocxIcon height={30} width={30}  {...rest} style={[style]} />;
        case 'docyard':
            return <DocyardLogo {...rest} style={[style]} />;
        case 'folder-shared':
            return <FolderSharedIcon height={30} width={30}  {...rest} style={[style]} />;
        case 'folder':
            return <FolderIcon height={30} width={30}  {...rest} style={[style]} />;
        case 'infotech':
            return <InfotechLogo {...rest} style={[style]} />;
        case 'other':
            return <OtherIcon height={30} width={30}  {...rest} style={[style]} />;
        case 'pdf':
            return <PdfIcon height={30} width={30}  {...rest} style={[style]} />;
        case 'pptx':
            return <PptxIcon height={28} width={28}  {...rest} style={[style]} />;
        case 'zip':
        case 'rar':
            return <RarIcon height={32} width={32} {...rest} style={[style]} />;
        case 'txt':
            return <TxtIcon height={28} width={28}  {...rest} style={[style]} />;
        case 'png':
            return <PngIcon height={28} width={28}  {...rest} style={[style]} />;
        case 'jpg':
            return <JpgIcon height={28} width={28}  {...rest} style={[style]} />;
        case 'jpeg':
            return <JpegIcon height={28} width={28}  {...rest} style={[style]} />;
        default:
            return <OtherIcon height={28} width={28}  {...rest} style={[style]} />; // fallback for unknown extensions
    }
}