import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { ShadowGenerator, DirectionalLight, SceneLoader } from "@babylonjs/core";
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

function importPlayerMesh(scene: Scene, x: number, y: number) {

  let item = SceneLoader.ImportMesh("", "/assets/models/men/", "dummy3.babylon", scene,
    function (newMeshes) {
      let mesh = newMeshes[0];
      mesh.scaling = new Vector3(6, 6, 6);
      mesh.position = new Vector3(0, 0, 0);
    });
  return item;
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

  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 50, height: 50 },
    scene
  );
  let groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
  ground.material = groundMat;

  let sky = MeshBuilder.CreateBox(
    "sky",
    { size: 1000.0, sideOrientation: Mesh.BACKSIDE },
    scene
  );
  let skyMat = new StandardMaterial("skyMat", scene);
  skyMat.diffuseColor = new Color3(0.5, 0.8, 1.0);
  sky.material = skyMat;

  let lightHemispheric = new HemisphericLight(
    "lightHemispheric",
    new Vector3(0, 1, 0),
    scene
  );
  lightHemispheric.intensity = 0.7
  let camera = createArcRotateCamera(scene);

  let that: SceneData = {
    scene,
    ground,
    sky,
    lightHemispheric,
    camera
  };

  that.importMesh = importPlayerMesh(that.scene, 0, 0);

  return that;
}
