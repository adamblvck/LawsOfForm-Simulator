import type { LoFStructure, StructurePath } from "@/features/lof/types";
import { deepClone } from "@/features/lof/types";
import { collectPaths, getAtPath, prepareStructure } from "@/features/lof/operations/utils";
import type { OperationOptions } from "@/features/lof/operations/types";
import { getRandomSource, randomIndex } from "@/features/lof/random";

const duplicateAtPath = (structure: LoFStructure, path: StructurePath): void => {
  if (path.length === 0) {
    return;
  }
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  const parent = parentPath.length === 0 ? structure : getAtPath(structure, parentPath);
  const clone = deepClone(parent[index]);
  parent.splice(index + 1, 0, clone);
};

export const confirm = (structure: LoFStructure, options?: OperationOptions): LoFStructure => {
  const random = getRandomSource(options?.random);
  const working = prepareStructure(structure, options);
  const paths = collectPaths(working, (_node, path) => path.length > 0);
  if (paths.length === 0) {
    return working;
  }
  const selected = paths[randomIndex(paths.length, random)];
  duplicateAtPath(working, selected);
  return working;
};
