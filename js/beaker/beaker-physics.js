
let engine, world, render;
let physicsBodies = [];

function initBeakerPhysics() {
    const canvas = document.getElementById('beakerCanvas');
    if (!canvas) return;
    
    // Create Matter.js engine
    engine = Matter.Engine.create();
    world = engine.world;
    world.gravity.y = 1;
    
    // Create renderer
    render = Matter.Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: 400,
            height: 600,
            wireframes: false,
            background: 'transparent'
        }
    });
    
    // Create beaker walls
    const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };
    const leftWall = Matter.Bodies.rectangle(50, 450, 10, 450, wallOptions);
    const rightWall = Matter.Bodies.rectangle(350, 450, 10, 450, wallOptions);
    const bottomWall = Matter.Bodies.rectangle(200, 590, 300, 10, wallOptions);
    
    Matter.World.add(world, [leftWall, rightWall, bottomWall]);
    
    // Run engine
    Matter.Engine.run(engine);
    Matter.Render.run(render);
    
    console.log('✅ Physics engine initialized');
}

function addPhysicsBody(element, position) {
    const prop = elementProperties[element];
    if (!prop) return;
    
    const x = position?.x || 200;
    const y = position?.y || 100;
    const radius = prop.mass || 15;
    
    const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.5,
        friction: 0.1,
        density: prop.density || 1,
        render: {
            fillStyle: prop.color,
            strokeStyle: adjustColor(prop.color, -30),
            lineWidth: 2
        },
        label: element
    });
    
    Matter.World.add(world, body);
    physicsBodies.push(body);
    
    // Add text label
    addElementLabel(body, element);
}

function addElementLabel(body, element) {
    // Labels are rendered via canvas overlay (optional implementation)
}

function clearBeakerPhysics() {
    physicsBodies.forEach(body => {
        Matter.World.remove(world, body);
    });
    physicsBodies = [];
}
