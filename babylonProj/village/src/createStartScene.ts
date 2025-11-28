import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { ShadowGenerator, DirectionalLight } from "@babylonjs/core";
import { SceneData } from "./interfaces";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  Mesh,
  StandardMaterial,
  HemisphericLight,
  Color3,
  Engine,
  Texture,
  CubeTexture,
  Nullable,
  Vector4,
  InstancedMesh,
  SpriteManager,
  Sprite,
  Color4,
  ParticleSystem
} from "@babylonjs/core";
//import { create } from "domain";

function createTerrain(scene: Scene) {
  const largeGroundMat = new StandardMaterial("largeGroundMat");
  const terrainTexture = new Texture("/assets/environments/valleygrass.png", scene);

  terrainTexture.uScale = 60;
  terrainTexture.vScale = 60;

  largeGroundMat.diffuseTexture = terrainTexture;

  const largeGround = MeshBuilder.CreateGroundFromHeightMap(
    "largeGround",
    "/assets/environments/villageheightmap.png",
    {
      width: 150, height: 150, subdivisions: 20, minHeight: 0, maxHeight: 10,
    },
    scene
  );
  largeGround.material = largeGroundMat;
  largeGround.position.y = -0.01;
  largeGround.receiveShadows = true;
}

function createGround(scene: Scene) {
  const groundMaterial = new StandardMaterial("groundMaterial");
  groundMaterial.diffuseTexture = new Texture(
    "/assets/environments/villagegreen.png");
  groundMaterial.diffuseTexture.hasAlpha = true;
  groundMaterial.backFaceCulling = false;
  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 24, height: 24 },
    scene
  );
  ground.material = groundMaterial;
  ground.position.y = 0.01;
  return ground;
}

function createSky(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
  const skyboxMaterial = new StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture(
    "/assets/textures/skybox/skybox",
    scene
  );
  skyboxMaterial.reflectionTexture.coordinatesMode =
    Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
  return skybox;
}

function createBox(style: number) {
  //style 1 small style 2 semi detatched
  const boxMat = new StandardMaterial("boxMat");
  const faceUV: Vector4[] = []; // faces for small house
  if (style == 1) {
    boxMat.diffuseTexture = new Texture("/assets/textures/cubehouse.png");
    faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
    faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
    faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
    // faceUV[4] would be for bottom but not used
    // faceUV[5] would be for top but not used
  } else {
    boxMat.diffuseTexture = new Texture("/assets/textures/semihouse.png");
    faceUV[0] = new Vector4(0.6, 0.0, 1.0, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.4, 1.0); //front face
    faceUV[2] = new Vector4(0.4, 0, 0.6, 1.0); //right side
    faceUV[3] = new Vector4(0.4, 0, 0.6, 1.0); //left side
    // faceUV[4] would be for bottom but not used
    // faceUV[5] would be for top but not used
  }

  const box = MeshBuilder.CreateBox("box", {
    width: style,
    height: 1,
    faceUV: faceUV,
    wrap: true,
  });
  box.position = new Vector3(0, 0.5, 0);
  box.scaling = new Vector3(1, 1, 1);
  box.material = boxMat;
  return box;
}

function createRoof(style: number) {
  const roof = MeshBuilder.CreateCylinder("roof", {
    diameter: 1.3,
    height: 1.2,
    tessellation: 3,
  });
  roof.scaling.x = 0.75;
  roof.scaling.y = style * 0.85;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;
  const roofMat = new StandardMaterial("roofMat");
  roofMat.diffuseTexture = new Texture("/assets/textures/roof.jpg");
  roof.material = roofMat;
  return roof;
}

function createHouse(scene: Scene, style: number) {
  const box = createBox(style);
  const roof = createRoof(style);
  const house = Mesh.MergeMeshes(
    [box, roof],
    true,
    false,
    undefined,
    false,
    true
  );
  // last true allows combined mesh to use multiple materials
  return house;
}

