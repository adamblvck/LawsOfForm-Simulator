import type { LoFStructure } from "@/features/lof/types";
import type { OperationName } from "@/features/lof/operations/types";
import type { MetricId } from "@/features/lof/metrics";
import type { RandomSource } from "@/features/lof/random";

export interface OperationWeights extends Partial<Record<OperationName, number>> {}

export interface SimulationConfig {
  id?: string;
  steps: number;
  weights: OperationWeights;
  initialStructure?: LoFStructure;
  random?: RandomSource;
  recordHistory?: boolean;
}

export interface SimulationStepSnapshot {
  step: number;
  operation: OperationName;
  before: Partial<Record<MetricId, number>>;
  after: Partial<Record<MetricId, number>>;
  deltas: Partial<Record<MetricId, number | null>>;
  structure: LoFStructure;
}

export interface SimulationResult {
  id: string;
  steps: SimulationStepSnapshot[];
  finalStructure: LoFStructure;
  finalMetrics: Partial<Record<MetricId, number>>;
}

export interface RunBatchOptions {
  concurrency?: number;
}
