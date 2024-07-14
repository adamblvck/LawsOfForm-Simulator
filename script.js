// const { calculateAssemblyIndex} = require('./assembley.js');

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

function calculateMaxDepth(structure, currentDepth = 0) {
    if (!Array.isArray(structure) || structure.length === 0) return currentDepth;
    return Math.max(...structure.map(sub => calculateMaxDepth(sub, currentDepth + 1)));
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

// Play button functionality
document.getElementById('playButton').addEventListener('click', () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    } else {
        const frequency = document.getElementById('frequencySlider').value;
        timer = setInterval(() => {
            const randomNumber = Math.random() * 100; // Generate a number between 0 and 100
            let element = 'spirit';
            if (randomNumber < 25) {
                // structure = air(structure); // 30% chance for air
                structure = LoFCancel(structure)
                element = '=[[]]'
            } else if (randomNumber < 50) {
                // structure = fire(structure); // Additional 30% chance for fire
                structure = LoFConfirm(structure)
                element = '[A]=[A][A]'
            } else if (randomNumber < 75) {
                // structure = water(structure); // Additional 20% chance for water
                structure = LoFCondense(structure)
                element = '[A][A]=[A]'
            } else {
                // structure = earth(structure); // Remaining 20% chance for earth
                structure = LofCompensate(structure)
                element = '[[A]]=A'
            }
            updateMetrics(element);
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

const update_chart_data = async (chart) => {
    chart.data.datasets[0].data.push({x: metrics[metrics.length-1].entropy, y: metrics[metrics.length-1].assembley});
}

function updateMetrics(element) {
    const entropy = calculateEntropy(structure);
    const maxDepth = calculateMaxDepth(structure);
    const assembley = calculateAssemblyIndex(structure);
    const omega = calculateOmega(structure);
    const order = formCount(structure);
    metrics.push({ step, element, entropy, maxDepth, assembley, omega, order});

    // if (step % 20 == 0){
    //     chart.data.labels.push(step);
    //     chart.data.datasets[0].data.push(entropy);
    //     chart.data.datasets[1].data.push(maxDepth);
    //     chart.data.datasets[2].data.push(assembley);
    //     chart.data.datasets[3].data.push(omega);
    //     chart.data.datasets[4].data.push(order);
    //     chart.update();
    // }

    update_chart_data(chart)

    if (step % 100 == 0){
        chart.update();
    }

    step++; // Increment step counter
    updateStepCounter();

    if (step % 100 == 0){
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

function initializeChartScatter() {
    const ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Entropy vs Assembly',
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
                        text: 'Entropy'
                    }
                },
                y: {
                    type: 'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Assembly',
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
    var parent = canvas.parentNode,
        styles = getComputedStyle(parent),
        w = parseInt(styles.getPropertyValue("width"), 10),
        h = parseInt(styles.getPropertyValue("height"), 10);

    let s = Math.min(w,h);

    canvas.width = s*.9;
    canvas.height = s*.9;
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', initializeChartScatter); // initializeChart

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