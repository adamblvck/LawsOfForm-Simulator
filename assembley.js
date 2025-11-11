export function calculateAssemblyIndex(structure) {
    // Helper function to determine the type of structure
    function getType(array) {
        if (array.length === 0) {
            return 'A'; // Empty array
        }
        if (array.length === 1 && Array.isArray(array[0])) {
            return 'C'; // Single nested array
        }
        if (array.length === 2 && JSON.stringify(array[0]) === JSON.stringify(array[1])) {
            return 'D'; // Two identical nested arrays
        }
        return null; // Unrecognized structure
    }

    // Recursive function to calculate the assembly index
    function assemblySteps(array) {
        const type = getType(array);

        if (type === 'A') {
            return 1; // Rule 1: [A] = [A],[A]
        }
        if (type === 'C') {
            return assemblySteps(array[0]) + 1; // Rule 3: [[C]] = C
        }
        if (type === 'D') {
            return assemblySteps(array[0]) + 1; // Rule 4: [B],[B] = [D]
        }
        if (Array.isArray(array) && array.length === 2 && array[0].length === 0 && array[1].length === 0) {
            return 2; // Special case for two empty arrays
        }
        
        // Calculate for more complex or unrecognized structures
        let steps = 0;
        for (const item of array) {
            if (Array.isArray(item)) {
                steps += assemblySteps(item);
            }
        }
        return steps;
    }

    // Start calculation
    return assemblySteps(structure);
}

// GPT 5 generated
function assemblyIndexExact(node) {
    const memo = new Map();
    const keyOf = x => JSON.stringify(x); // ordered trees
  
    function cost(t) {
      const k = keyOf(t);
      if (memo.has(k)) return memo.get(k);
      if (!Array.isArray(t) || t.length === 0) { memo.set(k, 1); return 1; } // leaf []
      // group children by canonical form
      const counts = new Map(), reps = new Map();
      for (const child of t) {
        const ck = keyOf(child);
        counts.set(ck, (counts.get(ck) || 0) + 1);
        if (!reps.has(ck)) reps.set(ck, child);
      }
      let total = 1; // make this parent (wrap)
      for (const [ck, m] of counts.entries()) {
        total += cost(reps.get(ck)) + (m - 1); // build one + clone the rest
      }
      memo.set(k, total);
      return total;
    }
    return cost(node);
  }

// Example usage
const nestedArray = [[[], [[], [[]]]]];
const assemblyIndex = assemblyIndexExact(nestedArray);
console.log(`Assembly Index: ${assemblyIndex}`);