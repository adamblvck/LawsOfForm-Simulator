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

// Example usage
const nestedArray = [[[], [[], [[]]]]];
const assemblyIndex = calculateAssemblyIndex(nestedArray);
console.log(`Assembly Index: ${assemblyIndex}`);