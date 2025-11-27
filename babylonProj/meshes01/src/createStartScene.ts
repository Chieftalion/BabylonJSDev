import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  Light,
  Camera,
  Engine,
  StandardMaterial,
  Color3,
  HemisphericLight as Hemi,
  PointLight,
  SpotLight,
  DirectionalLight,
  ShadowGenerator,
  Texture,
} from "@babylonjs/core";
import { create } from "domain";

function getMaterial(scene: Scene) {
  scene.ambientColor = new Color3(1, 1, 1); // Make ambient light white so we see colors clearly
  const myMaterial = new StandardMaterial("myMaterial", scene);

  const grassTexture = new Texture("../assets/textures/grass.jpg", scene);

  grassTexture.uScale = 10;
  grassTexture.vScale = 10;

  myMaterial.diffuseTexture = grassTexture;

  return myMaterial;
}

function getShinyMaterial(scene: Scene) {
  const mat = new StandardMaterial("shinyMat", scene);
  mat.diffuseColor = new Color3(1, 0, 0); // Red
  mat.specularColor = new Color3(1, 1, 1); // White sharp reflection (Shiny!)
  return mat;
}

function createHemisphereLight(scene: Scene) {
  const light: HemisphericLight = new HemisphericLight("light", new Vector3(1, 10, 0), scene);

  light.intensity = 0.5; // Slightly brighter
  light.diffuse = new Color3(0.6, 0.8, 1); // Light Blue (Sky color)
  light.groundColor = new Color3(0.2, 0.2, 0.2); // Dark Grey (Ground reflection)
  // light.specular = new Color3(1, 1, 1); // Keep as is

  return light;
}

function createPointLight(scene: Scene) {
  const light = new PointLight("light", new Vector3(-1, 1, 0), scene);
  light.position = new Vector3(5, 20, 10);
  light.intensity = 0.3;
  light.diffuse = new Color3(0.5, 1, 1);
  light.specular = new Color3(0.8, 1, 1);
  return light;
}

function createSpotLight(scene: Scene) {
  const light = new SpotLight("light", new Vector3(0, 5, -3),
    new Vector3(0, 0, 1), Math.PI / 3, 20, scene);
  light.intensity = 0.5;
  light.diffuse = new Color3(1, 1, 1);
  light.specular = new Color3(0, 1, 0);
  return light;
}

function createDirectionalLight(scene: Scene) {
  const light = new DirectionalLight("light", new Vector3(-0.2, -0.5, -0.2), scene);
  light.position = new Vector3(20, 40, 20);
  light.intensity = 0.7;
  light.diffuse = new Color3(1, 1, 1);
  light.specular = new Color3(1, 1, 1);
  return light;
}

function createDirectionalShadows(light: DirectionalLight, sphere: Mesh, box: Mesh) {
  const shadower = new ShadowGenerator(1024, light);
  const sm: any = shadower.getShadowMap();
  sm.renderList?.push(sphere);
  sm.renderList?.push(box);

  shadower.setDarkness(0.2);
  shadower.useBlurExponentialShadowMap = true;
  shadower.blurScale = 4;
  shadower.blurBoxOffset = 1;
  shadower.useKernelBlur = true;
  shadower.blurKernel = 64;
  shadower.bias = 0;
  return shadower;
}

function createPointShadows(light: PointLight, sphere: Mesh, box: Mesh) {
  const shadower = new ShadowGenerator(1024, light);
  const sm: any = shadower.getShadowMap();
  sm.renderList?.push(sphere);
  sm.renderList?.push(box);

  shadower.setDarkness(0.2);
  shadower.useBlurExponentialShadowMap = true;
  shadower.blurScale = 4;
  shadower.blurBoxOffset = 1;
  shadower.useKernelBlur = true;
  shadower.blurKernel = 64;
  shadower.bias = 0;
  return shadower;
}

function createSphere(scene: Scene) {
  const sphere = MeshBuilder.CreateSphere(
    "ellipsoid",
    { diameter: 0.7, diameterY: 2, segments: 16 },
    scene,
  );
  sphere.position.x = 0;
  sphere.position.y = 1;
  return sphere;
}

function createCylinder(scene: Scene) {
  const cylinder = MeshBuilder.CreateCylinder(
    "cylinder",
    { diameter: 1, height: 2, arc: 0.5, tessellation: 16 },
    scene,
  );
  cylinder.position.x = 5;
  cylinder.position.y = 1;
  return cylinder;
}

function createCone(scene: Scene) {
  const cone = MeshBuilder.CreateCylinder(
    "cone",
    { diameterTop: 0, diameterBottom: 1, height: 2, tessellation: 16 },
    scene,
  );
  cone.position.x = 7;
  cone.position.y = 1;
  return cone;
}

function createTriangle(scene: Scene) {
  const triangle = MeshBuilder.CreateCylinder(
    "triangle",
    { diameter: 1, height: 2, tessellation: 3 },
    scene,
  );
  triangle.position.x = 9;
  triangle.position.y = 1;
  return triangle;
}

function createBox(scene: Scene, myMaterial: any) {
  const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
  box.position.x = 3;
  box.position.y = 1;
  box.material = myMaterial;
  return box;
}

function createCapsule(scene: Scene) {
  const capsule = MeshBuilder.CreateCapsule(
    "capsule", { radius: 0.5, height: 2, subdivisions: 4, tessellation: 16 },
    scene,
  );
  capsule.position.x = -3;
  capsule.position.y = 1;
  return capsule;
}


function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  return light;
}



function createGround(scene: Scene, material: any) { // Pass material here!
  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 50, height: 50 }, // Make it HUGE (50x50)
    scene,
  );
  ground.position.x = 0;
  ground.material = material; // Apply the grass texture
  return ground;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 10,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene,
  );
  camera.attachControl(true);
  return camera;
}

export default function createStartScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    box?: Mesh;
    light?: Light;
    hemi?: HemisphericLight;
    point?: PointLight;
    spot?: SpotLight;
    sphere?: Mesh;
    cylinder?: Mesh;
    cone?: Mesh;
    triangle?: Mesh;
    capsule?: Mesh;
    ground?: Mesh;
    camera?: Camera;
    shadow?: ShadowGenerator;
    dLight?: DirectionalLight;
  }

  let that: SceneData = { scene: new Scene(engine) };
  that.scene.debugLayer.show();

  const mat1 = getMaterial(that.scene);
  const mat2 = getShinyMaterial(that.scene);

  that.box = createBox(that.scene, mat2);
  that.sphere = createSphere(that.scene);
  that.ground = createGround(that.scene, mat1);

  createCylinder(that.scene);
  createCone(that.scene);
  createTriangle(that.scene);
  createCapsule(that.scene);

  that.ground.receiveShadows = true;

  that.hemi = createHemisphereLight(that.scene);
  that.point = createPointLight(that.scene);
  that.spot = createSpotLight(that.scene);
  that.dLight = createDirectionalLight(that.scene);

  createDirectionalShadows(
    that.dLight,
    that.sphere as Mesh,
    that.box as Mesh,
  );
  createPointShadows(
    that.point as PointLight,
    that.sphere as Mesh,
    that.box as Mesh,
  );
  that.light = createLight(that.scene);

  that.camera = createArcRotateCamera(that.scene);
  return that;
}


