// const { calculateAssemblyIndex} = require('./assembley.js');

const lof_policy = {
    lof_weights: [1, 1, 1, 1, 0]
};

const sliders = document.querySelectorAll('.slider');
const percents = [
    document.getElementById('percent1'),
    document.getElementById('percent2'),
    document.getElementById('percent3'),
    document.getElementById('percent4'),
    document.getElementById('percent5'),
];

sliders.forEach((slider, index) => {
    slider.addEventListener('input', () => {
        lof_policy.lof_weights[index] = parseInt(slider.value);
        updatePercentages();
    });
});

function updatePercentages() {
    const total = lof_policy.lof_weights.reduce((acc, val) => acc + val, 0);
    lof_policy.lof_weights.forEach((value, index) => {
        const percent = total > 0 ? (value / total * 100).toFixed(1) : 0;
        percents[index].textContent = `${percent}%`;
    });
}

// Initialize percentages
updatePercentages();

function formCount(structure) {
    function countSubarrays(arr) {
        if (!Array.isArray(arr)) {
            return 0;
        }
        let count = 1; // count the current array
        for (let item of arr) {
            count += countSubarrays(item);
        }
        return count;
    }

    return countSubarrays(structure);
}

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

function calculateAssemblyIndex(structure) {
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

let step = 0;
let counter = [0,0,0,0];
let selectedPoints = [];

// Operation functions
function air(structure) {
    counter[0]+=1;
    return LoFCancel(structure);
}

function fire(structure) {
    counter[1]+=1;
    return LoFConfirm(structure);
}

function water(structure) {
    counter[2]+=1;
    return LoFCondense(structure);
}

function earth(structure) {
    counter[3]+=1;
    return LofCompensate(structure);
}

// Function to get a random path in the structure
function getRandomPath(structure, path = []) {
    if (structure.length === 0 || Math.random() < 0.75) {
        return path;
    }

    const randomIndex = Math.floor(Math.random() * structure.length);
    return getRandomPath(structure[randomIndex], [...path, randomIndex]);
}

// Timer for triggering operations
let timer = null;

function calculateOmega(nestedArray) {
    function countArrays(structure) {
        if (!Array.isArray(structure)) {
            return 0;
        }
        let count = 1; // count the current array
        for (let item of structure) {
            count += countArrays(item);
        }
        return count;
    }

    function findDuplicates(structure) {
        if (!Array.isArray(structure) || structure.length === 0) {
            return 0;
        }
        const siblingCounts = new Map();
        for (let item of structure) {
            const itemStr = JSON.stringify(item);
            if (siblingCounts.has(itemStr)) {
                siblingCounts.set(itemStr, siblingCounts.get(itemStr) + 1);
            } else {
                siblingCounts.set(itemStr, 1);
            }
        }
        let duplicates = 0;
        for (let count of siblingCounts.values()) {
            if (count > 1) {
                duplicates += count - 1;
            }
        }
        let subtreeDuplicates = 0;
        for (let item of structure) {
            subtreeDuplicates += findDuplicates(item);
        }
        return duplicates + subtreeDuplicates;
    }

    function omega(structure) {
        if (!Array.isArray(structure)) {
            return 0;
        }
        const nArrayCount = countArrays(structure);
        const duplicateCount = findDuplicates(structure);
        let omegaValue = nArrayCount * 3 + duplicateCount;
        for (let item of structure) {
            omegaValue += omega(item);
        }
        return omegaValue;
    }

    return omega(nestedArray);
}

// // Example usage
// const nestedStructure = [[], [[], []], [[], [[]]]];
// const omegaValue = calculateOmega(nestedStructure);
// console.log("Omega value:", omegaValue);


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

function calculateContextAwareEntropy(structure) {
    let pathCounts = {};
    let totalPaths = 0;

    function traverseStructure(structure, path = '') {
        if (!Array.isArray(structure)) return;
        
        pathCounts[path] = (pathCounts[path] || 0) + 1;
        totalPaths++;
        
        structure.forEach((subStructure, index) => {
            traverseStructure(subStructure, path ? `${path}.${index}` : `${index}`);
        });
    }
    
    traverseStructure(structure);

    let entropy = 0;
    Object.values(pathCounts).forEach(count => {
        let probability = count / totalPaths;
        entropy -= probability * Math.log2(probability);
    });

    return entropy;
}

function degreeEntropy(structure) {
    const counts = new Map();
    let N = 0;

    (function walk(t) {
        if (!Array.isArray(t)) return;
        const deg = t.length;
        counts.set(deg, (counts.get(deg) || 0) + 1);
        N++;
        for (const c of t) walk(c);
    })(structure);

    let H = 0;
    counts.forEach(v => {
        const p = v / N;
        H -= p * Math.log2(p);
    });
    return H;
}

// Drop-in: replace your calculateContextAwareEntropy(...) if you want this one as "entropy"
function subtreeEntropy(structure) {
    const counts = new Map();
    let N = 0;

    function canon(t) {
        // Ordered canonical form built from children’s canonical forms
        const childKeys = t.map(canon);               // recurse first
        const key = '[' + childKeys.join('') + ']';   // compact ordered key
        counts.set(key, (counts.get(key) || 0) + 1);
        N++;
        return key;
    }

    if (!Array.isArray(structure)) return 0;
    canon(structure);

    let H = 0;
    counts.forEach(v => {
        const p = v / N;
        H -= p * Math.log2(p);
    });
    return H;
}

function calculateMaxDepth(structure, currentDepth = 0) {
    if (!Array.isArray(structure) || structure.length === 0) return currentDepth;
    return Math.max(...structure.map(sub => calculateMaxDepth(sub, currentDepth + 1)));
}

function duplicatePressure(structure) {
    function log2Fact(n){ let r=0; for (let i=2;i<=n;i++) r+=Math.log2(i); return r; }
    let L = 0;
    (function visit(node){
      if (!Array.isArray(node)) return;
      const map = new Map();
      for (const child of node) {
        const k = JSON.stringify(child);
        map.set(k, (map.get(k)||0) + 1);
      }
      for (const m of map.values()) if (m > 1) L += log2Fact(m);
      for (const c of node) visit(c);
    })(structure);
    return L;
  }

function sackin(structure) {
    let S = 0, L = 0;
    (function walk(node, d) {
      if (!Array.isArray(node)) return;
      if (node.length === 0) { S += d; L++; }
      for (const c of node) walk(c, d + 1);
    })(structure, 0);
    return { S, L, meanLeafDepth: L ? S / L : 0 };
  }

function energyDiluted(structure, {alpha=1, gamma=0, hbar=1} = {}) {
    let E = 0;
    function walk(node, depth, parentDeg) {
      if (!Array.isArray(node)) return;
      const k = parentDeg ?? 1; // root has no parent; avoid /0
      E += hbar / Math.pow(1 + depth, alpha) / Math.pow(k, gamma);
      const deg = node.length;
      for (const child of node) walk(child, depth + 1, deg);
    }
    if (Array.isArray(structure)) walk(structure, 0, null);
    return E;
  }

const METRICS_CONFIG = [
    { id: 'entropy', label: 'Subtree Entropy', compute: subtreeEntropy },
    { id: 'degreeEntropy', label: 'Degree Entropy', compute: degreeEntropy },
    { id: 'maxDepth', label: 'Max Depth', compute: calculateMaxDepth },
    { id: 'assembley', label: 'Assembly Index', compute: assemblyIndexExact },
    { id: 'omega', label: 'Omega', compute: calculateOmega },
    { id: 'order', label: 'Order', compute: formCount },
    { id: 'energyDiluted', label: 'Energy (Diluted)', compute: energyDiluted },
    { id: 'hortonStrahler', label: 'Horton-Strahler', compute: hortonStrahler },
    { id: 'sackinMeanDepth', label: 'Sackin Mean Leaf Depth', compute: (structure) => sackin(structure).meanLeafDepth },
    { id: 'duplicatePressure', label: 'Duplicate Pressure', compute: duplicatePressure },
];

const METRICS_BY_ID = METRICS_CONFIG.reduce((acc, config) => {
    acc[config.id] = config;
    return acc;
}, {});

function computeMetricsSnapshot(currentStructure) {
    const snapshot = {};
    METRICS_CONFIG.forEach(({ id, compute }) => {
        try {
            snapshot[id] = compute(currentStructure);
        } catch (error) {
            console.warn(`Metric computation failed for ${id}`, error);
            snapshot[id] = null;
        }
    });
    return snapshot;
}

function calculateMetricDeltas(beforeSnapshot, afterSnapshot) {
    const deltas = {};
    METRICS_CONFIG.forEach(({ id }) => {
        const before = beforeSnapshot?.[id];
        const after = afterSnapshot?.[id];
        deltas[id] = (typeof before === 'number' && typeof after === 'number') ? after - before : null;
    });
    return deltas;
}

function getMetricSeries(metricId, phase = 'after') {
    if (!METRICS_BY_ID[metricId]) {
        console.warn(`Metric ${metricId} is not registered`);
        return [];
    }
    return metrics.map((entry) => {
        if (phase === 'before') {
            return entry.before?.[metricId] ?? null;
        }
        if (phase === 'delta') {
            return entry.deltas?.[metricId] ?? null;
        }
        return entry.after?.[metricId] ?? null;
    });
}

function getMetricLabel(metricId) {
    return METRICS_BY_ID[metricId]?.label ?? metricId;
}

// Update step counter display
function updateStepCounter() {
    document.getElementById('stepCounter').textContent = `Steps: ${step}`;
}

// Update step counter display
function updateRealtimeMetrics() {
    document.getElementById('metric-avg-depth').textContent = `Avg Depth: ${metrics_rt[0].avg.toFixed(2)} ± ${metrics_rt[0].std.toFixed(2)}`;
    document.getElementById('metric-avg-entropy').textContent = `Avg Entropy: ${metrics_rt[1].avg.toFixed(2)} ± ${metrics_rt[1].std.toFixed(2)}`;
}

// Update frequency display when slider value changes
document.getElementById('frequencySlider').addEventListener('input', function() {
    document.getElementById('frequencyDisplay').textContent = this.value + ' Hz';
});

let steps = 0;

// Clear button functionality
document.getElementById('clearButton').addEventListener('click', () => {
    // reset all important and relevant variables
    structure = [[]];
    redrawCanvas();
    chart.data.datasets[0].data = []; chart.update();
    step=0;
});

// Play button functionality
document.getElementById('playButton').addEventListener('click', () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    } else {
        const frequency = document.getElementById('frequencySlider').value;
        timer = setInterval(() => {

            const lof = [LoFCancel, LofCompensate, LoFCondense, LoFConfirm, LoFMeasure]
            const execution_distribution = lof_policy.lof_weights; //  [3, 1, 3, 3]

            // Create an array to hold the weighted functions
            let weightedFunctions = [];

            // Populate the weightedFunctions array based on the execution_distribution
            for (let i = 0; i < execution_distribution.length; i++) {
                for (let j = 0; j < execution_distribution[i]; j++) {
                    weightedFunctions.push(i);
                }
            }

            // Function to randomly select and execute a function based on the distribution
            function executeRandomFunction() {
                const randomIndex = Math.floor(Math.random() * weightedFunctions.length);
                const selectedOperation = lof[weightedFunctions[randomIndex]];
                const elementName = selectedOperation?.name || `operation_${weightedFunctions[randomIndex]}`;
                if (typeof selectedOperation !== 'function') {
                    console.warn('Selected operation is not callable', weightedFunctions[randomIndex]);
                    return;
                }
                const metricsBefore = computeMetricsSnapshot(structure);
                structure = selectedOperation(structure);
                const metricsAfter = computeMetricsSnapshot(structure);
                updateMetrics({
                    elementName,
                    metricsBefore,
                    metricsAfter,
                });
            }

            executeRandomFunction();
            
            redrawCanvas();
        }, 1000 / frequency);
    }
});

