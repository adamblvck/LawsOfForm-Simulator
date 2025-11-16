import type { LoFStructure, StructurePath } from "@/features/lof/types";
import { deepClone } from "@/features/lof/types";
import type { OperationOptions } from "@/features/lof/operations/types";

export const prepareStructure = (
  structure: LoFStructure,
  options?: OperationOptions
): LoFStructure => {
  if (options?.mutate) {
    return structure;
  }
  return deepClone(structure);
};

export const getAtPath = (structure: LoFStructure, path: StructurePath): LoFStructure => {
  let current: LoFStructure = structure;
  for (const segment of path) {
    current = current[segment];
    if (!Array.isArray(current)) {
      throw new Error(`Invalid path segment ${segment} for structure.`);
    }
  }
  return current;
};

export const removeAtPath = (structure: LoFStructure, path: StructurePath) => {
  if (path.length === 0) {
    throw new Error("Cannot remove root structure");
  }
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  const parent = parentPath.length === 0 ? structure : getAtPath(structure, parentPath);
  parent.splice(index, 1);
};

export const setAtPath = (
  structure: LoFStructure,
  path: StructurePath,
  value: LoFStructure | LoFStructure[]
) => {
  if (path.length === 0) {
    throw new Error("Cannot replace root structure via setAtPath");
  }
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  const parent = parentPath.length === 0 ? structure : getAtPath(structure, parentPath);
  parent[index] = value as LoFStructure;
};

export const traverseStructure = (
  structure: LoFStructure,
  visitor: (node: LoFStructure, path: StructurePath) => void,
  path: StructurePath = []
) => {
  visitor(structure, path);
  structure.forEach((child, index) => {
    traverseStructure(child, visitor, [...path, index]);
  });
};

export const collectPaths = (
  structure: LoFStructure,
  predicate: (node: LoFStructure, path: StructurePath) => boolean
): StructurePath[] => {
  const buckets: StructurePath[] = [];
  traverseStructure(structure, (node, path) => {
    if (predicate(node, path)) {
      buckets.push(path);
    }
  });
  return buckets;
};
