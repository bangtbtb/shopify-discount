import { useEffect, useState } from "react";
import { randomDigit } from "~/models/utils";

type EasyTabProps = {
  id?: string;
  active: number; // Active index
  actions?: React.ReactElement[];
  tabs: string[] | React.ReactElement[];
  children?: React.ReactNode;
  onActive: (index: number) => void;
};

export function EasyTab(props: EasyTabProps) {
  const [id, setId] = useState(props.id || "");

  useEffect(() => {
    if (!id) {
      setId(randomDigit(5).toString());
    }
  }, [id]);

  return (
    <div className="tabbed">
      <div className="tab-head">
        <div className="tabnavs">
          {props.tabs.map((tab, idx) => (
            <div
              key={idx}
              className="tab-nav"
              onClick={(ev) => props.onActive(idx)}
            >
              {typeof tab === "string" ? (
                <>
                  <input
                    id={`${id}_${idx}`}
                    type="radio"
                    name="tabs"
                    checked={props.active == idx}
                    onChange={() => {}}
                  />
                  <label htmlFor={`${id}_${idx}`}>{tab}</label>
                </>
              ) : (
                tab
              )}
            </div>
          ))}
        </div>
        <div className="tab_actions">{props.actions}</div>
      </div>

      <div className="tabs">{props.children}</div>
    </div>
  );
}
