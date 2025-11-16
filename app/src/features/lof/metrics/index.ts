import type { LoFStructure } from "@/features/lof/types";

export type MetricId =
  | "entropy"
  | "degreeEntropy"
  | "maxDepth"
  | "assembley"
  | "omega"
  | "order"
  | "energyDiluted"
  | "hortonStrahler"
  | "sackinMeanDepth"
  | "duplicatePressure";

export interface MetricDefinition {
  id: MetricId;
  label: string;
  compute: (structure: LoFStructure) => number;
}

const formCount = (structure: LoFStructure): number => {
  const walk = (node: LoFStructure): number => {
    let total = 1; // count the current array
    node.forEach((child) => {
      total += walk(child);
    });
    return total;
  };
  return walk(structure);
};

const assemblyIndexExact = (structure: LoFStructure): number => {
  const memo = new Map<string, number>();
  const keyOf = (node: LoFStructure) => JSON.stringify(node);

  const cost = (node: LoFStructure): number => {
    const key = keyOf(node);
    if (memo.has(key)) {
      return memo.get(key) as number;
    }
    if (node.length === 0) {
      memo.set(key, 1);
      return 1;
    }
    const counts = new Map<string, number>();
    const reps = new Map<string, LoFStructure>();
    node.forEach((child) => {
      const childKey = keyOf(child);
      counts.set(childKey, (counts.get(childKey) ?? 0) + 1);
      if (!reps.has(childKey)) {
        reps.set(childKey, child);
      }
    });
    let total = 1;
    counts.forEach((multiplicity, childKey) => {
      const representative = reps.get(childKey) as LoFStructure;
      total += cost(representative) + (multiplicity - 1);
    });
    memo.set(key, total);
    return total;
  };

  return cost(structure);
};

const calculateOmega = (structure: LoFStructure): number => {
  const countArrays = (node: LoFStructure): number => {
    let count = 1;
    node.forEach((child) => {
      count += countArrays(child);
    });
    return count;
  };

  const findDuplicates = (node: LoFStructure): number => {
    const siblingCounts = new Map<string, number>();
    node.forEach((child) => {
      const key = JSON.stringify(child);
      siblingCounts.set(key, (siblingCounts.get(key) ?? 0) + 1);
    });
    let duplicates = 0;
    siblingCounts.forEach((value) => {
      if (value > 1) {
        duplicates += value - 1;
      }
    });
    node.forEach((child) => {
      duplicates += findDuplicates(child);
    });
    return duplicates;
  };

  const omega = (node: LoFStructure): number => {
    const nArrayCount = countArrays(node);
    const duplicateCount = findDuplicates(node);
    let value = nArrayCount * 3 + duplicateCount;
    node.forEach((child) => {
      value += omega(child);
    });
    return value;
  };

  return omega(structure);
};

const degreeEntropy = (structure: LoFStructure): number => {
  const counts = new Map<number, number>();
  let totalNodes = 0;

  const walk = (node: LoFStructure) => {
    const degree = node.length;
    counts.set(degree, (counts.get(degree) ?? 0) + 1);
    totalNodes += 1;
    node.forEach((child) => walk(child));
  };

  walk(structure);

  let entropy = 0;
  counts.forEach((count) => {
    const probability = count / totalNodes;
    entropy -= probability * Math.log2(probability);
  });
  return entropy;
};

const subtreeEntropy = (structure: LoFStructure): number => {
  const counts = new Map<string, number>();
  let total = 0;

  const canonicalize = (node: LoFStructure): string => {
    const key = `[${node.map(canonicalize).join("")}]`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    total += 1;
    return key;
  };

  canonicalize(structure);

  let entropy = 0;
  counts.forEach((count) => {
    const probability = count / total;
    entropy -= probability * Math.log2(probability);
  });
  return entropy;
};

const calculateMaxDepth = (structure: LoFStructure): number => {
  const walk = (node: LoFStructure, depth: number): number => {
    if (node.length === 0) {
      return depth;
    }
    return Math.max(...node.map((child) => walk(child, depth + 1)));
  };
  return walk(structure, 0);
};

