type CardOverflow = {
  children: React.ReactElement;
};

export function CardOverflow({ children }: CardOverflow) {
  return (
    <div
      style={{
        display: "block",
        overflow: "visible",
        borderRadius: "8px",
        padding: "1rem",
        backgroundColor: "#ffffff",
      }}
    >
      {children}
    </div>
  );
}
