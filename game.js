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
const totalLevels = 50;
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
    // This function will configure the level based on its difficulty and type of challenge
    if (level <= 20) {
        setupEasyLevel(level);
    } else if (level <= 40) {
        setupModerateLevel(level);
    } else {
        setupDifficultLevel(level);
    }
}

function setupEasyLevel(level) {
    // Example of an easy level
    const ball = Bodies.circle(100, 100, 20, { restitution: 0.7, render: { fillStyle: '#0095DD' } });
    const hole = Bodies.circle(width - 100, height - 100, 30, { isStatic: true, isSensor: true, render: { fillStyle: '#FF5733' } });
    World.add(world, [ball, hole]);

    // Simple obstacles or guides
    const rectObstacle = Bodies.rectangle(width / 2, height - 200, 200, 20, { isStatic: true, angle: Math.PI * 0.1 });
    World.add(world, rectObstacle);

    setupCollisionDetection(ball, hole);
}

function setupModerateLevel(level) {
    // Example of a moderate level
    const ball = Bodies.circle(100, 100, 20, { restitution: 0.7, render: { fillStyle: '#0095DD' } });
    const hole = Bodies.circle(width - 150, height - 150, 30, { isStatic: true, isSensor: true, render: { fillStyle: '#FF5733' } });
    World.add(world, [ball, hole]);

    // Add more complex obstacles, slopes, or dynamic elements
    const slope = Bodies.rectangle(width / 2, height - 300, 300, 20, { isStatic: true, angle: Math.PI * 0.2 });
    World.add(world, slope);

    const dynamicBlock = Bodies.rectangle(width / 2, height / 2, 100, 100, { restitution: 0.5 });
    World.add(world, dynamicBlock);

    setupCollisionDetection(ball, hole);
}

function setupDifficultLevel(level) {
    // Example of a difficult level
    const ball = Bodies.circle(100, 100, 20, { restitution: 0.7, render: { fillStyle: '#0095DD' } });
    const hole = Bodies.circle(width - 200, height - 200, 30, { isStatic: true, isSensor: true, render: { fillStyle: '#FF5733' } });
    World.add(world, [ball, hole]);

    // Add challenging obstacles and tight spaces
    const narrowPassage = Bodies.rectangle(width / 2, height - 250, 100, 20, { isStatic: true });
    World.add(world, narrowPassage);

    const dynamicObstacle = Bodies.rectangle(width / 2, height / 2, 50, 50, { restitution: 0.8 });
    World.add(world, dynamicObstacle);

    setupCollisionDetection(ball, hole);
}

function setupCollisionDetection(ball, hole) {
    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach(pair => {
            if (pair.bodyA === ball && pair.bodyB === hole || pair.bodyA === hole && pair.bodyB === ball) {
                alert(`Level ${currentLevel} Complete!`);
                currentLevel++;
                if (currentLevel > totalLevels) {
                    alert('Congratulations! You have completed all levels!');
                    currentLevel = 1;
                }
                updateLevelInfo();
                loadLevel(currentLevel);
            }
        });
    });
}

