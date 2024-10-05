import CSS from "csstype";

type TextVariant =
  | "headingXs"
  | "headingSm"
  | "headingMd"
  | "headingLg"
  | "headingXl"
  | "heading2xl"
  | "heading3xl"
  | "bodyXs"
  | "bodySm"
  | "bodyMd"
  | "bodyLg";

type CustomTableProps = {
  withs?: (CSS.Property.Width | undefined)[];
  headings?: React.ReactNode;
  children?: React.ReactNode;
};

export function CustomTable({ children, headings, withs }: CustomTableProps) {
  return (
    <table className="beep_tbl">
      <CustomTHeading withs={withs}>{headings}</CustomTHeading>
      <tbody>{children}</tbody>
    </table>
  );
}

type CustomHeadingProps = {
  withs?: (CSS.Property.Width | undefined)[];
  text?: TextVariant;
  children?: React.ReactNode;
};

export function CustomTHeading({ text, children, withs }: CustomHeadingProps) {
  return (
    <thead>
      <tr>
        {Array.isArray(children) ? (
          children.map((c, idx) => (
            <th
              key={idx}
              className={`Polaris-Text--root Polaris-Text--${text || "headingSm"}`}
              style={{
                width: withs ? withs[idx] || undefined : undefined,
              }}
            >
              {c}
            </th>
          ))
        ) : (
          <th
            className={`Polaris-Text--root Polaris-Text--${text || "headingSm"}`}
          >
            {children}
          </th>
        )}
      </tr>
    </thead>
  );
}

type TRowProps = {
  children?: React.ReactNode;
  text?: TextVariant;
};

export function TRow({ children, text }: TRowProps) {
  return (
    <tr className={`Polaris-Text--root Polaris-Text--${text || "bodyMd"}`}>
      {/* {Array.isArray(children)
        ? children.map((cell, idx) => (
            <td >{cell}</td>
          ))
        : children} */}
      {children}
    </tr>
  );
}

type TCellProps = {
  children?: React.ReactNode;
  width?: CSS.Property.Width;
};

export function TCell({ children, width }: TCellProps) {
  return <td style={{ width: width }}>{children}</td>;
}
