import type { LoFStructure } from "@/features/lof/types";
import { prepareStructure } from "@/features/lof/operations/utils";
import type { OperationOptions } from "@/features/lof/operations/types";
import { getRandomSource, randomBoolean, randomIntInclusive } from "@/features/lof/random";

const insertBracket = (node: LoFStructure, random: () => number) => {
  const position = randomIntInclusive(0, node.length, random);
  node.splice(position, 0, [[]]);
};

const addAtRandomLocation = (node: LoFStructure, random: () => number) => {
  if (node.length === 0) {
    insertBracket(node, random);
    return;
  }
  const index = randomIntInclusive(0, node.length - 1, random);
  const target = node[index];
  if (!Array.isArray(target) || randomBoolean(random)) {
    insertBracket(node, random);
  } else {
    addAtRandomLocation(target, random);
  }
};

export const compensate = (structure: LoFStructure, options?: OperationOptions): LoFStructure => {
  const random = getRandomSource(options?.random);
  const working = prepareStructure(structure, options);
  addAtRandomLocation(working, random);
  return working;
};
