// var _ = require('lodash');
// this files contains faulty transformations, but results in very interesting patterns

// Utility Function: Compare if two objects or arrays are equal
function areEqualObjects(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// Utility Function: Find prunable arrays within the structure
function findPrunableArray(structure, currentPath = []) {
    for (let i = 0; i < structure.length; i++) {
        if (Array.isArray(structure[i]) && structure[i].length === 1) {
            return [...currentPath, i];
        }
        if (Array.isArray(structure[i])) {
            const foundPath = findPrunableArray(structure[i], [...currentPath, i]);
            if (foundPath) {
                return foundPath;
            }
        }
    }
    return null;
}

// Function to flatten single-element arrays ([[A]] = A)
function deleteRandomPrunableArray(structure) {
    const prunablePath = findPrunableArray(structure);
    if (prunablePath) {
        let target = structure;
        for (let i = 0; i < prunablePath.length - 1; i++) {
            target = target[prunablePath[i]];
        }
        const lastIndex = prunablePath[prunablePath.length - 1];

        // Replace the prunable array ([[A]]) with its content (A)
        target[lastIndex] = target[lastIndex][0];
    }
    return structure;
}

// Function to remove duplicate arrays ([A][A] = [A])
function findAndRemoveDuplicate(structure, currentPath = []) {
    for (let i = 0; i < structure.length; i++) {
        for (let j = i + 1; j < structure.length; j++) {
            if (areEqualObjects(structure[i], structure[j])) {
                return [...currentPath, j];
            }
        }
        if (Array.isArray(structure[i])) {
            const foundPath = findAndRemoveDuplicate(structure[i], [...currentPath, i]);
            if (foundPath) {
                return foundPath;
            }
        }
    }
    return null;
}

function concatenateRandomForms(structure) {
    const duplicatePath = findAndRemoveDuplicate(structure);
    if (duplicatePath) {
        let target = structure;
        for (let i = 0; i < duplicatePath.length - 1; i++) {
            target = target[duplicatePath[i]];
        }
        const lastIndex = duplicatePath[duplicatePath.length - 1];
        target.splice(lastIndex, 1);
    }
    return structure;
}

// Function to duplicate random form ([A] = [A][A])
function getRandomPath(structure, path = []) {
    if (structure.length === 0) return path;
    const index = Math.floor(Math.random() * structure.length);
    path.push(index);
    if (Array.isArray(structure[index])) {
        return getRandomPath(structure[index], path);
    }
    return path;
}

function duplicateRandomForm(structure) {
    const randomPath = getRandomPath(structure);
    let target = structure;
    for (let i = 0; i < randomPath.length - 1; i++) {
        target = target[randomPath[i]];
    }
    const lastIndex = randomPath[randomPath.length - 1];
    if (Array.isArray(target) && lastIndex < target.length) {
        const duplicatedItem = JSON.parse(JSON.stringify(target[lastIndex]));
        target.splice(lastIndex + 1, 0, duplicatedItem);
    }
    return structure;
}

// Function to enclose in single-element array (A = [[A]])
function encloseInArray(structure) {
    const randomPath = getRandomPath(structure);
    let target = structure;
    for (let i = 0; i < randomPath.length - 1; i++) {
        target = target[randomPath[i]];
    }
    const lastIndex = randomPath[randomPath.length - 1];
    target[lastIndex] = [target[lastIndex]];
    return structure;
}

// // Test the functions
// console.log("Test");
// const structure1 = [[[]]];
// const structure2 = [[[1]]];
// console.log(deleteRandomPrunableArray(structure1)); // Should return []
// console.log(deleteRandomPrunableArray(structure2)); // Should return [1]



// // console.log("Test")
// const structure = [[[[]]],[[[[]]],[[[]]]],[],[[]]];
// const inv = concatenateRandomForms(structure);
// console.log(structure, '-->', inv); // [1]
// console.log('Are equal', '-->', areEqualObjects(structure, inv)); // [1]