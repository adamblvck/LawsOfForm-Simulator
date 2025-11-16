import { applyOperation } from "@/features/lof/operations";
import type { OperationName } from "@/features/lof/operations/types";
import { deepClone, type LoFStructure } from "@/features/lof/types";
import {
  METRICS_CONFIG,
  calculateMetricDeltas,
  computeMetricsSnapshot,
  listMetricIds,
  type MetricId
} from "@/features/lof/metrics";
import type {
  OperationWeights,
  SimulationConfig,
  SimulationResult,
  SimulationStepSnapshot,
  RunBatchOptions
} from "@/features/lof/simulation/types";
import { getRandomSource, randomIndex } from "@/features/lof/random";

const DEFAULT_INITIAL_STRUCTURE: LoFStructure = [[]];

const buildWeightedTable = (weights: OperationWeights): OperationName[] => {
  const table: OperationName[] = [];
  (Object.entries(weights) as Array<[OperationName, number]>).forEach(([name, weight]) => {
    if (typeof weight === "number" && weight > 0) {
      for (let i = 0; i < Math.round(weight); i += 1) {
        table.push(name);
      }
    }
  });
  if (table.length === 0) {
    return ["cancel", "confirm", "condense", "compensate", "measure"];
  }
  return table;
};

const pickOperation = (table: OperationName[], random: () => number): OperationName => {
  const index = randomIndex(table.length, random);
  return table[index];
};

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const runSimulation = (config: SimulationConfig): SimulationResult => {
  const {
    id = createId(),
    steps,
    weights,
    initialStructure = DEFAULT_INITIAL_STRUCTURE,
    random,
    recordHistory = true
  } = config;

  if (steps <= 0) {
    return {
      id,
      steps: [],
      finalStructure: deepClone(initialStructure),
      finalMetrics: computeMetricsSnapshot(initialStructure)
    };
  }

  const randomSource = getRandomSource(random);
  const table = buildWeightedTable(weights);
  let current = deepClone(initialStructure);
  const history: SimulationStepSnapshot[] = [];

  for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
    const metricsBefore = computeMetricsSnapshot(current);
    const operation = pickOperation(table, randomSource);
    current = applyOperation(operation, current, { random: randomSource, mutate: true });
    const metricsAfter = computeMetricsSnapshot(current);
    const deltas = calculateMetricDeltas(metricsBefore, metricsAfter);

    if (recordHistory) {
      history.push({
        step: stepIndex + 1,
        operation,
        before: metricsBefore,
        after: metricsAfter,
        deltas,
        structure: deepClone(current)
      });
    }
  }

  const finalStructure = recordHistory
    ? history.at(-1)?.structure ?? deepClone(current)
    : deepClone(current);

  return {
    id,
    steps: history,
    finalStructure,
    finalMetrics: computeMetricsSnapshot(current)
  };
};

export const runSimulationBatch = async (
  configs: SimulationConfig[],
  options: RunBatchOptions = {}
): Promise<SimulationResult[]> => {
  const defaultConcurrency =
    typeof navigator !== "undefined" && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 4;
  const { concurrency = defaultConcurrency } = options;
  const queue = configs.slice();
  const results: SimulationResult[] = [];

  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (queue.length > 0) {
      const config = queue.shift();
      if (!config) {
        break;
      }
      const result = runSimulation(config);
      results.push(result);
      await Promise.resolve();
    }
  });

  await Promise.all(workers);
  return results;
};

export const listAvailableMetrics = (): MetricId[] => listMetricIds();
