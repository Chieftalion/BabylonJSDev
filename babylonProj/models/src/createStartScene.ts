import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
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
  SceneLoader,
  ActionManager,
  ExecuteCodeAction
} from "@babylonjs/core";

// We use an array/object to store the state of keys (Pressed or Not Pressed)
let keyDownMap: Record<string, boolean> = {};

function importPlayerMesh(scene: Scene, x: number, y: number) {
  let item = SceneLoader.ImportMesh("", "/assets/models/men/", "dummy3.babylon", scene,
    function (newMeshes) {
      let mesh = newMeshes[0];

      // Optional: Scale the mesh if it is too small/large (Task 2 tip)
      mesh.scaling = new Vector3(1, 1, 1);

      // Task 3: Continuous update loop [cite: 63, 65]
      scene.onBeforeRenderObservable.add(() => {
        // Movement Speed
        const speed = 0.1;

        // Forward (W or Up) [cite: 80]
        if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
          mesh.position.z += speed;
          mesh.rotation.y = 0;
        }
        // Left (A or Left) [cite: 84]
        if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
          mesh.position.x -= speed;
          mesh.rotation.y = 3 * Math.PI / 2;
        }
        // Backward (S or Down) [cite: 88]
        if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
          mesh.position.z -= speed;
          mesh.rotation.y = Math.PI; // 2 * PI / 2 is just PI
        }
        // Right (D or Right) [cite: 92]
        if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
          mesh.position.x += speed;
          mesh.rotation.y = Math.PI / 2;
        }
      });
    });
  return item;
}

// Task 3: Action Manager to handle Input [cite: 108]
function actionManager(scene: Scene) {
  scene.actionManager = new ActionManager(scene);

  // Register Key Down [cite: 109-121]
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
      },
      function (evt) { keyDownMap[evt.sourceEvent.key] = true; }
    )
  );

  // Register Key Up [cite: 122-129]
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyUpTrigger
      },
      function (evt) { keyDownMap[evt.sourceEvent.key] = false; }
    )
  );
  return scene.actionManager;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 15,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 25;
  camera.attachControl(true);
  return camera;
}

export default function createStartScene(engine: Engine) {
  let scene = new Scene(engine);

  // Create Ground
  let ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
  let groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
  ground.material = groundMat;

  // Create Sky
  let sky = MeshBuilder.CreateBox("sky", { size: 1000.0, sideOrientation: Mesh.BACKSIDE }, scene);
  let skyMat = new StandardMaterial("skyMat", scene);
  skyMat.diffuseColor = new Color3(0.5, 0.8, 1.0);
  sky.material = skyMat;

  // Create Light
  let lightHemispheric = new HemisphericLight("lightHemispheric", new Vector3(0, 1, 0), scene);
  lightHemispheric.intensity = 0.7;

  // Create Camera
  let camera = createArcRotateCamera(scene);

  // Setup Scene Data
  let that: SceneData = {
    scene,
    ground,
    sky,
    lightHemispheric,
    camera
  };

  // Task 2 & 3: Import Mesh and Setup Movement [cite: 59]
  that.importMesh = importPlayerMesh(that.scene, 0, 0);

  // Task 3: Initialize Action Manager 
  that.actionManager = actionManager(that.scene);

  return that;
}