// Operation functions
// function air(structure) {
//     const randomPath = getRandomPath(structure);
//     addChild(randomPath);
//     counter[0]+=1;
// }

// function fire(structure) {
//     // console.log("fire")
//     duplicateRandomForm(structure);
//     counter[1]+=1;
// }

// function water(structure) {
//     // console.log("water")
//     concatenateRandomForms(structure);
//     counter[2]+=1;
// }

// function earth(structure) {
//     // console.log("earth")
//     deleteRandomPrunableArray(structure);
//     counter[3]+=1;
// }

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    // ctx.arcTo(x + width, y + height, x, y + height, radius);
    // ctx.arcTo(x, y + height, x, y, radius);
    // ctx.arcTo(x, y, x + width, y, radius);
    // ctx.closePath();
	ctx.strokeStyle = '#FFFFFF'
    ctx.stroke();
}


function drawSquares(ctx, x, y, size, structure, path = [], highlightPath = null) {
    if (structure.length === 0) {
        return;
    }

    const padding = size * 0.1; // 10% padding
    const netSize = size - 2 * padding; // Adjust size for padding
    let rowSize = Math.ceil(Math.sqrt(structure.length));
    let gap = netSize * 0.05; // Gap between squares, 5% of net size
    let squareSize = (netSize - gap * (rowSize - 1)) / rowSize;

    structure.forEach((subStructure, index) => {
        let col = index % rowSize;
        let row = Math.floor(index / rowSize);
        let newX = x + padding + (squareSize + gap) * col;
        let newY = y + padding + (squareSize + gap) * row;
        let currentPath = [...path, index];

        // Store path information for click event
        squarePaths.push({ path: currentPath, x: newX, y: newY, size: squareSize, depth: currentPath.length });

        // Highlight the clicked square
        if (highlightPath && JSON.stringify(highlightPath) === JSON.stringify(currentPath)) {
            ctx.fillStyle = 'rgba(255, 165, 0, 0.2)'; // Orange highlight
            // ctx.fillRect(newX, newY, squareSize, squareSize);
			drawRoundedRect(ctx, newX, newY, squareSize, squareSize, squareSize * 0.1); // 10% for rounded corner
			ctx.fill();
        }

        ctx.beginPath();
        drawRoundedRect(ctx, newX, newY, squareSize, squareSize, squareSize * 0.1); // 10% for rounded corner
        ctx.stroke();

        if (subStructure.length > 0) {
            drawSquares(ctx, newX, newY, squareSize, subStructure, currentPath, highlightPath);
        }
    });
}



