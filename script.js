// State
const state = {
    vecA: { x: 5, y: 0 },
    vecB: { x: 3, y: 4 },
    isDragging: null,
    scale: 25,
    center: { x: 300, y: 250 }
};

// DOM Elements
const svg = document.getElementById('svg-canvas');
const handles = {
    A: document.getElementById('handle-a'),
    B: document.getElementById('handle-b')
};
const elements = {
    lineA: document.getElementById('vec-a-line'),
    lineB: document.getElementById('vec-b-line'),
    ringA: document.getElementById('handle-a-ring'),
    ringB: document.getElementById('handle-b-ring'),
    projLine: document.getElementById('projection-line'),
    projBar: document.getElementById('projection-bar'),
    labelA: document.getElementById('label-a'),
    labelB: document.getElementById('label-b'),
    angleLabel: document.getElementById('angle-label'),
    legendA: document.getElementById('legend-a'),
    legendB: document.getElementById('legend-b'),
    resTotal: document.getElementById('res-total'),
    resInterpret: document.getElementById('res-interpret'),
    formulaAlgebraicStep: document.getElementById('formula-algebraic-step'),
    formulaAlgebraicRes: document.getElementById('formula-algebraic-res'),
    magAX: document.getElementById('mag-a-x'),
    magAY: document.getElementById('mag-a-y'),
    magAVal: document.getElementById('mag-a-val'),
    magBX: document.getElementById('mag-b-x'),
    magBY: document.getElementById('mag-b-y'),
    magBVal: document.getElementById('mag-b-val'),
    geoA: document.getElementById('geo-a'),
    geoB: document.getElementById('geo-b'),
    geoCosLabel: document.getElementById('geo-cos-label'),
    geoCosVal: document.getElementById('geo-cos-val'),
    geoRes: document.getElementById('geo-res'),
    // Nav Elements
    btnExplanation: document.getElementById('btn-explanation'),
    btnResults: document.getElementById('btn-results'),
    viewExplanation: document.getElementById('view-explanation'),
    viewResults: document.getElementById('view-results')
};

// Helpers
const magnitude = (v) => Math.sqrt(v.x ** 2 + v.y ** 2);
const toSVG = (v) => ({
    x: state.center.x + v.x * state.scale,
    y: state.center.y - v.y * state.scale
});