function createHouses(scene: Scene, style: number) {
  //Start by locating one each of the two house types then add others

  if (style == 1) {
    // show 1 small house
    createHouse(scene, 1);
  }
  if (style == 2) {
    // show 1 large house
    createHouse(scene, 2);
  }
  if (style == 3) {
    // show estate
    const houses: Nullable<Mesh>[] = [];
    // first two houses are original meshes
    houses[0] = createHouse(scene, 1);
    houses[0]!.rotation.y = -Math.PI / 10;
    houses[0]!.position.x = -3;
    houses[0]!.position.z = 3;

    houses[1] = createHouse(scene, 2);
    houses[1]!.rotation.y = -Math.PI / 10;
    houses[1]!.position.x = -4.75;
    houses[1]!.position.z = 2.5;

    const ihouses: InstancedMesh[] = [];
    const places: number[][] = []; //each entry is an array [house type, rotation, x, z]

    // on north (western)
    places.push([2, -Math.PI / 4, 7.5, 7.25]);
    places.push([2, -Math.PI / 3, 6.25, 5.4]);
    places.push([2, -Math.PI / 3, 5, 3.25]);
    places.push([1, Math.PI / 2, 4.1, -1]);
    places.push([2, Math.PI / 2, 4.1, 0.75]);
    places.push([2, Math.PI / 2, 4.1, -2.8]);
    places.push([2, Math.PI / 2, 4.1, -5]);
    places.push([1, Math.PI / 2, 4.1, -6.75]);
    places.push([2, Math.PI / 2, 4.1, -8.5]);
    places.push([2, Math.PI / 2, 4.1, -10.75]);

    // on north (eastern)
    places.push([2, Math.PI / 2, 1.7, -1]);
    places.push([1, Math.PI / 2, 1.7, 0.75]);
    places.push([2, Math.PI / 2, 1.7, -3.2]);
    places.push([1, Math.PI / 2, 1.7, -5]);
    places.push([2, Math.PI / 2, 1.7, -6.8]);
    places.push([2, Math.PI / 2, 1.7, -9]);
    places.push([1, Math.PI / 2, 1.7, -10.75]);

    // on east (upper)
    places.push([2, -Math.PI / 10, 0.5, 1.3]);
    places.push([1, -Math.PI / 10, -1.25, 0.8]);
    places.push([2, -Math.PI / 10, -3, 0.2]);
    places.push([2, -Math.PI / 10, -5.25, -0.5]);
    places.push([1, -Math.PI / 10, -7, -1]);
    places.push([2, -Math.PI / 10, -9, -1.5]);

    // on east (lower)
    places.push([2, -Math.PI / 10, 1, 4.25]);
    places.push([2, -Math.PI / 10, -1.25, 3.5]);
    places.push([2, -Math.PI / 10, -7, 1.75]);
    places.push([1, -Math.PI / 10, -8.75, 1.25]);

    // on south (eastern)
    places.push([1, Math.PI / 2, 2, 5]);
    places.push([2, Math.PI / 2, 2.15, 6.75]);
    places.push([2, Math.PI / 2, 2.15, 9.05]);

    // on south-west
    places.push([2, -Math.PI / 4, 5.25, 8]);
    places.push([2, -Math.PI / 4, 6.75, 9.75]);
    places.push([2, Math.PI / 2, 4.5, 8]);
    places.push([1, Math.PI / 2, 4.5, 9.75]);


    for (let i = 0; i < places.length; i++) {
      if (places[i][0] === 1) {
        ihouses[i] = houses[0]!.createInstance("house" + i);
      } else {
        ihouses[i] = houses[1]!.createInstance("house" + i);
      }
      ihouses[i].rotation.y = places[i][1];
      ihouses[i].position.x = places[i][2];
      ihouses[i].position.z = places[i][3];
    }
  }
  // nothing returned by this function
}

function createTrees(scene: Scene) {
  const spriteManagerTrees = new SpriteManager(
    "treesManager",
    "/assets/sprites/tree.png",
    2000,
    { width: 512, height: 1024 },
    scene
  );

  for (let i = 0; i < 2000; i++) { // Increased count slightly to fill gaps
    const x = Math.random() * 100 - 50;
    const z = Math.random() * 100 - 50;

    // 1. CENTER FOUNTAIN
    if (Math.abs(x) < 2.5 && Math.abs(z) < 2.5) continue;

    // 2. WEST ROAD (Horizontal)
    if (x < 0 && z > -1.5 && z < 5.5) continue;

    // 3. SOUTH ROAD (Vertical)
    if (z < 0 && x > 0 && x < 6) continue;

    // 4. DIAGONAL ROAD (Top Right)
    if (x > 0 && z > 0 && Math.abs(x - z) < 3.5) continue;


    // --- PLANT TREE ---
    const tree = new Sprite("tree", spriteManagerTrees);
    tree.position.x = x;
    tree.position.z = z;
    tree.position.y = 0.5;

    const scale = 0.8 + Math.random() * 0.7;
    tree.width = scale;
    tree.height = scale;
  }
}

