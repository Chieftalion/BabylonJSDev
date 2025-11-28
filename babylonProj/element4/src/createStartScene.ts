import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF/2.0";
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  Color3,
  StandardMaterial,
  Texture,
  Engine,
  HavokPlugin,
  AssetsManager,
  DirectionalLight,
  ShadowGenerator,
  CubeTexture
} from "@babylonjs/core";

import { createCharacterController } from "./createCharacterController";

function createGround(scene: Scene) {
  let ground = MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);

  let groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseTexture = new Texture("/assets/environments/valleygrass.png", scene);
  (groundMat.diffuseTexture as Texture).uScale = 15;
  (groundMat.diffuseTexture as Texture).vScale = 15;
  groundMat.specularColor = new Color3(0, 0, 0);

  ground.material = groundMat;
  ground.receiveShadows = true;

  let groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

  return groundAggregate;
}

function createSkybox(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
  const skyboxMaterial = new StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture("/assets/textures/skybox/skybox", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
}

function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.6;
  return light;
}

function createArcRotateCamera(scene: Scene) {
  let camera = new ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.5, 12, new Vector3(0, 0, 0), scene);

  camera.useAutoRotationBehavior = false;
  camera.lowerBetaLimit = 0.5;
  camera.upperBetaLimit = 1.3;
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 20;

  camera.attachControl(true);
  return camera;
}

function createPhysicsPlayground(scene: Scene, shadowGenerator: ShadowGenerator) {
  const woodMat = new StandardMaterial("woodMat", scene);
  woodMat.diffuseTexture = new Texture("/assets/textures/wood.jpg", scene);
  const stoneMat = new StandardMaterial("stoneMat", scene);
  stoneMat.diffuseTexture = new Texture("/assets/textures/cubehouse.png", scene);
  const redMat = new StandardMaterial("redMat", scene);
  redMat.diffuseColor = new Color3(1, 0, 0);

  const ramp = MeshBuilder.CreateBox("ramp", { width: 6, height: 0.2, depth: 12 }, scene);
  ramp.position = new Vector3(10, 3, 10);
  ramp.rotation.x = -Math.PI / 6;
  ramp.material = woodMat;
  ramp.receiveShadows = true;
  shadowGenerator.addShadowCaster(ramp);
  new PhysicsAggregate(ramp, PhysicsShapeType.BOX, { mass: 0, friction: 0.2 }, scene);

  for (let i = 0; i < 6; i++) {
    const pin = MeshBuilder.CreateCylinder("pin", { height: 2, diameter: 0.5 }, scene);
    pin.position = new Vector3(8 + (i * 0.8), 0.5, 3);
    pin.material = redMat;
    shadowGenerator.addShadowCaster(pin);
    new PhysicsAggregate(pin, PhysicsShapeType.CYLINDER, { mass: 0.5, restitution: 0.5 }, scene);
  }

  const ball = MeshBuilder.CreateSphere("bowlingBall", { diameter: 1.5 }, scene);
  ball.position = new Vector3(10, 7, 13);
  ball.material = redMat;
  shadowGenerator.addShadowCaster(ball);
  new PhysicsAggregate(ball, PhysicsShapeType.SPHERE, { mass: 5, restitution: 0.5, friction: 0.2 }, scene);

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const brick = MeshBuilder.CreateBox("brick", { width: 1.5, height: 1, depth: 1 }, scene);
      brick.position = new Vector3(-10 + (x * 1.6), 0.5 + (y * 1.1), 5);
      brick.material = stoneMat;
      shadowGenerator.addShadowCaster(brick);
      brick.receiveShadows = true;
      new PhysicsAggregate(brick, PhysicsShapeType.BOX, { mass: 0.5 }, scene);
    }
  }
}

function addAssets(scene: Scene, shadowGenerator: ShadowGenerator) {
  const assetsManager = new AssetsManager(scene);

  const rockTask = assetsManager.addMeshTask("loadRock", "", "/assets/nature/glTF/", "Rock_Medium_1.gltf");
  rockTask.onSuccess = function (task: any) {
    const rockRoot = task.loadedMeshes[0];
    rockRoot.setEnabled(false);
    const positions = [new Vector3(15, 0, -5), new Vector3(12, 0, -8), new Vector3(16, 0, 2)];
    positions.forEach((pos, index) => {
      const rock = rockRoot.clone("rock_" + index, null);
      rock.setEnabled(true);
      rock.position = pos;
      rock.scaling = new Vector3(3, 3, 3);
      shadowGenerator.addShadowCaster(rock);
      new PhysicsAggregate(rock, PhysicsShapeType.MESH, { mass: 0, friction: 0.8 }, scene);
    });
  };

  const pineTask = assetsManager.addMeshTask("loadPine", "", "/assets/nature/glTF/", "Pine_1.gltf");
  pineTask.onSuccess = function (task: any) {
    const pineRoot = task.loadedMeshes[0];
    pineRoot.setEnabled(false);
    for (let i = 0; i < 30; i++) {
      let x = Math.random() * 50 - 25;
      let z = Math.random() * 50 - 25;
      if (Math.abs(x) < 12 && Math.abs(z) < 12) continue;
      const tree = pineRoot.clone("pine_" + i, null);
      tree.setEnabled(true);
      tree.position = new Vector3(x, 0, z);
      tree.scaling = new Vector3(0.8, 0.8, 0.8);
      shadowGenerator.addShadowCaster(tree);
    }
  };

  const flowerTask = assetsManager.addMeshTask("loadFlower", "", "/assets/nature/glTF/", "Flower_4_Single.gltf");
  flowerTask.onSuccess = function (task: any) {
    const flowerRoot = task.loadedMeshes[0];
    flowerRoot.setEnabled(false);
    for (let i = 0; i < 15; i++) {
      let x = Math.random() * 50 - 25;
      let z = Math.random() * 50 - 25;
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
      const flower = flowerRoot.clone("flower_" + i, null);
      flower.setEnabled(true);
      flower.position = new Vector3(x, 0, z);
      flower.scaling = new Vector3(1.5, 1.5, 1.5);
    }
  };

  return assetsManager;
}


export default async function createStartScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    light?: HemisphericLight;
    ground?: PhysicsAggregate;
    camera?: ArcRotateCamera;
  }

  let that: SceneData = { scene: new Scene(engine) };

  const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();
  const hk: HavokPlugin = new HavokPlugin(true, havokInstance);
  that.scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

  that.light = createLight(that.scene);
  const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, -1), that.scene);
  dirLight.position = new Vector3(20, 40, 20);
  const shadowGenerator = new ShadowGenerator(1024, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;

  createSkybox(that.scene);
  that.ground = createGround(that.scene);
  createPhysicsPlayground(that.scene, shadowGenerator);
  const assetsManager = addAssets(that.scene, shadowGenerator);
  assetsManager.load();

  that.camera = createArcRotateCamera(that.scene);
  createCharacterController(that.scene, that.camera, shadowGenerator);

  return that;
}