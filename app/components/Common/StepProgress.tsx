import { useEffect, useState } from "react";
import { initArray } from "~/models/utils";

type StepProgressProps = {
  direction?: "row" | "column"; // Default is row
  active: number;
  highlightColor?: string;
  children?: React.ReactElement[];
  renderChild?: (idx: number) => React.ReactElement;
};

export function StepProgress({
  direction,
  active,
  children,
}: StepProgressProps) {
  return (
    <div className={`step2_ctn ${direction || "row"}`}>
      {children?.map((child, idx) =>
        idx == children.length - 1 ? (
          <div key={idx} className={`step2 ${active >= idx ? "active" : ""}`}>
            {/* <div className="s2content">{child}</div> */}
            <div className="step_cc">{idx}</div>
          </div>
        ) : (
          <div key={idx} className={`step2 ${active >= idx ? "active" : ""}`}>
            {/* <div className="s2content">{child}</div> */}
            <div className="step_cc">{idx}</div>

            {idx < children.length - 1 && (
              <div
                className={`chain ${active > idx ? "active" : ""}`}
                style={{}}
              ></div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

//
type StepCounterProps = {
  direction?: "row" | "column"; // Default is row
  active: number;
  size?: number;
  selected?: number;
  highlightColor?: string;
  children?: React.ReactNode; // For auto increament:    ["", "", ""]
  onSelect?: (index: number) => void;
};

export function StepCounter({
  direction,
  active,
  selected,
  size,
  highlightColor,
  children,
  onSelect,
}: StepCounterProps) {
  return (
    <div className={`step2_ctn ${direction || "row"}`}>
      {Array.isArray(children)
        ? children?.map((child, idx) => (
            <div key={idx} className={`step2 ${active >= idx ? "active" : ""}`}>
              <div
                className="flex_cc step_cc"
                style={{
                  // color: active ? highlightColor || "#fff" : "#000",
                  gap: "8px",
                  width: size ?? "32px",
                  height: size ?? "32px",
                  border:
                    selected == idx
                      ? `3px solid ${highlightColor || "#019875"}`
                      : "",
                  backgroundColor:
                    active >= idx ? highlightColor || "#019875" : "grey",
                }}
                onClick={() => onSelect && onSelect(idx)}
              >
                {child || idx}
              </div>
              {idx < children.length - 1 && (
                <div
                  className={`chain ${active > idx ? "active" : ""}`}
                  style={{
                    borderColor: active > idx ? highlightColor : "gray",
                  }}
                ></div>
              )}
            </div>
          ))
        : children}
    </div>
  );
}
