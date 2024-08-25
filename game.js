// Set up Matter.js
const { Engine, Render, Runner, World, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter;

// Create the engine and world
const engine = Engine.create();
const { world } = engine;

// Set up canvas dimensions
const canvas = document.getElementById('gameCanvas');
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Renderer settings
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

// Create ball and hole
const ball = Bodies.circle(100, 100, 20, {
    restitution: 0.7,  // Bounciness of the ball
    render: { fillStyle: '#0095DD' }
});
const hole = Bodies.circle(width - 100, height - 100, 30, {
    isStatic: true,
    isSensor: true, // No collision, just detect overlap
    render: { fillStyle: '#FF5733' }
});

World.add(world, [ball, hole]);

// Ground and walls (with bounciness)
const ground = Bodies.rectangle(width / 2, height + 25, width, 50, { 
    isStatic: true, 
    restitution: 0.8, // Bouncy ground
    render: { fillStyle: '#333' }
});
const leftWall = Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true });
const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true });
const ceiling = Bodies.rectangle(width / 2, -25, width, 50, { isStatic: true });
World.add(world, [ground, leftWall, rightWall, ceiling]);

// Mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: { visible: false }
    }
});
World.add(world, mouseConstraint);

// Shapes Drawing
let currentShape = 'rect';
let isDrawing = false;
let points = [];

document.getElementById('drawRect').onclick = () => { currentShape = 'rect'; };
document.getElementById('drawCircle').onclick = () => { currentShape = 'circle'; };
document.getElementById('drawIrregular').onclick = () => { currentShape = 'irregular'; };
document.getElementById('reset').onclick = resetGame;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', finishDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchend', finishDrawing);

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
            points = []; // Reset for the next shape
        }

        isDrawing = false;
    }
}

// Check for collision with the hole
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(pair => {
        if (pair.bodyA === ball && pair.bodyB === hole || pair.bodyA === hole && pair.bodyB === ball) {
            alert('Level Complete!');
            resetGame();
        }
    });
});

function resetGame() {
    World.clear(world, false);
    World.add(world, [ball, hole, ground, leftWall, rightWall, ceiling, mouseConstraint]);
    Matter.Body.setPosition(ball, { x: 100, y: 100 });
    Matter.Body.setVelocity(ball, { x: 0, y: 0 });
}
