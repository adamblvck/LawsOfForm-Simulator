var _ = require('lodash');

function areEqualObjects(obj1, obj2) {
	return _.isEqual(obj1, obj2);
}

function findAndRemoveDuplicate(structure, currentPath = []) {
    // Loop through each element at the current level
    for (let i = 0; i < structure.length; i++) {
        // Compare with every other element at the same level
        for (let j = i + 1; j < structure.length; j++) {
            if (areEqualObjects(structure[i], structure[j])) {
                // If a duplicate is found, return the path to the second occurrence
                return [...currentPath, j];
            }
        }
        // Recursively check for duplicates in nested arrays
        if (Array.isArray(structure[i])) {
            const foundPath = findAndRemoveDuplicate(structure[i], [...currentPath, i]);
            if (foundPath) {
                return foundPath;
            }
        }
    }
    // Return null if no duplicate is found
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
}

function duplicateRandomForm(structure) {
    // Use the existing getRandomPath function to select a random path within the structure
    const randomPath = getRandomPath(structure);
    
    // Navigate to the target node in the structure using the randomPath
    let target = structure;
    for (let i = 0; i < randomPath.length - 1; i++) {
        target = target[randomPath[i]];
    }
    
    // The last index in the randomPath points to the specific element to be duplicated
    const lastIndex = randomPath[randomPath.length - 1];
    
    // Duplicate the element at the target position
    // We use JSON methods to deeply clone the object or array to avoid reference issues
    if (Array.isArray(target) && lastIndex < target.length) {
        const duplicatedItem = JSON.parse(JSON.stringify(target[lastIndex]));
        target.splice(lastIndex, 0, duplicatedItem);
    }
}

function findPrunableArray(structure, currentPath = []) {
    for (let i = 0; i < structure.length; i++) {
        // Check if the current element is an array containing only one item
        if (Array.isArray(structure[i]) && structure[i].length === 1) {
            return [...currentPath, i];
        }
        // Recursively check for prunable arrays in nested arrays
        if (Array.isArray(structure[i])) {
            const foundPath = findPrunableArray(structure[i], [...currentPath, i]);
            if (foundPath) {
                return foundPath;
            }
        }
    }
    // Return null if no prunable array is found
    return null;
}

function deleteRandomPrunableArray(structure) {
    const prunablePath = findPrunableArray(structure);
    if (prunablePath) {
        let target = structure;
        // Navigate to the parent of the prunable array
        for (let i = 0; i < prunablePath.length - 1; i++) {
            target = target[prunablePath[i]];
        }
        const lastIndex = prunablePath[prunablePath.length - 1];

        // Check if we are at the top level of the structure
        if (prunablePath.length === 1) {
            // Replace the outer array ([[A]]) with A directly
            structure[lastIndex] = target[lastIndex][0];
        } else {
            // Otherwise, navigate to the parent of the target
            let parentTarget = structure;
            for (let i = 0; i < prunablePath.length - 2; i++) {
                parentTarget = parentTarget[prunablePath[i]];
            }
            const parentIndex = prunablePath[prunablePath.length - 2];
            // Replace the prunable array ([[A]]) with its content (A)
            parentTarget[parentIndex] = target[lastIndex][0];
        }
    }
}