function onCanvasClick(e) {
    const addMode = document.getElementById('addMode').value;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let clicked = false;
    squarePaths.sort((a, b) => b.depth - a.depth);

    for (let squarePath of squarePaths) {
        let { path, x, y, size } = squarePath;
        if (mouseX >= x && mouseX <= x + size && mouseY >= y && mouseY <= y + size) {
            if (addMode === 'child') {
                addChild(path);
            } else {
                addSibling(path);
            }
            clicked = true;
            redrawCanvas(path);
            break;
        }
    }

    // If no square is clicked, treat it as a click on the outer container
    if (!clicked) {
        if (addMode === 'child') {
            addChild([]); // Add child to the root
        } else {
            structure = [[...structure], []]
        }
        redrawCanvas();
    }
}


function addChild(path) {
    let target = structure;
	// console.log("path", path);
    for (let i = 0; i < path.length; i++) {
        if (!target[path[i]]) {
            // Initialize an empty array if the target is undefined
            target[path[i]] = [];
        }
        target = target[path[i]];
		// console.log("target", target)
    }
    target.push([[]]);
}

function addSibling(path, moment) {
	if (moment=='now') {
		structure=[[...structure], []]
        return;
	}
    if (path.length === 0) {
        structure.push([]);
        return;
    }

    let parentPath = path.slice(0, -1);
    let siblingIndex = path[path.length - 1] + 1;
    let parent = structure;

    parentPath.forEach(p => {
        if (!parent[p]) {
            parent[p] = [];
        }
        parent = parent[p];
    });
    parent.splice(siblingIndex, 0, []);
}

