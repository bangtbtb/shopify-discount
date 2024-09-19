type StepListProps = {
  activeIndex?: number;
  data: React.ReactElement[] | string[];
};

export function StepList(props: StepListProps) {
  return (
    <ul className="steps">
      {props.data.map((v, idx) => (
        <li
          className={idx === props.activeIndex ? "active" : ""}
          // className={""}
          key={`${idx}`}
          style={{
            width: `${100 / props.data.length}%`,
          }}
        >
          <div className="first" />
          {v}
        </li>
      ))}
    </ul>
  );
}
