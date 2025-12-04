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
  PointLight,
  GlowLayer
} from "@babylonjs/core";

function createStarfield(scene: Scene) {
  scene.clearColor = new Color3(0, 0, 0).toColor4();

  const starMaster = MeshBuilder.CreateSphere("star", { diameter: 0.5, segments: 4 }, scene);
  const starMat = new StandardMaterial("starMat", scene);
  starMat.emissiveColor = new Color3(1, 1, 1);
  starMat.disableLighting = true;
  starMaster.material = starMat;
  starMaster.isVisible = false;

  for (let i = 0; i < 500; i++) {
    const star = starMaster.createInstance("star" + i);

    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 900;

    star.position.x = radius * Math.sin(phi) * Math.cos(theta);
    star.position.y = radius * Math.sin(phi) * Math.sin(theta);
    star.position.z = radius * Math.cos(phi);

    const scale = Math.random() * 1.5 + 0.5;
    star.scaling = new Vector3(scale, scale, scale);
  }
}

function createSun(scene: Scene) {
  const light = new PointLight("sunLight", new Vector3(0, 0, 0), scene);
  light.intensity = 1.5;

  const sunMesh = MeshBuilder.CreateSphere("sunMesh", { diameter: 4, segments: 32 }, scene);
  const sunMat = new StandardMaterial("sunMat", scene);
  sunMat.emissiveColor = new Color3(1, 0.8, 0); // Yellow Glow
  sunMat.diffuseColor = new Color3(0, 0, 0);
  sunMesh.material = sunMat;

  const gl = new GlowLayer("glow", scene);
  gl.intensity = 0.6;

  return { light, mesh: sunMesh };
}

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
  planet.position.x = distance;

  const mat = new StandardMaterial(name + "Mat", scene);
  mat.diffuseTexture = new Texture(texturePath, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  planet.material = mat;

  if (hasRings) {

    const ring = MeshBuilder.CreateTorus(name + "_ring", {
      diameter: size * 2.5,
      thickness: 0.8,
      tessellation: 64
    }, scene);

    ring.parent = planet;

    ring.scaling.y = 0.05;

    planet.rotation.z = 0.4;

    const ringMat = new StandardMaterial("ringMat", scene);
    ringMat.diffuseColor = new Color3(0.8, 0.7, 0.5);
    ringMat.specularColor = new Color3(0, 0, 0);
    ring.material = ringMat;
  }

  return planet;
}

function createArcRotateCamera(scene: Scene) {
  let camera = new ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.5, 40, new Vector3(0, 0, 0), scene);
  camera.upperRadiusLimit = 200;
  camera.lowerRadiusLimit = 5;
  return camera;
}

export default function createStartScene(engine: Engine) {
  interface PlanetData {
    mesh: Mesh;
    dist: number;
    speed: number;
    angle: number;
  }

  interface SceneData {
    scene: Scene;
    sun?: { light: Light, mesh: Mesh };
    planets: PlanetData[];
    camera?: Camera;
  }

  let that: SceneData = { scene: new Scene(engine), planets: [] };

  createStarfield(that.scene);

  that.sun = createSun(that.scene);
  that.camera = createArcRotateCamera(that.scene);

  const planetConfigs = [
    { name: "Mercury", size: 0.8, dist: 6, tex: "/assets/textures/roof.jpg", col: new Color3(0.5, 0.5, 0.5), speed: 2.0 },
    { name: "Venus", size: 1.2, dist: 9, tex: "/assets/environments/valleygrass.png", col: new Color3(0.9, 0.8, 0.6), speed: 1.5 },
    { name: "Earth", size: 1.3, dist: 13, tex: "/assets/environments/valleygrass.png", col: new Color3(0.2, 0.4, 1.0), speed: 1.0 },
    { name: "Mars", size: 1.0, dist: 17, tex: "/assets/textures/wood.jpg", col: new Color3(1.0, 0.3, 0.2), speed: 0.8 },
    { name: "Jupiter", size: 3.5, dist: 25, tex: "/assets/textures/wood.jpg", col: new Color3(0.8, 0.6, 0.4), speed: 0.4 },
    { name: "Saturn", size: 3.0, dist: 35, tex: "/assets/textures/wood.jpg", col: new Color3(0.9, 0.8, 0.5), speed: 0.3, rings: true },
    { name: "Uranus", size: 2.0, dist: 45, tex: "/assets/environments/valleygrass.png", col: new Color3(0.4, 0.9, 0.9), speed: 0.2 },
    { name: "Neptune", size: 2.0, dist: 55, tex: "/assets/environments/valleygrass.png", col: new Color3(0.2, 0.2, 0.8), speed: 0.15 }
  ];

  planetConfigs.forEach(p => {
    const mesh = createPlanet(that.scene, p.name, p.size, p.dist, p.tex, p.col, p.rings);
    that.planets.push({
      mesh: mesh,
      dist: p.dist,
      speed: p.speed * 0.5,
      angle: Math.random() * Math.PI * 2
    });
  });

  that.scene.onBeforeRenderObservable.add(() => {
    const deltaTime = engine.getDeltaTime() * 0.001;
    that.planets.forEach(p => {
      p.angle += p.speed * deltaTime;
      p.mesh.position.x = Math.cos(p.angle) * p.dist;
      p.mesh.position.z = Math.sin(p.angle) * p.dist;
      p.mesh.rotation.y += 1 * deltaTime;
    });
  });

  return that;
}