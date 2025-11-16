import { describe, expect, it } from "vitest";
import {
  METRICS_BY_ID,
  METRICS_CONFIG,
  computeMetricsSnapshot,
  getMetricLabel,
  listMetricIds
} from "@/features/lof/metrics";
import type { LoFStructure } from "@/features/lof/types";

const SAMPLE: LoFStructure = [[[]], [[]]];

const closeTo = (value: number, expected: number, precision = 3) =>
  expect(value).toBeCloseTo(expected, precision);

describe("LOF metrics", () => {
  it("exposes all metric identifiers", () => {
    const ids = listMetricIds();
    expect(ids).toEqual(METRICS_CONFIG.map((metric) => metric.id));
  });

  it("computes stable metric snapshots", () => {
    const snapshot = computeMetricsSnapshot(SAMPLE);
    closeTo(snapshot.entropy ?? 0, 1.5219, 4);
    closeTo(snapshot.degreeEntropy ?? 0, 1.5219, 4);
    closeTo(snapshot.maxDepth ?? 0, 2, 5);
    closeTo(snapshot.assembley ?? 0, 4, 5);
    closeTo(snapshot.omega ?? 0, 34, 5);
    closeTo(snapshot.order ?? 0, 5, 5);
    closeTo(snapshot.energyDiluted ?? 0, 8 / 3, 4);
    closeTo(snapshot.hortonStrahler ?? 0, 2, 5);
    closeTo(snapshot.sackinMeanDepth ?? 0, 2, 5);
    closeTo(snapshot.duplicatePressure ?? 0, 1, 5);
  });

  it("provides human readable labels", () => {
    expect(getMetricLabel("entropy")).toBe("Subtree Entropy");
    expect(getMetricLabel("assembley")).toBe("Assembly Index");
    expect(getMetricLabel("duplicatePressure")).toBe("Duplicate Pressure");
  });

  it("offers compute accessors by id", () => {
    const orderMetric = METRICS_BY_ID.order;
    expect(orderMetric.compute(SAMPLE)).toBe(5);
  });
});
