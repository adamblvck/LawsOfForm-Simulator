import { describe, expect, it } from "vitest";
import { cancel, compensate, condense, confirm, measure } from "@/features/lof/operations";
import type { RandomSource } from "@/features/lof/random";
import type { LoFStructure } from "@/features/lof/types";

const createRandomSource = (values: number[]): RandomSource => {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
};

describe("LOF operations", () => {
  it("cancel removes a [[ ]] pair when present", () => {
    const structure: LoFStructure = [[[]]];
    const result = cancel(structure, { random: createRandomSource([0]) });
    expect(result).toEqual([]);
  });

  it("confirm duplicates a nested form", () => {
    const structure: LoFStructure = [[], []];
    const result = confirm(structure, { random: createRandomSource([0]) });
    expect(result).toEqual([[], [], []]);
  });

  it("condense removes duplicate substructures", () => {
    const structure: LoFStructure = [[[]], [[]]];
    const result = condense(structure, { random: createRandomSource([0]) });
    expect(result).toEqual([[[]]]);
  });

  it("compensate inserts a double bracket form", () => {
    const structure: LoFStructure = [];
    const result = compensate(structure, { random: createRandomSource([0.1, 0.9, 0.2]) });
    expect(result).toEqual([[[]]]);
  });

  it("measure encapsulates when requested", () => {
    const structure: LoFStructure = [[]];
    const result = measure(structure, { random: createRandomSource([0.1, 0.1]) });
    expect(result).toEqual([[[[]]]]);
  });

  it("measure decapsulates single nested arrays", () => {
    const structure: LoFStructure = [[[[]]]];
    // First random call <0.5 => encapsulate false, second selects the only path
    const result = measure(structure, { random: createRandomSource([0.9, 0]) });
    expect(result).toEqual([[[]]]);
  });
});
