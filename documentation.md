# Element 5: Dual Solar System Simulation

## 1. Project Overview

This project represents "Element 5," a comprehensive 3D interactive application built with Babylon.js and Havok Physics. The core feature of this element is a dual-system simulation that allows users to toggle between two distinct planetary environments: the Alpha Centauri Star System and our own Solar System.Additionally, the project features a fully playable third-person character controller with physics-based movement, demonstrating advanced interaction within these environments.Key FeaturesDual Planetary Simulation: Two separate scenes demonstrating different orbital mechanics.Physics Integration: Implementation of the Havok Physics engine for collision detection, gravity, and object interaction.Third-Person Controller: A camera-relative movement system using physics impulses for realistic locomotion.Procedural Environments: Starfields and planets generated via code and texture manipulation.

## 2. Code Structure & Organization

The project is architected to separate the logic for the two different solar systems while sharing a common player controller. This modular approach ensures the code is functional and organized.File Breakdownindex.ts: The application entry point. It initializes the Engine, manages the rendering loop, and handles the logic for switching between scenes using setSceneIndex.createCharacterController.ts: Encapsulates the player logic. It handles keyboard input, calculates movement relative to the camera, and applies linear velocity to the physics capsule.scene01/createStartScene.ts: Contains the logic for the Alpha Centauri system (Binary/Trinary star mechanics).scene02/createStartScene.ts: Contains the logic for the Solar System (Factory pattern for planet generation).gui/guiScene.ts: Provides the user interface to trigger the scene switching logic.

## 3. Scene Creation & Logic Discussion

Scene 1: Alpha Centauri (Binary Mechanics)The creation of this scene required specific logic to simulate a Binary Star System. Unlike a standard solar system where planets orbit a static center, this scene features two suns (Alpha Centauri A and B) orbiting a shared center of mass (barycenter).Key Logic:I utilized Math.cos and Math.sin with offsets to ensure Star B is always opposite Star A:TypeScript

// Orbit logic for Binary Stars
that.stars.starA.position.x = Math.cos(alpha) * 2;
that.stars.starA.position.z = Math.sin(alpha) * 2;

// Star B orbits opposite to Star A (Alpha + PI)
that.stars.starB.position.x = Math.cos(alpha + Math.PI) * 3; 
that.stars.starB.position.z = Math.sin(alpha + Math.PI) * 3;

Visually, GlowLayers were applied to the spheres to simulate the intense light of stars against the black background.Scene 2: The Solar System (Factory Pattern)To create 8 distinct planets efficiently without writing repetitive code, I implemented a Factory Pattern.Key Logic:A helper function createPlanet accepts parameters for size, distance, and texture. This allows the entire solar system to be defined in a simple configuration array:TypeScriptconst planetConfigs = [
    { name: "Mercury", size: 0.8, dist: 6, speed: 2.0, ... },
    { name: "Jupiter", size: 3.5, dist: 25, speed: 0.4, ... },
    // ... other planets
];
This approach makes the code highly organized; adding or modifying a planet only requires changing data in one line, rather than writing new mesh generation code.Procedural StarfieldInstead of using a static skybox image, I generated the background procedurally. The code loops 500 times, creating clones of a small white sphere and placing them at random coordinates on a large radius. This ensures a deep, crisp space environment.

## 4. Character Controller Implementation

The character controller demonstrates an understanding of vector mathematics and physics integration.Camera-Relative Movement:To modernize the controls, the character does not move North/South/East/West based on the world. Instead, movement is calculated based on the Camera's Forward Vector.TypeScript// Calculate Forward direction based on camera view
const forward = camera.getForwardRay().direction;
forward.y = 0; // Flatten vector so we don't fly upwards
forward.normalize();
Physics Interaction:Instead of manually updating the mesh.position (which ignores collisions), I applied Linear Velocity to the Havok physics body. This allows the character to interact physically with the environment (gravity, sliding, collision).

## 5. Asset Sources

The following external assets were used to texture the planetary bodies and environment. These assets were sourced from the module resources or standard library assets.Asset TypeNameUsage DescriptionModeldummy3.babylonThe rigged player character mesh (Standard Babylon Asset).Texturevalleygrass.pngUsed for Earth-like planets (Earth, Venus, Alien Earth).Texturewood.jpgUsed for Gas Giants (Jupiter, Saturn) to simulate storms, and Lava worlds.Textureroof.jpgUsed for cratered bodies (Mercury, Moon).LibraryHavokPhysics.wasmThe Physics engine binary file.