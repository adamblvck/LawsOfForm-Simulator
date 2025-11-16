import { describe, expect, it } from "vitest";
import { runSimulation, runSimulationBatch } from "@/features/lof/simulation/engine";
import type { SimulationConfig } from "@/features/lof/simulation/types";

const randomSource = () => 0.1;

describe("LOF simulation engine", () => {
  it("runs deterministic simulations with weighted operations", () => {
    const config: SimulationConfig = {
      id: "test",
      steps: 2,
      weights: { confirm: 1 },
      initialStructure: [[]],
      random: randomSource
    };

    const result = runSimulation(config);
    expect(result.id).toBe("test");
    expect(result.steps).toHaveLength(2);
    expect(result.finalStructure).toEqual([[], [], []]);
    expect(result.finalMetrics.order).toBe(4);
    expect(result.finalMetrics.hortonStrahler).toBe(2);
  });

  it("batches simulations respecting concurrency", async () => {
    const configs: SimulationConfig[] = [
      { id: "A", steps: 1, weights: { compensate: 1 }, initialStructure: [], random: randomSource },
      { id: "B", steps: 1, weights: { cancel: 1 }, initialStructure: [[[]]], random: randomSource }
    ];

    const results = await runSimulationBatch(configs, { concurrency: 1 });
    expect(results).toHaveLength(2);
    const ids = results.map((item) => item.id).sort();
    expect(ids).toEqual(["A", "B"]);
  });
});
