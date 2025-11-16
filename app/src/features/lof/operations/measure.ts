import type { LoFStructure } from "@/features/lof/types";
import { prepareStructure, getAtPath, collectPaths } from "@/features/lof/operations/utils";
import type { OperationOptions } from "@/features/lof/operations/types";
import { getRandomSource, randomBoolean, randomIndex } from "@/features/lof/random";

export const measure = (structure: LoFStructure, options?: OperationOptions): LoFStructure => {
  const random = getRandomSource(options?.random);
  const working = prepareStructure(structure, options);
  const shouldEncapsulate = randomBoolean(random);

  if (shouldEncapsulate) {
    const allArrays = collectPaths(working, (_node, path) => path.length > 0);
    if (allArrays.length === 0) {
      return working;
    }
    const selected = allArrays[randomIndex(allArrays.length, random)];
    const parentPath = selected.slice(0, -1);
    const index = selected[selected.length - 1];
    const parent = parentPath.length === 0 ? working : getAtPath(working, parentPath);
    const current = parent[index];
    parent[index] = [current] as LoFStructure;
    return working;
  }

  const decapsulatable = collectPaths(
    working,
    (node, path) => path.length > 0 && node.length === 1 && Array.isArray(node[0])
  );

  if (decapsulatable.length === 0) {
    return working;
  }

  const selected = decapsulatable[randomIndex(decapsulatable.length, random)];
  const parentPath = selected.slice(0, -1);
  const index = selected[selected.length - 1];
  const parent = parentPath.length === 0 ? working : getAtPath(working, parentPath);
  const current = parent[index];
  parent[index] = current[0];
  return working;
};
