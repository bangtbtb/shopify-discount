import CSS from "csstype";
type BoxBorderBoundProps = {
  headerAlign?: CSS.Property.TextAlign;
  header?: string | React.ReactElement;
  children?: React.ReactElement;
};

export function BoxBorderBound(props: BoxBorderBoundProps) {
  return (
    <fieldset style={{ borderRadius: "8px", display: "inline-block" }}>
      <legend
        style={{
          textAlign: props.headerAlign,
        }}
      >
        {/* <span style="font-size: 2rem"> Span text </span> */}
        {props.header}
      </legend>
      {props.children}
    </fieldset>
  );
}
