import type { LoFStructure } from "@/features/lof/types";
import type { LoFOperation, OperationName, OperationOptions } from "@/features/lof/operations/types";
import { cancel } from "@/features/lof/operations/cancel";
import { confirm } from "@/features/lof/operations/confirm";
import { condense } from "@/features/lof/operations/condense";
import { compensate } from "@/features/lof/operations/compensate";
import { measure } from "@/features/lof/operations/measure";

export { cancel, confirm, condense, compensate, measure };

export const OPERATIONS: Record<OperationName, LoFOperation> = {
  cancel,
  confirm,
  condense,
  compensate,
  measure
};

export const applyOperation = (
  operation: OperationName,
  structure: LoFStructure,
  options?: OperationOptions
) => {
  const handler = OPERATIONS[operation];
  if (!handler) {
    throw new Error(`Unknown LOF operation: ${operation}`);
  }
  return handler(structure, options);
};
