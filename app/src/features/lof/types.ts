export type StructurePath = number[];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LoFNode extends Array<LoFNode> {}

export type LoFStructure = LoFNode;

export const isLoFStructure = (value: unknown): value is LoFStructure =>
  Array.isArray(value) && value.every((item) => (Array.isArray(item) ? isLoFStructure(item) : false));

export const deepClone = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};