function hortonStrahler(node) {
    if (!Array.isArray(node)) return 0;
    if (node.length === 0) return 1;
    const orders = node.map(hortonStrahler);
    const m = Math.max(...orders);
    const c = orders.filter(x => x === m).length;
    return c >= 2 ? m + 1 : m;
  }

function redrawCanvas(highlightPath = null) {
    setCanvasSize(ctx.canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    squarePaths = [];
    drawSquares(ctx, 10, 10, canvas.width*0.98, structure, [], highlightPath);
}

const calculateAverages = () => {
    let sum_1 = 0;
    let sum_1_pow2 = 0;
    let sum_2 = 0;
    let sum_2_pow2 = 0;
    
    // mean = sum (values) / N
    // std = sum (values^2) / N - mean^2

    for (let i=0;i<metrics.length;i++) {
        const { step, entropy, maxDepth } = metrics[i];
        sum_1+= entropy;
        sum_1_pow2+= Math.pow(maxDepth,2);
        sum_2+= maxDepth;
        sum_2_pow2+= Math.pow(maxDepth,2);
    }

    metrics_rt[0].avg = sum_1 / metrics.length;
    metrics_rt[0].std = sum_1_pow2 / metrics.length - Math.pow(metrics_rt[0].avg,2);
    metrics_rt[1].avg = sum_2 / metrics.length;
    metrics_rt[1].std = sum_2_pow2 / metrics.length - Math.pow(metrics_rt[1].avg,2);

}

const update_chart_data = async (chart, entry) => {
    if (!chart || !entry) {
        return;
    }
    const point = buildScatterPoint(entry);
    if (!point) {
        return;
    }
    chart.data.datasets[0].data.push(point);
    const currentStep = entry.step;
    const shouldUpdate =
        scatterLastUpdateStep === null ||
        currentStep - scatterLastUpdateStep >= 20 ||
        currentStep < 20;
    if (shouldUpdate) {
        chart.update('none');
        scatterLastUpdateStep = currentStep;
    }
}

function updateMetrics({ elementName, metricsBefore, metricsAfter }) {
    const currentStep = step;
    const entry = {
        step: currentStep,
        element: elementName,
        before: metricsBefore,
        after: metricsAfter,
        deltas: calculateMetricDeltas(metricsBefore, metricsAfter),
        ...metricsAfter,
    };

    metrics.push(entry);

    recordActionMetricDelta(entry);

    update_chart_data(chart, entry);

    if (currentStep % 100 === 0){
        calculateAverages();
        updateRealtimeMetrics();
    }

    step++; // Increment step counter
    updateStepCounter();

    if (step % 100 === 0){
        calculateAverages();
        updateRealtimeMetrics();
    }
}

let structure = [[]]; // array to store LoF Structure
let metrics = []; // Array to store metrics
let metrics_rt = [
    // depth
    {
        avg: 0,
        std: 0,
    },
    // entropy
    {
        avg: 0,
        std: 0,
    }
];
let squarePaths = [];

// INIT CANVAS
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.addEventListener('click', onCanvasClick);
redrawCanvas();

// INIT CHART
let chart = null;
const DEFAULT_SCATTER_METRICS = { x: 'entropy', y: 'assembley' };
let scatterMetricSelection = { ...DEFAULT_SCATTER_METRICS };
let metricSelectors = { x: null, y: null };
let actionMetricsUI = { summary: null, charts: null };
const ACTION_METRIC_TARGETS = ['entropy', 'maxDepth', 'assembley', 'energyDiluted', 'duplicatePressure'];
const ACTION_COLOR_PALETTE = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)'
];
const ACTION_HISTORY_LIMIT = 400;
let actionColorMap = {};
let actionMetricAggregates = {};
let actionMetricCharts = {};
let scatterLastUpdateStep = null;

