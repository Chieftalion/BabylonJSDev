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
  PointLight,
  GlowLayer
} from "@babylonjs/core";

// 1. DEEP SPACE
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

// 2. THE STARS
function createStars(scene: Scene) {
  // --- STAR A (Rigil Kentaurus) - Yellow/White ---
  const starA = MeshBuilder.CreateSphere("StarA", { diameter: 3, segments: 32 }, scene);
  const matA = new StandardMaterial("matA", scene);
  matA.emissiveColor = new Color3(1, 0.9, 0.6); // Bright Yellow
  matA.diffuseColor = new Color3(0, 0, 0);
  starA.material = matA;

  const lightA = new PointLight("lightA", new Vector3(0, 0, 0), scene);
  lightA.diffuse = new Color3(1, 0.9, 0.8);
  lightA.intensity = 1.2;
  lightA.parent = starA;

  // --- STAR B (Toliman) - Orange/Red ---
  const starB = MeshBuilder.CreateSphere("StarB", { diameter: 2, segments: 32 }, scene);
  const matB = new StandardMaterial("matB", scene);
  matB.emissiveColor = new Color3(1, 0.4, 0.1); // Deep Orange
  matB.diffuseColor = new Color3(0, 0, 0);
  starB.material = matB;

  const lightB = new PointLight("lightB", new Vector3(0, 0, 0), scene);
  lightB.diffuse = new Color3(1, 0.5, 0.2);
  lightB.intensity = 0.8;
  lightB.parent = starB;

  // --- STAR C (Proxima Centauri) - Small Red Dwarf ---
  // It is very far away in reality, but we'll bring it closer (Distance 30) so you can see it.
  const starC = MeshBuilder.CreateSphere("StarC", { diameter: 0.8, segments: 16 }, scene);
  const matC = new StandardMaterial("matC", scene);
  matC.emissiveColor = new Color3(0.8, 0.1, 0.1); // Deep Red
  matC.diffuseColor = new Color3(0, 0, 0);
  starC.material = matC;
  starC.position = new Vector3(30, 2, 30); // Far out in the corner

  const lightC = new PointLight("lightC", new Vector3(0, 0, 0), scene);
  lightC.diffuse = new Color3(1, 0.2, 0.2);
  lightC.intensity = 0.5; // Dimmer light
  lightC.parent = starC;

  // Glow Layer makes them bloom
  const gl = new GlowLayer("glow", scene);
  gl.intensity = 0.6;

  return { starA, starB, starC };
}

// 3. PLANET GENERATOR
function createPlanet(scene: Scene, name: string, size: number, texture: string, color: Color3) {
  const planet = MeshBuilder.CreateSphere(name, { diameter: size, segments: 32 }, scene);

  const mat = new StandardMaterial(name + "Mat", scene);
  mat.diffuseTexture = new Texture(texture, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.2, 0.2, 0.2);

  planet.material = mat;
  return planet;
}

function createArcRotateCamera(scene: Scene) {
  // Zoomed out a bit more to see the 3rd star
  let camera = new ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.5, 45, new Vector3(0, 0, 0), scene);
  camera.upperRadiusLimit = 100;
  camera.lowerRadiusLimit = 5;
  return camera;
}

export default function createStartScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    stars?: { starA: Mesh, starB: Mesh, starC: Mesh };
    planet1?: Mesh;
    planet2?: Mesh;
    planet3?: Mesh; // Proxima b
    skybox?: Mesh;
    camera?: Camera;
  }

  let that: SceneData = { scene: new Scene(engine) };

  that.skybox = createSpaceBackground(that.scene);
  that.stars = createStars(that.scene);

  // 1. Lava Planet (Near Binary Stars)
  that.planet1 = createPlanet(that.scene, "LavaWorld", 1.0, "/assets/textures/wood.jpg", new Color3(1, 0.2, 0.0));

  // 2. Alien Earth (Near Binary Stars)
  that.planet2 = createPlanet(that.scene, "AlienEarth", 1.5, "/assets/environments/valleygrass.png", new Color3(0.2, 0.8, 1.0));

  // 3. Proxima b (Orbiting the Red Dwarf far away)
  that.planet3 = createPlanet(that.scene, "Proxima_b", 0.6, "/assets/textures/wood.jpg", new Color3(0.6, 0.4, 0.3));

  that.camera = createArcRotateCamera(that.scene);

  // --- ANIMATION ---
  let alpha = 0;
  that.scene.onBeforeRenderObservable.add(() => {
    const deltaTime = engine.getDeltaTime() * 0.001;
    alpha += deltaTime;

    if (that.stars && that.planet1 && that.planet2 && that.planet3) {
      // 1. Binary Star Dance (Center)
      that.stars.starA.position.x = Math.cos(alpha) * 2;
      that.stars.starA.position.z = Math.sin(alpha) * 2;

      that.stars.starB.position.x = Math.cos(alpha + Math.PI) * 3;
      that.stars.starB.position.z = Math.sin(alpha + Math.PI) * 3;

      // 2. Planets Orbiting the Binary Center
      // Lava World (Fast)
      that.planet1.position.x = Math.cos(alpha * 1.5) * 7;
      that.planet1.position.z = Math.sin(alpha * 1.5) * 7;
      that.planet1.rotation.y += 0.01;

      // Alien Earth (Slow)
      that.planet2.position.x = Math.cos(alpha * 0.8) * 14;
      that.planet2.position.z = Math.sin(alpha * 0.8) * 14;
      that.planet2.rotation.y -= 0.005;

      // 3. Proxima Centauri System (Far Away)
      // Proxima Star moves very slowly in a huge orbit
      that.stars.starC.position.x = Math.cos(alpha * 0.1) * 35;
      that.stars.starC.position.z = Math.sin(alpha * 0.1) * 35;

      // Proxima b orbits AROUND Proxima Star
      // Position = StarC Position + Offset
      that.planet3.position.x = that.stars.starC.position.x + Math.cos(alpha * 3) * 3;
      that.planet3.position.z = that.stars.starC.position.z + Math.sin(alpha * 3) * 3;
    }
  });

  return that;
}