type OverlayImageProps = {
  srcs?: { image: string; imageAlt?: string }[];
  size?: number;
  maxArray?: number;
  onClick?: () => void;
};

export function OverlayImage(props: OverlayImageProps) {
  return (
    <div className="overlay_img_ctn">
      {props.srcs &&
        props.srcs.map((src, idx) =>
          (props.maxArray ?? 0) <= idx ? (
            <img
              key={idx}
              src={src.image}
              alt={src.imageAlt}
              style={{
                width: props.size ? props.size : undefined,
                height: props.size ? props.size : undefined,
                borderRadius: props.size ? props.size : undefined,
                left: `${idx * 0.6 * (props.size || 40)}px`,
              }}
            />
          ) : (
            "."
          ),
        )}
    </div>
  );
}
