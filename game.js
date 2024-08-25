const { Engine, Render, Runner, World, Bodies, Events, Body, Mouse, MouseConstraint } = Matter;

const engine = Engine.create();
const { world } = engine;

const canvas = document.getElementById('gameCanvas');
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#eef',
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Game state
let currentLevel = 1;
const totalLevels = 10;
let currentShape = 'rect';
let isDrawing = false;
let points = [];

// UI elements
const levelInfo = document.getElementById('levelInfo');
updateLevelInfo();

// Initialize level
loadLevel(currentLevel);

// Event listeners for shape drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', finishDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchend', finishDrawing);

document.getElementById('drawRect').onclick = () => { currentShape = 'rect'; };
document.getElementById('drawCircle').onclick = () => { currentShape = 'circle'; };
document.getElementById('drawIrregular').onclick = () => { currentShape = 'irregular'; };
document.getElementById('reset').onclick = resetGame;

function updateLevelInfo() {
    levelInfo.textContent = `Level: ${currentLevel}`;
}

function loadLevel(level) {
    World.clear(world, false);

    // Add ground, walls, and other static elements common to all levels
    const ground = Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true });
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true });
    const ceiling = Bodies.rectangle(width / 2, -25, width, 50, { isStatic: true });
    World.add(world, [ground, leftWall, rightWall, ceiling]);

    // Add specific elements depending on the level
    setupLevel(level);
}

function setupLevel(level) {
    if (level <= 3) {
        setupEasyLevel(level);
    } else if (level <= 7) {
        setupModerateLevel(level);
    } else {
        setupDifficultLevel(level);
    }
}

function setupEasyLevel(level) {
    const ball = Bodies.circle(100, 100, 20, { restitution: 0.7, render: { fillStyle: '#0095DD' } });
    const hole = Bodies.circle(width - 100, height - 100, 30, { isStatic: true, isSensor: true, render: { fillStyle: '#FF5733' } });
    World.add(world, [ball, hole]);

    if (level === 2) {
        const rectObstacle = Bodies.rectangle(width / 2, height - 200, 200, 20, { isStatic: true, angle: Math.PI * 0.1 });
        World.add(world, rectObstacle);
    }

    if (level === 3) {
        const rectObstacle1 = Bodies.rectangle(width / 3, height - 200, 200, 20, { isStatic: true, angle: Math.PI * 0.1 });
        const rectObstacle2 = Bodies.rectangle(2 * width / 3, height - 300, 200, 20, { isStatic: true, angle: -Math.PI * 0.1 });
        World.add(world, [rectObstacle1, rectObstacle2]);
    }

    setupCollisionDetection(ball, hole);
}

function setupModerateLevel(level) {
    const ball = Bodies.circle(100, 100, 20, { restitution: 0.7, render: { fillStyle: '#0095DD' } });
    const hole = Bodies.circle(width - 150, height - 150, 30, { isStatic: true, isSensor: true, render: { fillStyle: '#FF5733' } });
    World.add(world, [ball, hole]);

    if (level === 4) {
        const slope = Bodies.rectangle(width / 2, height - 300, 300, 20, { isStatic: true, angle: Math.PI * 0.2 });
        World.add(world, slope);
    }

    if (level === 5) {
        const dynamicBlock = Bodies.rectangle(width / 2, height / 2, 100, 100, { restitution: 0.5 });
        World.add(world, dynamicBlock);
    }

    if (level === 6) {
        const rain = createRain();
        World.add(world, rain);
    }

    if (level === 7) {
        const nails = createNails();
        World.add(world, nails);
    }

    setupCollisionDetection(ball, hole);
}

function setupDifficultLevel(level) {
    const ball = Bodies.circle(100, 100, 20, { restitution: 0.7, render: { fillStyle: '#0095DD' } });
    const hole = Bodies.circle(width - 200, height - 200, 30, { isStatic: true, isSensor: true, render: { fillStyle: '#FF5733' } });
    World.add(world, [ball, hole]);

    if (level === 8) {
        const narrowPassage = Bodies.rectangle(width / 2, height - 250, 100, 20, { isStatic: true });
        World.add(world, narrowPassage);
    }

    if (level === 9) {
        const movingObstacle = Bodies.rectangle(width / 2, height / 2, 50, 50, { restitution: 0.8 });
        World.add(world, movingObstacle);
    }

    if (level === 10) {
        const rain = createRain();
        const nails = createNails();
        World.add(world, [rain, nails]);
    }

    setupCollisionDetection(ball, hole);
}

function createRain() {
    const raindrops = [];
    for (let i = 0; i < 50; i++) {
        const drop = Bodies.circle(Math.random() * width, Math.random() * height, 2, {
            isStatic: true,
            render: { fillStyle: '#00f' }
        });
        raindrops.push(drop);
    }
    return raindrops;
}

function createNails() {
    const nails = [];
    for (let i = 0; i < 10; i++) {
        const nail = Bodies.rectangle(Math.random() * width, Math.random() * height, 10, 30, {
            isStatic: true,
            angle: Math.PI * Math.random(),
            render: { fillStyle: '#555' }
        });
        nails.push(nail);
    }
    return nails;
}

function setupCollisionDetection(ball, hole) {
    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach(pair => {
            if (pair.bodyA === ball && pair.bodyB === hole || pair.bodyA === hole && pair.bodyB === ball) {
                alert(`Level ${currentLevel} Complete!`);
                currentLevel++;
                if (currentLevel > totalLevels) {
                    alert('Congratulations! You completed all levels!');
                    currentLevel = 1;
                }
                resetGame();
            }
            if (pair.bodyA === ball || pair.bodyB === ball) {
                if (pair.bodyA.label === 'nail' || pair.bodyB.label === 'nail') {
                    alert('Ball popped! Try again.');
                    resetGame();
                }
            }
        });
    });
}

function startDrawing(event) {
    if (event.type === 'touchstart') {
        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
    }
    startX = event.clientX;
    startY = event.clientY;
    isDrawing = true;

    if (currentShape === 'irregular') {
        points.push({ x: startX, y: startY });
    }
}

function finishDrawing(event) {
    if (event.type === 'touchend') {
        event.clientX = event.changedTouches[0].clientX;
        event.clientY = event.changedTouches[0].clientY;
    }
    if (isDrawing) {
        const endX = event.clientX;
        const endY = event.clientY;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        if (currentShape === 'rect') {
            const rect = Bodies.rectangle((startX + endX) / 2, (startY + endY) / 2, width, height, { isStatic: true });
            World.add(world, rect);
        } else if (currentShape === 'circle') {
            const radius = Math.max(width, height) / 2;
            const circle = Bodies.circle(startX, startY, radius, { isStatic: true });
            World.add(world, circle);
        } else if (currentShape === 'irregular' && points.length > 2) {
            points.push({ x: endX, y: endY });
            const vertices = points.map(point => ({ x: point.x, y: point.y }));
            const irregular = Bodies.fromVertices(startX, startY, [vertices], { isStatic: true });
            World.add(world, irregular);
            points = [];
        }

        isDrawing = false;
    }
}

function resetGame() {
    loadLevel(currentLevel);
}