function createHemisphericLight(scene: Scene) {
  const light = new HemisphericLight(
    "light",
    new Vector3(2, 1, 0), // move x pos to direct shadows
    scene
  );
  light.intensity = 0.8;
  light.diffuse = new Color3(1, 1, 1);
  light.specular = new Color3(1, 0.8, 0.8);
  light.groundColor = new Color3(0, 0.2, 0.7);
  return light;
}

function createFountain(scene: Scene) {
  const fountainProfile = [
    new Vector3(0, 0, 0),
    new Vector3(0.5, 0, 0),
    new Vector3(0.5, 0.2, 0),
    new Vector3(0.4, 0.2, 0),
    new Vector3(0.4, 0.05, 0),
    new Vector3(0.05, 0.1, 0),
    // FIX: Lowered these Y values to make the pipe shorter
    new Vector3(0.05, 0.5, 0),
    new Vector3(0.15, 0.6, 0)
  ];

  const fountain = MeshBuilder.CreateLathe("fountain", { shape: fountainProfile, sideOrientation: Mesh.DOUBLESIDE }, scene);
  fountain.position.x = 3.5;
  fountain.position.z = 4;

  // FIX: Reduced scaling from 3 to 1.5
  fountain.scaling = new Vector3(1.5, 1.5, 1.5);

  const stoneMat = new StandardMaterial("stone", scene);
  stoneMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
  fountain.material = stoneMat;

  return fountain;
}

function createFountainWater(scene: Scene, fountain: Mesh) {
  const particleSystem = new ParticleSystem("particles", 2000, scene);

  particleSystem.particleTexture = new Texture("https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/flare.png", scene);

  // Emitter location (Top of fountain)
  particleSystem.emitter = new Vector3(fountain.position.x, fountain.position.y + 1, fountain.position.z);
  particleSystem.minEmitBox = new Vector3(-0.05, 0, -0.05);
  particleSystem.maxEmitBox = new Vector3(0.05, 0, 0.05);

  particleSystem.color1 = new Color4(0.9, 0.9, 1.0, 1.0);
  particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
  particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

  particleSystem.minSize = 0.05;
  particleSystem.maxSize = 0.2;
  particleSystem.minLifeTime = 0.5;
  particleSystem.maxLifeTime = 1.5;
  particleSystem.emitRate = 1000;

  particleSystem.gravity = new Vector3(0, -9.81, 0);

  particleSystem.direction1 = new Vector3(-1, 4, 1);
  particleSystem.direction2 = new Vector3(1, 4, -1);

  particleSystem.start();
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 25,
    camTarget = new Vector3(0, 4, 3.5);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 25;
  camera.lowerAlphaLimit = 0;
  camera.upperAlphaLimit = Math.PI * 2;
  camera.lowerBetaLimit = 0;
  camera.upperBetaLimit = Math.PI / 2.02;

  camera.attachControl(true);
  return camera;
}


export default function createStartScene(engine: Engine) {
  let scene = new Scene(engine);

  scene.fogMode = Scene.FOGMODE_EXP;
  scene.fogDensity = 0.01;
  scene.fogColor = new Color3(0.8, 0.9, 1.0);

  let ground = createGround(scene);
  ground.receiveShadows = true; // Important!

  let sky = createSky(scene);
  let lightHemispheric = createHemisphericLight(scene);

  const dirLight = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
  dirLight.position = new Vector3(20, 40, 20);
  dirLight.intensity = 0.7;

  const shadowGenerator = new ShadowGenerator(1024, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;

  const fountain = createFountain(scene);
  createFountainWater(scene, fountain);

  createHouses(scene, 3);
  createTrees(scene);
  createTerrain(scene);
  createFountain(scene);

  scene.meshes.forEach((mesh) => {
    if (mesh.name.includes("house") || mesh.name.includes("fountain")) {
      shadowGenerator.addShadowCaster(mesh);
    }
  });

  let camera = createArcRotateCamera(scene);

  let that: SceneData = {
    scene,
    ground,
    sky,
    lightHemispheric,
    camera
  };
  return that;
}