function initializeChartScatter() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const xLabel = getMetricLabel(scatterMetricSelection.x);
    const yLabel = getMetricLabel(scatterMetricSelection.y);
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: `${xLabel} vs ${yLabel}`,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                data: [],  // Initialize with empty data array
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: xLabel
                    }
                },
                y: {
                    type: 'linear', // logarithmic
                    position: 'left',
                    title: {
                        display: true,
                        text: yLabel,
                    }
                }
            },
        },
        onClick: function(evt, activeElements) {
            if (activeElements.length > 0) {
                const datasetIndex = activeElements[0].datasetIndex;
                const index = activeElements[0].index;
                const selectedData = chart.data.datasets[datasetIndex].data[index];
                selectedPoints.push(selectedData);
                console.log('Selected Points:', selectedPoints);
            }
        }
    });
    updateScatterChartAxes();
}

function updateScatterChartAxes() {
    if (!chart) {
        return;
    }
    const xLabel = getMetricLabel(scatterMetricSelection.x);
    const yLabel = getMetricLabel(scatterMetricSelection.y);
    if (chart.options?.scales?.x?.title) {
        chart.options.scales.x.title.text = xLabel;
    }
    if (chart.options?.scales?.y?.title) {
        chart.options.scales.y.title.text = yLabel;
    }
    if (chart.data?.datasets?.[0]) {
        chart.data.datasets[0].label = `${xLabel} vs ${yLabel}`;
    }
}

