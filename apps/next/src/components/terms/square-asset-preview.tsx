import { resize } from "../../common/cdn-loaders";
import { PhotoView } from "../photo-view/photo-view";

export interface SquareAssetPreviewProps {
  src: string;
  rounded: number;
  size: number;
}

export const SquareAssetPreview: React.FC<SquareAssetPreviewProps> = ({
  src,
  rounded,
  size,
}) => {
  const url = resize({ src, width: 500 });

  return (
    <PhotoView src={url} borderRadius={rounded}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={size}
        height={size}
        src={url}
        alt="Image preview"
        style={{
          cursor: "zoom-in",
          objectFit: "cover",
          width: size,
          height: size,
          minWidth: size,
          borderRadius: rounded,
        }}
      />
    </PhotoView>
  );
};