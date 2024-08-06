function LoFMeasure(nestedArray) {
    // Helper function to find all arrays in the nested structure
    function findAllArrays(arr, parentIndex = []) {
        let arrays = [];
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
                let currentIndex = parentIndex.concat(i);
                arrays.push(currentIndex);
                arrays = arrays.concat(findAllArrays(arr[i], currentIndex));
            }
        }
        return arrays;
    }

    // Helper function to find all decapsulatable arrays
    function findDecapsulatableArrays(arr, parentIndex = []) {
        let decapsulatableArrays = [];
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i]) && arr[i].length === 1 && Array.isArray(arr[i][0])) {
                let currentIndex = parentIndex.concat(i);
                decapsulatableArrays.push(currentIndex);
                decapsulatableArrays = decapsulatableArrays.concat(findDecapsulatableArrays(arr[i], currentIndex));
            } else if (Array.isArray(arr[i])) {
                decapsulatableArrays = decapsulatableArrays.concat(findDecapsulatableArrays(arr[i], parentIndex.concat(i)));
            }
        }
        return decapsulatableArrays;
    }

    // Helper function to encapsulate an array at a given path
    function encapsulateAtPath(arr, path) {
        if (path.length === 1) {
            arr[path[0]] = [arr[path[0]]];
        } else {
            encapsulateAtPath(arr[path[0]], path.slice(1));
        }
    }

    // Helper function to decapsulate an array at a given path
    function decapsulateAtPath(arr, path) {
        if (path.length === 1) {
            arr[path[0]] = arr[path[0]][0];
        } else {
            decapsulateAtPath(arr[path[0]], path.slice(1));
        }
    }

    // Randomly decide to encapsulate or decapsulate
    let operation = Math.random() < 0.5 ? 'encapsulate' : 'decapsulate';

    if (operation === 'encapsulate') {
        // Find all arrays in the nested structure
        let allArrays = findAllArrays(nestedArray);
        if (allArrays.length === 0) {
            return nestedArray; // No arrays to encapsulate
        }
        // Select a random array to encapsulate
        let randomArray = allArrays[Math.floor(Math.random() * allArrays.length)];
        encapsulateAtPath(nestedArray, randomArray);
    } else {
        // Find all decapsulatable arrays in the nested structure
        let decapsulatableArrays = findDecapsulatableArrays(nestedArray);
        if (decapsulatableArrays.length === 0) {
            return nestedArray; // No arrays to decapsulate
        }
        // Select a random array to decapsulate
        let randomArray = decapsulatableArrays[Math.floor(Math.random() * decapsulatableArrays.length)];
        decapsulateAtPath(nestedArray, randomArray);
    }

    return nestedArray;
}

// Test cases
let testCase1 = [[[]]];
let testCase2 = [[[]], [[]]];
let testCase3 = [[[], []], []];
let testCase4 = [[], [[]]];
let testCase5 = [[[[[]]]]];
let testCase6 = [[[[[]]]],[[[[], [[[[]]]]]]]];

console.log(JSON.stringify(LoFMeasure(testCase1)));
console.log(JSON.stringify(LoFMeasure(testCase2)));
console.log(JSON.stringify(LoFMeasure(testCase3)));
console.log(JSON.stringify(LoFMeasure(testCase4)));
console.log(JSON.stringify(LoFMeasure(testCase5)));
console.log(JSON.stringify(LoFMeasure(testCase6)));