function buildScatterPoint(entry) {
    if (!entry) {
        return null;
    }
    const xValue = entry[scatterMetricSelection.x];
    const yValue = entry[scatterMetricSelection.y];
    if (typeof xValue !== 'number' || typeof yValue !== 'number') {
        return null;
    }
    return { x: xValue, y: yValue };
}

function rebuildScatterDataset() {
    if (!chart) {
        return;
    }
    chart.data.datasets[0].data = metrics
        .map(buildScatterPoint)
        .filter((point) => point !== null);
    updateScatterChartAxes();
    scatterLastUpdateStep = null;
    chart.update();
}

function populateMetricSelect(selectElement, selectedValue) {
    if (!selectElement) {
        return;
    }
    selectElement.innerHTML = '';
    METRICS_CONFIG.forEach(({ id, label }) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = label;
        if (id === selectedValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

function handleScatterMetricChange(axis, metricId) {
    if (!METRICS_BY_ID[metricId]) {
        return;
    }
    scatterMetricSelection = {
        ...scatterMetricSelection,
        [axis]: metricId,
    };
    rebuildScatterDataset();
}

function initializeMetricSelectors() {
    metricSelectors = {
        x: document.getElementById('metric-x-select'),
        y: document.getElementById('metric-y-select'),
    };
    populateMetricSelect(metricSelectors.x, scatterMetricSelection.x);
    populateMetricSelect(metricSelectors.y, scatterMetricSelection.y);

    if (metricSelectors.x) {
        metricSelectors.x.addEventListener('change', (event) => {
            handleScatterMetricChange('x', event.target.value);
        });
    }

    if (metricSelectors.y) {
        metricSelectors.y.addEventListener('change', (event) => {
            handleScatterMetricChange('y', event.target.value);
        });
    }

    updateScatterChartAxes();
}

function initializeActionMetricsUI() {
    actionMetricsUI = {
        summary: document.getElementById('action-metric-summary'),
        charts: document.getElementById('action-metric-charts'),
    };
    if (actionMetricsUI.charts) {
        initializeActionMetricCharts();
        updateActionMetricCharts();
    }
    if (actionMetricsUI.summary) {
        updateActionMetricSummary();
    }
}

function initializeActionMetricCharts() {
    actionMetricCharts = {};
    if (!actionMetricsUI.charts) {
        return;
    }
    actionMetricsUI.charts.innerHTML = '';
    ACTION_METRIC_TARGETS.forEach((metricId) => {
        const metricWrapper = document.createElement('div');
        metricWrapper.className = 'metric-chart-card';

        const title = document.createElement('h3');
        title.textContent = `${getMetricLabel(metricId)} Δ`;
        metricWrapper.appendChild(title);

        const canvas = document.createElement('canvas');
        canvas.id = `action-metric-chart-${metricId}`;
        canvas.height = 200;
        metricWrapper.appendChild(canvas);

        actionMetricsUI.charts.appendChild(metricWrapper);

        const ctx = canvas.getContext('2d');
        actionMetricCharts[metricId] = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                parsing: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Step',
                        },
                    },
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Average Δ',
                        },
                    },
                },
            },
        });
    });
}

