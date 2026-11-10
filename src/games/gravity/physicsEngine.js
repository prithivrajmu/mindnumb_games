// Physics Engine Wrapper for Matter.js
// Provides abstraction layer for physics simulation

import Matter from 'matter-js';

export class PhysicsEngine {
    constructor(width, height, gravity = { x: 0, y: 1 }) {
        // Create engine
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.gravity = gravity;

        // Dimensions
        this.width = width;
        this.height = height;

        // Bodies tracking
        this.bodies = [];
        this.staticBodies = [];
    }

    // Add a body to the world
    addBody(config) {
        let body;

        if (config.type === 'circle') {
            body = Matter.Bodies.circle(
                config.x,
                config.y,
                config.radius,
                {
                    restitution: config.restitution || 0.6,
                    friction: config.friction || 0.01,
                    isStatic: config.isStatic || false,
                    isSensor: config.isSensor || false,
                    label: config.label || 'circle'
                }
            );
        } else if (config.type === 'rectangle') {
            body = Matter.Bodies.rectangle(
                config.x,
                config.y,
                config.width,
                config.height,
                {
                    restitution: config.restitution || 0.3,
                    friction: config.friction || 0.1,
                    isStatic: config.isStatic || false,
                    isSensor: config.isSensor || false,
                    angle: config.angle || 0,
                    label: config.label || 'rectangle'
                }
            );
        }

        if (body) {
            body.render = { fillStyle: config.color || '#f56565' };
            Matter.World.add(this.world, body);

            if (config.isStatic) {
                this.staticBodies.push(body);
            } else {
                this.bodies.push(body);
            }

            return body;
        }

        return null;
    }

    // Remove a body
    removeBody(body) {
        Matter.World.remove(this.world, body);
        this.bodies = this.bodies.filter(b => b !== body);
        this.staticBodies = this.staticBodies.filter(b => b !== body);
    }

    // Step the simulation
    step(delta = 1000 / 60) {
        Matter.Engine.update(this.engine, delta);
    }

    // Reset the world
    reset() {
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
        this.bodies = [];
        this.staticBodies = [];
    }

    // Set gravity
    setGravity(x, y) {
        this.engine.gravity.x = x;
        this.engine.gravity.y = y;
    }

    // Get all bodies
    getAllBodies() {
        return [...this.staticBodies, ...this.bodies];
    }

    // Get dynamic bodies only
    getDynamicBodies() {
        return this.bodies;
    }

    // Check collision between two bodies
    checkCollision(bodyA, bodyB) {
        const collision = Matter.SAT.collides(bodyA, bodyB);
        return collision.collided;
    }

    // Check if body is in bounds
    isInBounds(body, bounds) {
        const { x, y } = body.position;
        return (
            x >= bounds.x &&
            x <= bounds.x + bounds.width &&
            y >= bounds.y &&
            y <= bounds.y + bounds.height
        );
    }
}
