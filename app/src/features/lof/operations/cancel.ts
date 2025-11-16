import type { LoFStructure, StructurePath } from "@/features/lof/types";
import { prepareStructure, removeAtPath } from "@/features/lof/operations/utils";
import type { OperationOptions } from "@/features/lof/operations/types";
import { getRandomSource, randomIndex } from "@/features/lof/random";

const collectBracketPairs = (structure: LoFStructure, path: StructurePath = []): StructurePath[] => {
  const pairs: StructurePath[] = [];
  structure.forEach((node, index) => {
    const currentPath = [...path, index];
    if (Array.isArray(node)) {
      if (node.length === 1 && Array.isArray(node[0]) && node[0].length === 0) {
        pairs.push(currentPath);
      }
      pairs.push(...collectBracketPairs(node, currentPath));
    }
  });
  return pairs;
};

export const cancel = (structure: LoFStructure, options?: OperationOptions): LoFStructure => {
  const random = getRandomSource(options?.random);
  const working = prepareStructure(structure, options);
  const pairs = collectBracketPairs(working);
  if (pairs.length === 0) {
    return working;
  }
  const selected = pairs[randomIndex(pairs.length, random)];
  removeAtPath(working, selected);
  return working;
};