function getActionColor(actionName, alpha = 1) {
    if (!actionColorMap[actionName]) {
        const index = Object.keys(actionColorMap).length % ACTION_COLOR_PALETTE.length;
        actionColorMap[actionName] = ACTION_COLOR_PALETTE[index];
    }
    const base = actionColorMap[actionName];
    if (alpha === 1) {
        return base;
    }
    const rgbaMatch = base.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)$/);
    if (!rgbaMatch) {
        return base;
    }
    const [, r, g, b] = rgbaMatch;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getActionMetricAggregate(actionName, metricId) {
    if (!actionMetricAggregates[actionName]) {
        actionMetricAggregates[actionName] = {};
    }
    if (!actionMetricAggregates[actionName][metricId]) {
        actionMetricAggregates[actionName][metricId] = {
            count: 0,
            sum: 0,
            sumSq: 0,
            avg: 0,
            std: 0,
            history: [],
        };
    }
    return actionMetricAggregates[actionName][metricId];
}

function formatSigned(value, decimals = 3) {
    if (!Number.isFinite(value)) {
        return 'n/a';
    }
    const magnitude = Math.abs(value).toFixed(decimals);
    if (value > 0) {
        return `+${magnitude}`;
    }
    if (value < 0 || Object.is(value, -0)) {
        return `-${magnitude}`;
    }
    return `+${magnitude}`;
}

function updateActionMetricSummary() {
    if (!actionMetricsUI.summary) {
        return;
    }
    actionMetricsUI.summary.innerHTML = '';
    const fragment = document.createDocumentFragment();
    Object.keys(actionMetricAggregates).forEach((actionName) => {
        const metricsForAction = actionMetricAggregates[actionName];
        const actionBlock = document.createElement('div');
        actionBlock.className = 'action-summary-group';

        const title = document.createElement('h3');
        title.textContent = actionName;
        actionBlock.appendChild(title);

        METRICS_CONFIG.forEach(({ id, label }) => {
            const stats = metricsForAction[id];
            if (!stats || stats.count === 0) {
                return;
            }
            const row = document.createElement('div');
            row.className = 'action-summary-row';

            const name = document.createElement('span');
            name.textContent = `${label} Δ`;
            row.appendChild(name);

            const value = document.createElement('span');
            value.textContent = `${formatSigned(stats.avg)} ± ${formatSigned(stats.std)}`;
            row.appendChild(value);

            actionBlock.appendChild(row);
        });

        fragment.appendChild(actionBlock);
    });
    actionMetricsUI.summary.appendChild(fragment);
}

function ensureActionDataset(metricId, actionName) {
    const chartInstance = actionMetricCharts[metricId];
    if (!chartInstance) {
        return null;
    }
    let dataset = chartInstance.data.datasets.find((d) => d.label === actionName);
    if (!dataset) {
        const borderColor = getActionColor(actionName, 1);
        dataset = {
            label: actionName,
            borderColor,
            backgroundColor: getActionColor(actionName, 0.2),
            fill: false,
            data: [],
            tension: 0.2,
        };
        chartInstance.data.datasets.push(dataset);
    }
    return dataset;
}

function updateActionMetricCharts() {
    ACTION_METRIC_TARGETS.forEach((metricId) => {
        const chartInstance = actionMetricCharts[metricId];
        if (!chartInstance) {
            return;
        }
        Object.keys(actionMetricAggregates).forEach((actionName) => {
            const stats = actionMetricAggregates[actionName][metricId];
            const dataset = ensureActionDataset(metricId, actionName);
            if (!dataset || !stats) {
                return;
            }
            // Cap the history to prevent runaway growth
            stats.history = stats.history.slice(-ACTION_HISTORY_LIMIT);
            dataset.data = stats.history.map((point) => ({ x: point.step, y: point.avg }));
        });
        chartInstance.update('none');
    });
}