const duplicatePressure = (structure: LoFStructure): number => {
  const log2Fact = (n: number) => {
    let acc = 0;
    for (let i = 2; i <= n; i += 1) {
      acc += Math.log2(i);
    }
    return acc;
  };

  let total = 0;
  const visit = (node: LoFStructure) => {
    const counts = new Map<string, number>();
    node.forEach((child) => {
      const key = JSON.stringify(child);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    counts.forEach((value) => {
      if (value > 1) {
        total += log2Fact(value);
      }
    });
    node.forEach((child) => visit(child));
  };

  visit(structure);
  return total;
};

const sackin = (structure: LoFStructure) => {
  let depthSum = 0;
  let leafCount = 0;

  const walk = (node: LoFStructure, depth: number) => {
    if (node.length === 0) {
      depthSum += depth;
      leafCount += 1;
      return;
    }
    node.forEach((child) => walk(child, depth + 1));
  };

  walk(structure, 0);
  return {
    S: depthSum,
    L: leafCount,
    meanLeafDepth: leafCount > 0 ? depthSum / leafCount : 0
  };
};

const energyDiluted = (structure: LoFStructure, { alpha = 1, gamma = 0, hbar = 1 } = {}) => {
  let energy = 0;
  const walk = (node: LoFStructure, depth: number, parentDegree: number | null) => {
    const degree = parentDegree ?? 1;
    energy += hbar / Math.pow(1 + depth, alpha) / Math.pow(degree, gamma);
    node.forEach((child) => walk(child, depth + 1, node.length));
  };
  walk(structure, 0, null);
  return energy;
};

const hortonStrahler = (node: LoFStructure): number => {
  if (node.length === 0) {
    return 1;
  }
  const orders = node.map((child) => hortonStrahler(child));
  const maxOrder = Math.max(...orders);
  const countMax = orders.filter((order) => order === maxOrder).length;
  return countMax >= 2 ? maxOrder + 1 : maxOrder;
};

export const METRICS_CONFIG: MetricDefinition[] = [
  { id: "entropy", label: "Subtree Entropy", compute: subtreeEntropy },
  { id: "degreeEntropy", label: "Degree Entropy", compute: degreeEntropy },
  { id: "maxDepth", label: "Max Depth", compute: calculateMaxDepth },
  { id: "assembley", label: "Assembly Index", compute: assemblyIndexExact },
  { id: "omega", label: "Omega", compute: calculateOmega },
  { id: "order", label: "Order", compute: formCount },
  { id: "energyDiluted", label: "Energy (Diluted)", compute: (structure) => energyDiluted(structure) },
  { id: "hortonStrahler", label: "Horton-Strahler", compute: hortonStrahler },
  {
    id: "sackinMeanDepth",
    label: "Sackin Mean Leaf Depth",
    compute: (structure) => sackin(structure).meanLeafDepth
  },
  { id: "duplicatePressure", label: "Duplicate Pressure", compute: duplicatePressure }
];

export const METRICS_BY_ID = METRICS_CONFIG.reduce<Record<MetricId, MetricDefinition>>((acc, def) => {
  acc[def.id] = def;
  return acc;
}, {} as Record<MetricId, MetricDefinition>);

export const listMetricIds = (): MetricId[] => METRICS_CONFIG.map((metric) => metric.id);

export const computeMetricsSnapshot = (structure: LoFStructure) => {
  const snapshot: Partial<Record<MetricId, number>> = {};
  METRICS_CONFIG.forEach(({ id, compute }) => {
    try {
      snapshot[id] = compute(structure);
    } catch (error) {
      console.warn(`Metric computation failed for ${id}`, error);
      snapshot[id] = NaN;
    }
  });
  return snapshot;
};

export const calculateMetricDeltas = (
  before: Partial<Record<MetricId, number>> | undefined,
  after: Partial<Record<MetricId, number>> | undefined
) => {
  const deltas: Partial<Record<MetricId, number | null>> = {};
  METRICS_CONFIG.forEach(({ id }) => {
    const previous = before?.[id];
    const next = after?.[id];
    deltas[id] =
      typeof previous === "number" && typeof next === "number" ? next - previous : null;
  });
  return deltas;
};

export const getMetricLabel = (id: MetricId) => METRICS_BY_ID[id]?.label ?? id;
