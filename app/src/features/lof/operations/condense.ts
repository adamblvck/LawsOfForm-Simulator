import type { LoFStructure, StructurePath } from "@/features/lof/types";
import { prepareStructure, removeAtPath, traverseStructure } from "@/features/lof/operations/utils";
import type { OperationOptions } from "@/features/lof/operations/types";
import { getRandomSource, randomIndex } from "@/features/lof/random";

const collectDuplicatePairs = (structure: LoFStructure): Array<[StructurePath, StructurePath]> => {
  const seen = new Map<string, StructurePath>();
  const pairs: Array<[StructurePath, StructurePath]> = [];

  traverseStructure(structure, (node, path) => {
    const key = JSON.stringify(node);
    if (seen.has(key)) {
      pairs.push([seen.get(key) as StructurePath, path]);
    } else {
      seen.set(key, path);
    }
  });

  return pairs;
};

export const condense = (structure: LoFStructure, options?: OperationOptions): LoFStructure => {
  const random = getRandomSource(options?.random);
  const working = prepareStructure(structure, options);
  const pairs = collectDuplicatePairs(working);
  if (pairs.length === 0) {
    return working;
  }
  const [, second] = pairs[randomIndex(pairs.length, random)];
  removeAtPath(working, second);
  return working;
};
