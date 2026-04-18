import type { JSX } from "react";
import { renderArray } from "./array";
import { renderMatrix } from "./matrix";
import { renderString } from "./string";
import { renderStringArray } from "./string-array";
import { renderTree } from "./tree";
import { renderLinkedList } from "./list";

function renderSinglePart(name: string, value: unknown): JSX.Element | null {
  if (typeof value === "string") return renderString(value);
  if (typeof value === "number") {
    return (
      <div className="inline-block rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-sm text-slate-100">
        {value}
      </div>
    );
  }
  if (typeof value === "boolean") {
    return (
      <div className="inline-block rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-sm text-slate-100">
        {value ? "true" : "false"}
      </div>
    );
  }
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "string")) {
      return renderStringArray(value as string[]);
    }
    if (value.every((v) => Array.isArray(v))) {
      return renderMatrix(value as (number | string)[][]);
    }
    if (value.every((v) => typeof v === "number" || v === null)) {
      if (/root|tree/i.test(name)) {
        return renderTree(value as (number | null)[]);
      }
      if (/head|list|node/i.test(name)) {
        return renderLinkedList(
          (value as (number | null)[]).filter((v): v is number => v !== null)
        );
      }
      if (value.every((v) => typeof v === "number")) {
        return renderArray(value as number[]);
      }
      return renderTree(value as (number | null)[]);
    }
  }
  return null;
}

export function renderMultiArg(
  parts: { name: string; value: unknown }[]
): JSX.Element {
  return (
    <figure className="my-3 space-y-2">
      {parts.map((p, i) => {
        const inner = renderSinglePart(p.name, p.value);
        return (
          <div key={i} className="flex flex-col gap-1">
            <span
              data-role="arg-label"
              className="font-mono text-xs text-emerald-400 uppercase tracking-wide"
            >
              {p.name}
            </span>
            {inner ?? (
              <span className="font-mono text-xs text-slate-500">
                [unsupported value]
              </span>
            )}
          </div>
        );
      })}
    </figure>
  );
}
