# Laws of Form - Automata

Run by install `npm install -g http-server` in a reasonable NodeJs version (allows for running an http server everywhere where there's a folder defined), then execute in the root of this repo `http-server`.

## Laws of Form

This repository is a playground for George Spencer Brown's Laws of Form, which formulates a complete calculus of indications, with a single symbol, the mark `()`, and only two axioms.

The mark `()` creates a distinction between inside and outside. The two primary axioms are:

1. `()() = ()`. - The Law of Calling
2. `(()) = `. - The Law of Crossing

The current playground allows users to start with a marked or unmarked state, and change the initial structure.

After pressing "Play", the simulation applies at random one of the two axioms in either direction, in each step. This causes the initial structure to change and evolve over time. At the bottom of the app, a chart with entropy and max depth is displayed, and showcases how these metrics progress.

Generated data, displayed in the chart, can be downloaded using the `Download CSV` button.

## start local sterver



## General Findings

a

## Highlighted Findings



## Quantifying Simulation Progress



### Calculation of Entropy

The entropy calculation for the nested array structure aims to quantify the diversity and balance of the array's depth distribution. This is done by first creating a depth distribution: a count of how many sub-arrays exist at each depth level within the structure. For example, in a structure like `[[[],[]],[[],[[]]]]`, there are 2 arrays at depth 1, 3 arrays at depth 2, and 1 array at depth 3. This distribution is then used to calculate the Shannon entropy, a measure of randomness or uncertainty commonly used in information theory.

The equation for Shannon entropy is given by:
$$
H(X) = -\sum_{i=1}^{n} p(x_i) \log_2 p(x_i)
$$
where $ p(x_i) $ is the probability of occurrence of the ith element in the distribution. In the context of the nested array structure, $ p(x_i) $ is the probability of an array being at depth \( i \), calculated by dividing the number of arrays at depth \( i \) by the total number of arrays. The entropy value is a sum over all depths, where each term in the sum is the product of the probability of a depth and the logarithm (base 2) of this probability. A higher entropy value indicates a more diverse and balanced distribution of depths within the structure.

The entropy is calculated as follows:

```javascript
function calculateEntropy(structure) {
    let depthCounts = {};
    function countDepths(structure, currentDepth = 0) {
        if (!Array.isArray(structure)) return;
        depthCounts[currentDepth] = (depthCounts[currentDepth] || 0) + 1;
        structure.forEach(subStructure => countDepths(subStructure, currentDepth + 1));
    }
    countDepths(structure);

    let entropy = 0;
    let total = Object.values(depthCounts).reduce((sum, count) => sum + count, 0);
    Object.values(depthCounts).forEach(count => {
        let probability = count / total;
        entropy -= probability * Math.log2(probability);
    });

    return entropy;
}
```

### Calculation of Maximum Depth

Another way to quantify the created form, is by using maximum depth of a created structure:

```javascript
function calculateMaxDepth(structure, currentDepth = 0) {
    if (!Array.isArray(structure) || structure.length === 0) return currentDepth;
    return Math.max(...structure.map(sub => calculateMaxDepth(sub, currentDepth + 1)));
}
```