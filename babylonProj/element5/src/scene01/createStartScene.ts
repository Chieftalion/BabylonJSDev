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
  GlowLayer,
  Color4
} from "@babylonjs/core";

function createStarfield(scene: Scene) {
  scene.clearColor = new Color4(0, 0, 0, 1);

  const starMaster = MeshBuilder.CreateSphere("star", { diameter: 0.5, segments: 4 }, scene);
  const starMat = new StandardMaterial("starMat", scene);
  starMat.emissiveColor = new Color3(1, 1, 1); // White Glow
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

function createStars(scene: Scene) {
  const starA = MeshBuilder.CreateSphere("StarA", { diameter: 3.5, segments: 32 }, scene);
  const matA = new StandardMaterial("matA", scene);
  matA.emissiveColor = new Color3(1, 0.9, 0.7);
  matA.diffuseColor = new Color3(0, 0, 0);
  starA.material = matA;

  const lightA = new PointLight("lightA", new Vector3(0, 0, 0), scene);
  lightA.diffuse = new Color3(1, 0.9, 0.8);
  lightA.intensity = 1.5;
  lightA.parent = starA;

  const starB = MeshBuilder.CreateSphere("StarB", { diameter: 2.5, segments: 32 }, scene);
  const matB = new StandardMaterial("matB", scene);
  matB.emissiveColor = new Color3(1, 0.5, 0.2);
  matB.diffuseColor = new Color3(0, 0, 0);
  starB.material = matB;

  const lightB = new PointLight("lightB", new Vector3(0, 0, 0), scene);
  lightB.diffuse = new Color3(1, 0.5, 0.2);
  lightB.intensity = 1.0;
  lightB.parent = starB;

  const starC = MeshBuilder.CreateSphere("StarC", { diameter: 1.0, segments: 16 }, scene);
  const matC = new StandardMaterial("matC", scene);
  matC.emissiveColor = new Color3(0.8, 0.1, 0.1);
  matC.diffuseColor = new Color3(0, 0, 0);
  starC.material = matC;
  starC.position = new Vector3(35, 2, 35);

  const lightC = new PointLight("lightC", new Vector3(0, 0, 0), scene);
  lightC.diffuse = new Color3(1, 0.2, 0.2);
  lightC.intensity = 0.5;
  lightC.parent = starC;

  const gl = new GlowLayer("glow", scene);
  gl.intensity = 0.7;

  return { starA, starB, starC };
}

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
  let camera = new ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.5, 60, new Vector3(0, 0, 0), scene);
  camera.upperRadiusLimit = 150;
  camera.lowerRadiusLimit = 5;
  return camera;
}

export default function createStartScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    stars?: { starA: Mesh, starB: Mesh, starC: Mesh };
    planet1?: Mesh;
    planet2?: Mesh;
    planet3?: Mesh;
    camera?: Camera;
  }

  let that: SceneData = { scene: new Scene(engine) };

  createStarfield(that.scene);
  that.stars = createStars(that.scene);

  that.planet1 = createPlanet(that.scene, "LavaWorld", 1.0, "/assets/textures/wood.jpg", new Color3(1, 0.2, 0.0));

  that.planet2 = createPlanet(that.scene, "AlienEarth", 1.5, "/assets/environments/valleygrass.png", new Color3(0.2, 0.8, 1.0));

  that.planet3 = createPlanet(that.scene, "Proxima_b", 0.6, "/assets/textures/wood.jpg", new Color3(0.6, 0.4, 0.3));

  that.camera = createArcRotateCamera(that.scene);

  let alpha = 0;
  that.scene.onBeforeRenderObservable.add(() => {
    const deltaTime = engine.getDeltaTime() * 0.001;
    alpha += deltaTime;

    if (that.stars && that.planet1 && that.planet2 && that.planet3) {

      that.stars.starA.position.x = Math.cos(alpha) * 3;
      that.stars.starA.position.z = Math.sin(alpha) * 3;

      that.stars.starB.position.x = Math.cos(alpha + Math.PI) * 4;
      that.stars.starB.position.z = Math.sin(alpha + Math.PI) * 4;

      that.planet1.position.x = Math.cos(alpha * 1.5) * 9;
      that.planet1.position.z = Math.sin(alpha * 1.5) * 9;
      that.planet1.rotation.y += 0.01;

      that.planet2.position.x = Math.cos(alpha * 0.8) * 18;
      that.planet2.position.z = Math.sin(alpha * 0.8) * 18;
      that.planet2.rotation.y -= 0.005;

      that.stars.starC.position.x = Math.cos(alpha * 0.1) * 40;
      that.stars.starC.position.z = Math.sin(alpha * 0.1) * 40;

      that.planet3.position.x = that.stars.starC.position.x + Math.cos(alpha * 3) * 4;
      that.planet3.position.z = that.stars.starC.position.z + Math.sin(alpha * 3) * 4;
    }
  });

  return that;
}