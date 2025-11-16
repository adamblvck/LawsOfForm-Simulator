import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LoFStructure } from "@/features/lof/types";
import { deepClone } from "@/features/lof/types";
import { applyOperation } from "@/features/lof/operations";
import type { OperationName } from "@/features/lof/operations/types";
import {
  computeMetricsSnapshot,
  calculateMetricDeltas,
  type MetricId,
  type MetricDefinition
} from "@/features/lof/metrics";
import { listMetricIds } from "@/features/lof/metrics";
import { runSimulationBatch } from "@/features/lof/simulation/engine";
import type { SimulationConfig, SimulationResult } from "@/features/lof/simulation/types";
import { getRandomSource, randomIndex } from "@/features/lof/random";

export interface SimulationHistoryEntry {
  step: number;
  operation: OperationName;
  metrics: Partial<Record<MetricId, number>>;
  deltas: Partial<Record<MetricId, number | null>>;
}

const OPERATION_NAMES: OperationName[] = ["cancel", "confirm", "condense", "compensate", "measure"];

const DEFAULT_WEIGHTS: Record<OperationName, number> = {
  cancel: 1,
  confirm: 1,
  condense: 1,
  compensate: 1,
  measure: 1
};

const DEFAULT_STRUCTURE: LoFStructure = [[]];

const buildWeightedTable = (weights: Record<OperationName, number>): OperationName[] => {
  const table: OperationName[] = [];
  (Object.entries(weights) as Array<[OperationName, number]>).forEach(([name, weight]) => {
    if (weight > 0) {
      for (let i = 0; i < weight; i += 1) {
        table.push(name);
      }
    }
  });
  if (table.length === 0) {
    return [...OPERATION_NAMES];
  }
  return table;
};

export interface UseSimulationControllerOptions {
  initialStructure?: LoFStructure;
  initialWeights?: Record<OperationName, number>;
  autoStart?: boolean;
  loopIntervalMs?: number;
}

export const useSimulationController = ({
  initialStructure = DEFAULT_STRUCTURE,
  initialWeights = DEFAULT_WEIGHTS,
  autoStart = false,
  loopIntervalMs = 400
}: UseSimulationControllerOptions = {}) => {
  const structureRef = useRef<LoFStructure>(deepClone(initialStructure));
  const [step, setStep] = useState(0);
  const [lastOperation, setLastOperation] = useState<OperationName | null>(null);
  const [metrics, setMetrics] = useState(() => computeMetricsSnapshot(structureRef.current));
  const [history, setHistory] = useState<SimulationHistoryEntry[]>([]);
  const [autoPlay, setAutoPlay] = useState(autoStart);
  const [weights, setWeights] = useState<Record<OperationName, number>>(initialWeights);
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [stepsPerSecond, setStepsPerSecond] = useState(() => Math.max(1, Math.round(1000 / loopIntervalMs)));
  const [structureVersion, setStructureVersion] = useState(0);
  const stepRef = useRef(0);

  const metricIds = useMemo(() => listMetricIds(), []);

  const randomSource = useMemo(() => getRandomSource(), []);
  const intervalMs = useMemo(
    () => Math.max(1, Math.round(1000 / Math.max(1, stepsPerSecond))),
    [stepsPerSecond]
  );

  const weightedOperations = useMemo(() => buildWeightedTable(weights), [weights]);

  const pickOperation = useCallback((): OperationName => {
    const index = randomIndex(weightedOperations.length, randomSource);
    return weightedOperations[index];
  }, [weightedOperations, randomSource]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const applyOperationOnce = useCallback(
    (operation: OperationName) => {
      const metricsBefore = computeMetricsSnapshot(structureRef.current);
      structureRef.current = applyOperation(operation, structureRef.current, {
        random: randomSource,
        mutate: true
      });
      const metricsAfter = computeMetricsSnapshot(structureRef.current);
      const deltas = calculateMetricDeltas(metricsBefore, metricsAfter);
      const nextStep = stepRef.current + 1;
      stepRef.current = nextStep;

      setStep(nextStep);
      setLastOperation(operation);
      setMetrics(metricsAfter);
      setHistory((prev) => [...prev, { step: nextStep, operation, metrics: metricsAfter, deltas }]);
      setStructureVersion((prev) => prev + 1);
    },
    [randomSource]
  );

  const stepOnce = useCallback(() => {
    const operation = pickOperation();
    applyOperationOnce(operation);
  }, [pickOperation, applyOperationOnce]);

  const runOperationByName = useCallback(
    (operation: OperationName) => {
      applyOperationOnce(operation);
    },
    [applyOperationOnce]
  );

  const reset = useCallback(() => {
    structureRef.current = deepClone(initialStructure);
    setStep(0);
    setLastOperation(null);
    setMetrics(computeMetricsSnapshot(structureRef.current));
    setHistory([]);
    setStructureVersion((prev) => prev + 1);
  }, [initialStructure]);

  const handleWeightChange = useCallback((operation: OperationName, value: number) => {
    setWeights((prev) => ({ ...prev, [operation]: value }));
  }, []);

  const runBatch = useCallback(
    async (count = 4, stepsPerRun = 120): Promise<SimulationResult[]> => {
      setIsRunningBatch(true);
      try {
        const configs: SimulationConfig[] = Array.from({ length: count }, (_, index) => ({
          id: `batch-${index + 1}`,
          steps: stepsPerRun,
          weights,
          initialStructure: structureRef.current,
          recordHistory: false
        }));
        const results = await runSimulationBatch(configs, { concurrency: Math.min(count, 4) });
        return results;
      } finally {
        setIsRunningBatch(false);
      }
    },
    [weights]
  );

  useEffect(() => {
    if (!autoPlay || typeof window === "undefined") {
      return undefined;
    }
    const timer = window.setInterval(() => {
      stepOnce();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [autoPlay, intervalMs, stepOnce]);

  useEffect(() => {
    if (!autoStart) {
      return;
    }
    setAutoPlay(true);
  }, [autoStart]);

  return {
    step,
    lastOperation,
    metrics,
    metricIds,
    history,
    weights,
    autoPlay,
    setAutoPlay,
    setWeights: handleWeightChange,
    stepOnce,
    reset,
    runBatch,
    runOperationByName,
    isRunningBatch,
    stepsPerSecond,
    setStepsPerSecond,
    structureVersion,
    structure: structureRef.current
  };
};
