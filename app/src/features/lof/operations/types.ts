import type { LoFStructure } from "@/features/lof/types";
import type { RandomSource } from "@/features/lof/random";

export type OperationName =
  | "cancel"
  | "confirm"
  | "condense"
  | "compensate"
  | "measure";

export interface OperationOptions {
  random?: RandomSource;
  mutate?: boolean;
}

export type LoFOperation = (
  structure: LoFStructure,
  options?: OperationOptions
) => LoFStructure;
