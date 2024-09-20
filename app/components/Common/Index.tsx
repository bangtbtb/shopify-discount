type ColumnRevertProp = {
  children?: React.ReactElement;
};

export function ColumnRevert(props: ColumnRevertProp) {
  return (
    <div className="flex-column-revert" style={{}}>
      {props.children}
    </div>
  );
}

// export function Row(params:type) {

// }