function recordActionMetricDelta(entry) {
    const actionName = entry.element;
    if (!actionName || !entry.deltas) {
        return;
    }
    Object.keys(entry.deltas).forEach((metricId) => {
        const delta = entry.deltas[metricId];
        if (typeof delta !== 'number' || Number.isNaN(delta)) {
            return;
        }
        const aggregate = getActionMetricAggregate(actionName, metricId);
        aggregate.count += 1;
        aggregate.sum += delta;
        aggregate.sumSq += delta * delta;
        aggregate.avg = aggregate.sum / aggregate.count;
        const variance = aggregate.sumSq / aggregate.count - Math.pow(aggregate.avg, 2);
        aggregate.std = variance > 0 ? Math.sqrt(variance) : 0;
        aggregate.history.push({ step: entry.step, avg: aggregate.avg });
        if (aggregate.history.length > ACTION_HISTORY_LIMIT) {
            aggregate.history.shift();
        }
    });

    updateActionMetricSummary();
    updateActionMetricCharts();
}

function initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Entropy',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                yAxisID: 'yEntropy',
                fill: false,
            }, {
                label: 'Max Depth',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                yAxisID: 'yDepth',
                fill: false,
            },
            {
                label: 'Assembley',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                yAxisID: 'Assembley Index',
                fill: false,
            },
            {
                label: 'Omega',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                yAxisID: 'Omega',
                fill: false,
            },
            {
                label: 'Order',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                yAxisID: 'Order',
                fill: false,
            }
        ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                },
                yEntropy: {
                    type: 'linear',
                    position: 'left',
                },
                yDepth: {
                    type: 'linear',
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        },
    });
}

function setCanvasSize(canvas) {
    var parent = canvas.parentNode;
    var parentRect = parent.getBoundingClientRect();
    var computedStyles = getComputedStyle(parent);
    var width = parentRect.width || parseInt(computedStyles.getPropertyValue("width"), 10) || window.innerWidth * 0.5;
    var height = parentRect.height || parseInt(computedStyles.getPropertyValue("height"), 10) || window.innerHeight * 0.5;

    if (!Number.isFinite(width) || width <= 0) {
        width = window.innerWidth * 0.5;
    }

    if (!Number.isFinite(height) || height <= 0) {
        height = width;
    }

    let s = Math.min(width, height);

    canvas.width = s * .9;
    canvas.height = s * .9;
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeChartScatter(); // initializeChart
    initializeMetricSelectors();
    initializeActionMetricsUI();
    rebuildScatterDataset();

    const controlPanelToggle = document.getElementById('controlPanelToggle');
    if (controlPanelToggle) {
        controlPanelToggle.addEventListener('click', toggleControlPanel);
        controlPanelToggle.setAttribute('aria-expanded', 'true');
    }
});

document.getElementById('exportCsvButton').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Step,Element,Entropy,Max Depth, Assembly, Omega, Order\r\n";

    metrics.forEach(row => {
        const rowContent = `${row.step},${row.element},${row.entropy},${row.maxDepth},${row.assembley},${row.omega},${row.order}\r\n`;
        csvContent += rowContent;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "metrics.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
});

// Handle zoom
canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const mousex = event.clientX - canvas.getBoundingClientRect().left;
    const mousey = event.clientY - canvas.getBoundingClientRect().top;
    const wheel = event.deltaY < 0 ? 1.1 : 0.9;
    const newScale = scale * wheel;

    // Translate so the origin will be the mouse coordinates
    originx -= mousex / scale - mousex / newScale;
    originy -= mousey / scale - mousey / newScale;

    // Scale the canvas
    scale = newScale;

    // Redraw
    draw();
});

function toggleScale() {
    const currentXScaleType = chart.options.scales.x.type;
    const newScaleType = currentXScaleType === 'linear' ? 'logarithmic' : 'linear';
    chart.options.scales.x.type = newScaleType;
    chart.options.scales.y.type = newScaleType;
    chart.update();
}

function toggleControlPanel() {
    const panel = document.getElementById('controlPanel');
    const toggleButton = document.getElementById('controlPanelToggle');
    if (!panel || !toggleButton) {
        return;
    }
    panel.classList.toggle('collapsed');
    const collapsed = panel.classList.contains('collapsed');
    toggleButton.textContent = collapsed ? 'Expand' : 'Collapse';
    toggleButton.setAttribute('aria-expanded', (!collapsed).toString());
}

document.getElementById('toggleScaleButton').addEventListener('click', toggleScale);