function update() {
    const vecA = state.vecA;
    const vecB = state.vecB;

    const dotProduct = vecA.x * vecB.x + vecA.y * vecB.y;
    const magA = magnitude(vecA);
    const magB = magnitude(vecB);

    let angleRad = 0;
    if (magA > 0 && magB > 0) {
        const cosTheta = Math.max(-1, Math.min(1, dotProduct / (magA * magB)));
        angleRad = Math.acos(cosTheta);
    }
    const angleDeg = angleRad * (180 / Math.PI);

    // Proyección
    let projPoint = { x: 0, y: 0 };
    if (magB > 0) {
        const scalarProj = dotProduct / (magB ** 2);
        projPoint = { x: vecB.x * scalarProj, y: vecB.y * scalarProj };
    }

    const posA = toSVG(vecA);
    const posB = toSVG(vecB);
    const posProj = toSVG(projPoint);
    const origin = state.center;

    // Update SVG Elements
    elements.lineA.setAttribute('x2', posA.x);
    elements.lineA.setAttribute('y2', posA.y);
    elements.lineB.setAttribute('x2', posB.x);
    elements.lineB.setAttribute('y2', posB.y);

    handles.A.setAttribute('cx', posA.x);
    handles.A.setAttribute('cy', posA.y);
    handles.B.setAttribute('cx', posB.x);
    handles.B.setAttribute('cy', posB.y);

    elements.ringA.setAttribute('cx', posA.x);
    elements.ringA.setAttribute('cy', posA.y);
    elements.ringB.setAttribute('cx', posB.x);
    elements.ringB.setAttribute('cy', posB.y);

    elements.projLine.setAttribute('x1', posA.x);
    elements.projLine.setAttribute('y1', posA.y);
    elements.projLine.setAttribute('x2', posProj.x);
    elements.projLine.setAttribute('y2', posProj.y);

    elements.projBar.setAttribute('x1', origin.x);
    elements.projBar.setAttribute('y1', origin.y);
    elements.projBar.setAttribute('x2', posProj.x);
    elements.projBar.setAttribute('y2', posProj.y);

    elements.labelA.setAttribute('x', posA.x + 10);
    elements.labelA.setAttribute('y', posA.y - 10);
    elements.labelB.setAttribute('x', posB.x + 10);
    elements.labelB.setAttribute('y', posB.y - 10);

    elements.angleLabel.textContent = `${angleDeg.toFixed(0)}°`;
    elements.angleLabel.setAttribute('x', origin.x + 10);
    elements.angleLabel.setAttribute('y', origin.y - 10);

    // Update UI Sidebar
    elements.legendA.textContent = `Vector A (${vecA.x}, ${vecA.y})`;
    elements.legendB.textContent = `Vector B (${vecB.x}, ${vecB.y})`;

    elements.resTotal.textContent = `A · B = ${dotProduct}`;
    elements.resInterpret.textContent = dotProduct === 0 ? "Perpendiculares (90°)" : dotProduct > 0 ? "Dirección Similar" : "Dirección Opuesta";

    elements.formulaAlgebraicStep.textContent = `(${vecA.x}·${vecB.x}) + (${vecA.y}·${vecB.y})`;
    elements.formulaAlgebraicRes.textContent = dotProduct;

    elements.magAX.textContent = vecA.x;
    elements.magAY.textContent = vecA.y;
    elements.magAVal.textContent = magA.toFixed(2);

    elements.magBX.textContent = vecB.x;
    elements.magBY.textContent = vecB.y;
    elements.magBVal.textContent = magB.toFixed(2);

    elements.geoA.textContent = magA.toFixed(1);
    elements.geoB.textContent = magB.toFixed(1);
    elements.geoCosLabel.textContent = `cos(${angleDeg.toFixed(0)}°)`;
    elements.geoCosVal.textContent = Math.cos(angleRad).toFixed(2);
    elements.geoRes.textContent = (magA * magB * Math.cos(angleRad)).toFixed(1);
}

// Event Listeners
function handleStart(target) {
    return (e) => {
        state.isDragging = target;
        document.body.style.cursor = 'grabbing';
    };
}

function handleEnd() {
    state.isDragging = null;
    document.body.style.cursor = 'default';
}

function handleMove(e) {
    if (!state.isDragging) return;

    const svgRect = svg.getBoundingClientRect();
    let clientX, clientY;

    if (e.type.includes('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const viewBoxWidth = 600;
    const viewBoxHeight = 500;
    const scaleX = viewBoxWidth / svgRect.width;
    const scaleY = viewBoxHeight / svgRect.height;

    const rawX = (clientX - svgRect.left) * scaleX;
    const rawY = (clientY - svgRect.top) * scaleY;

    let newX = Math.round((rawX - state.center.x) / state.scale);
    let newY = Math.round(-(rawY - state.center.y) / state.scale);

    // Bounds
    newX = Math.max(-11, Math.min(11, newX));
    newY = Math.max(-8, Math.min(8, newY));

    if (state.isDragging === 'A') state.vecA = { x: newX, y: newY };
    if (state.isDragging === 'B') state.vecB = { x: newX, y: newY };

    update();
}

handles.A.addEventListener('mousedown', handleStart('A'));
handles.B.addEventListener('mousedown', handleStart('B'));
handles.A.addEventListener('touchstart', handleStart('A'));
handles.B.addEventListener('touchstart', handleStart('B'));

window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', handleMove);
window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchend', handleEnd);

// Navigation logic
function switchView(view) {
    if (view === 'explanation') {
        elements.viewExplanation.classList.remove('hidden');
        elements.viewResults.classList.add('hidden');
        elements.btnExplanation.classList.add('active');
        elements.btnResults.classList.remove('active');
    } else {
        elements.viewExplanation.classList.add('hidden');
        elements.viewResults.classList.remove('hidden');
        elements.btnExplanation.classList.remove('active');
        elements.btnResults.classList.add('active');
    }
}

elements.btnExplanation.addEventListener('click', () => switchView('explanation'));
elements.btnResults.addEventListener('click', () => switchView('results'));

// Initial update
update();
