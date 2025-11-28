import {
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  Mesh,
  Light,
  Camera,
  Engine,
  StandardMaterial,
  Texture,
  Color3,
  CubeTexture,
  PointLight
} from "@babylonjs/core";

// 1. SPACE BACKGROUND
function createSpaceBackground(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
  const skyboxMaterial = new StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture("/assets/textures/skybox/skybox", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
  return skybox;
}

// 2. THE SUN (Light + Visual Mesh)
function createSun(scene: Scene) {
  // A. The Light Source
  const light = new PointLight("sunLight", new Vector3(0, 0, 0), scene);
  light.intensity = 1.5;

  // B. The Glowing Star Mesh
  const sunMesh = MeshBuilder.CreateSphere("sunMesh", { diameter: 4, segments: 32 }, scene);
  const sunMat = new StandardMaterial("sunMat", scene);
  sunMat.emissiveColor = new Color3(1, 0.8, 0); // Self-illuminated Yellow/Orange
  sunMat.diffuseColor = new Color3(0, 0, 0);
  sunMesh.material = sunMat;

  return { light, mesh: sunMesh };
}

// 3. PLANET FACTORY
// Helper to create any planet we want
function createPlanet(
  scene: Scene,
  name: string,
  size: number,
  distance: number,
  texturePath: string,
  color: Color3,
  hasRings: boolean = false
) {
  const planet = MeshBuilder.CreateSphere(name, { diameter: size, segments: 32 }, scene);

  // Start position (will be updated by orbit logic)
  planet.position.x = distance;

  const mat = new StandardMaterial(name + "Mat", scene);
  mat.diffuseTexture = new Texture(texturePath, scene);
  mat.diffuseColor = color; // Tint the texture (e.g., Red for Mars)
  mat.specularColor = new Color3(0.1, 0.1, 0.1); // Low shine

  planet.material = mat;

  // Optional: Rings (For Saturn)
  if (hasRings) {
    const ring = MeshBuilder.CreateTorus(name + "_ring", { diameter: size * 2, thickness: 0.5, tessellation: 64 }, scene);
    ring.parent = planet; // Stick it to the planet
    ring.rotation.x = Math.PI / 2; // Flat ring
    ring.scaling.y = 0.1; // Flatten it even more

    const ringMat = new StandardMaterial("ringMat", scene);
    ringMat.diffuseColor = new Color3(0.8, 0.7, 0.5);
    ring.material = ringMat;
  }

  return planet;
}

function createArcRotateCamera(scene: Scene) {
  let camera = new ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.5, 40, new Vector3(0, 0, 0), scene);

  // Allow zooming out far to see the whole system
  camera.upperRadiusLimit = 100;
  camera.lowerRadiusLimit = 5;

  return camera;
}

export default function createStartScene(engine: Engine) {
  interface PlanetData {
    mesh: Mesh;
    dist: number;
    speed: number;
    angle: number; // Current position in orbit
  }

  interface SceneData {
    scene: Scene;
    sun?: { light: Light, mesh: Mesh };
    skybox?: Mesh;
    planets: PlanetData[];
    camera?: Camera;
  }

  let that: SceneData = { scene: new Scene(engine), planets: [] };

  // Environment
  that.skybox = createSpaceBackground(that.scene);
  that.sun = createSun(that.scene);
  that.camera = createArcRotateCamera(that.scene);

  // --- CREATE THE SOLAR SYSTEM ---
  // Using your available textures creatively!

  const planetConfigs = [
    // Name, Size, Distance, Texture, Color, Speed, Rings?
    { name: "Mercury", size: 0.8, dist: 6, tex: "/assets/textures/roof.jpg", col: new Color3(0.5, 0.5, 0.5), speed: 2.0 },
    { name: "Venus", size: 1.2, dist: 9, tex: "/assets/environments/valleygrass.png", col: new Color3(0.9, 0.8, 0.6), speed: 1.5 },
    { name: "Earth", size: 1.3, dist: 13, tex: "/assets/environments/valleygrass.png", col: new Color3(0.2, 0.4, 1.0), speed: 1.0 },
    { name: "Mars", size: 1.0, dist: 17, tex: "/assets/textures/wood.jpg", col: new Color3(1.0, 0.3, 0.2), speed: 0.8 },
    { name: "Jupiter", size: 3.5, dist: 25, tex: "/assets/textures/wood.jpg", col: new Color3(0.8, 0.6, 0.4), speed: 0.4 },
    { name: "Saturn", size: 3.0, dist: 35, tex: "/assets/textures/wood.jpg", col: new Color3(0.9, 0.8, 0.5), speed: 0.3, rings: true },
    { name: "Uranus", size: 2.0, dist: 45, tex: "/assets/environments/valleygrass.png", col: new Color3(0.4, 0.9, 0.9), speed: 0.2 },
    { name: "Neptune", size: 2.0, dist: 55, tex: "/assets/environments/valleygrass.png", col: new Color3(0.2, 0.2, 0.8), speed: 0.15 }
  ];

  // Loop through config and create meshes
  planetConfigs.forEach(p => {
    const mesh = createPlanet(that.scene, p.name, p.size, p.dist, p.tex, p.col, p.rings);

    // Store data for animation
    that.planets.push({
      mesh: mesh,
      dist: p.dist,
      speed: p.speed * 0.5, // Global speed multiplier
      angle: Math.random() * Math.PI * 2 // Random start position
    });
  });


  that.scene.onBeforeRenderObservable.add(() => {
    const deltaTime = engine.getDeltaTime() * 0.001; // Time in seconds

    that.planets.forEach(p => {
      // Update Angle
      p.angle += p.speed * deltaTime;

      // Apply new position (Circle Math: Cos/Sin)
      p.mesh.position.x = Math.cos(p.angle) * p.dist;
      p.mesh.position.z = Math.sin(p.angle) * p.dist;

      // Rotate planet on its own axis
      p.mesh.rotation.y += 1 * deltaTime;
    });
  });

  return that;
}