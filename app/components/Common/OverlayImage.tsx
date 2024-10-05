import { useState } from "react";

type OverlayImageProps = {
  srcs?: { image: string; imageAlt?: string }[];
  size?: number;
  maxArray?: number;
  onClick?: () => void;
};

export function OverlayImage({
  srcs,
  size,
  maxArray,
  onClick,
}: OverlayImageProps) {
  const [overMax, setOverMax] = useState(
    maxArray != undefined && (srcs?.length ?? 0) > maxArray,
  );

  return (
    <div className="overlay2">
      {srcs &&
        srcs.map((src, idx) =>
          (maxArray ?? 0) <= idx ? (
            <img
              key={idx}
              className="circle"
              src={src.image}
              alt={src.imageAlt}
              style={{
                // left: `${idx * 0.6 * (size || 40)}px`,
                width: size ? size : undefined,
                height: size ? size : undefined,
                marginLeft:
                  idx > 0 ? `-${idx * 0.4 * (size || 40)}px` : undefined,
              }}
            />
          ) : null,
        )}
      {maxArray != undefined && <span>{overMax}</span>}
    </div>
  );
}
