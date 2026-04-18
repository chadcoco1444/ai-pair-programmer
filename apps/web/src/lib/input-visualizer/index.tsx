import type { JSX } from "react";
import { detectInputType } from "./detect";
import { renderArray } from "./renderers/array";
import { renderMatrix } from "./renderers/matrix";
import { renderTree } from "./renderers/tree";
import { renderLinkedList } from "./renderers/list";
import { renderString } from "./renderers/string";
import { renderStringArray } from "./renderers/string-array";
import { renderGraph } from "./renderers/graph";
import { renderMultiArg } from "./renderers/multi-arg";

export { detectInputType } from "./detect";
export type { InputShape } from "./types";

export function visualizeInput(raw: string): JSX.Element | null {
  const shape = detectInputType(raw);
  switch (shape.kind) {
    case "array":
      return renderArray(shape.values);
    case "matrix":
      return renderMatrix(shape.cells);
    case "tree":
      return renderTree(shape.levelOrder);
    case "list":
      return renderLinkedList(shape.values);
    case "string":
      return renderString(shape.value);
    case "string-array":
      return renderStringArray(shape.values);
    case "graph":
      return renderGraph(shape.adjList);
    case "multi-arg":
      return renderMultiArg(shape.parts);
    case "unknown":
    default:
      return null;
  }
}
