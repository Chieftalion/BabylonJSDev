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
  ExecuteCodeAction,
  AnimationPropertiesOverride,
  DirectionalLight,
  ShadowGenerator,
  SpriteManager,
  Sprite,
  Texture
} from "@babylonjs/core";

let keyDownMap: any = {};

window.addEventListener("blur", () => {
  keyDownMap = {};
});

function importPlayerMesh(scene: Scene, camera: ArcRotateCamera, shadowGenerator: ShadowGenerator) {

  let item = SceneLoader.ImportMesh("", "/assets/models/men/", "dummy3.babylon", scene,
    function (newMeshes, particleSystems, skeletons) {
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];

      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh, true);

      camera.lockedTarget = mesh;

      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1;

      let walkRange = skeleton.getAnimationRange("YBot_Walk");
      let idleRange = skeleton.getAnimationRange("YBot_Idle");

      let animating: boolean = false;

      scene.onBeforeRenderObservable.add(() => {
        let keydown: boolean = false;
        const speed = 0.08;

        if (keyDownMap["KeyW"] || keyDownMap["ArrowUp"]) {
          mesh.position.z += speed;
          mesh.rotation.y = 0;
          keydown = true;
        }

        // LEFT
        if (keyDownMap["KeyA"] || keyDownMap["ArrowLeft"]) {
          mesh.position.x -= speed;
          mesh.rotation.y = 3 * Math.PI / 2;
          keydown = true;
        }

        // BACKWARD
        if (keyDownMap["KeyS"] || keyDownMap["ArrowDown"]) {
          mesh.position.z -= speed;
          mesh.rotation.y = Math.PI;
          keydown = true;
        }

        // RIGHT
        if (keyDownMap["KeyD"] || keyDownMap["ArrowRight"]) {
          mesh.position.x += speed;
          mesh.rotation.y = Math.PI / 2;
          keydown = true;
        }

        if (keydown) {
          if (!animating) {
            animating = true;
            if (walkRange) scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
          }
        } else {
          if (animating) {
            animating = false;
            if (idleRange) scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
          }
        }
      });
    });
  return item;
}

function actionManager(scene: Scene) {
  scene.actionManager = new ActionManager(scene);

  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      { trigger: ActionManager.OnKeyDownTrigger },

      function (evt) { keyDownMap[evt.sourceEvent.code] = true; }
    )
  );

  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      { trigger: ActionManager.OnKeyUpTrigger },

      function (evt) { keyDownMap[evt.sourceEvent.code] = false; }
    )
  );
  return scene.actionManager;
}

function createFixedCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2;
  let camBeta = Math.PI / 3;
  let camDist = 12;
  let camTarget = new Vector3(0, 0, 0);

  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );

  return camera;
}

function createObstacleCourse(scene: Scene, shadowGenerator: ShadowGenerator) {
  // Shared Materials
  const woodMat = new StandardMaterial("woodMat", scene);
  woodMat.diffuseTexture = new Texture("/assets/textures/wood.jpg", scene);

  const crateMat = new StandardMaterial("crateMat", scene);
  crateMat.diffuseTexture = new Texture("/assets/textures/cubehouse.png", scene);

  const wallMat = new StandardMaterial("wallMat", scene);
  wallMat.diffuseColor = new Color3(0.5, 0.5, 0.6); // Concrete Grey

  // --- PHASE 1: THE SLALOM (Z: 5 to 35) ---
  const spriteManagerPalms = new SpriteManager("palmManager", "/assets/sprites/palmtree.png", 2000, { width: 512, height: 1024 }, scene);

  for (let i = 0; i < 10; i++) {
    const palm = new Sprite("palm", spriteManagerPalms);
    palm.position.x = (i % 2 === 0) ? -2.5 : 2.5;
    palm.position.z = 5 + (i * 3.5);

    const scale = 2.0 + Math.random() * 1.0;
    palm.width = scale;
    palm.height = scale;
  }

  const plank = MeshBuilder.CreateBox("plank", { width: 2, height: 0.2, depth: 20 }, scene);
  plank.position = new Vector3(0, 0.1, 50);
  plank.material = woodMat;
  plank.receiveShadows = true;
  shadowGenerator.addShadowCaster(plank);

  const cratePositions = [
    new Vector3(-3, 1, 65), // Left
    new Vector3(3, 1, 70),  // Right
    new Vector3(-3, 1, 75), // Left
    new Vector3(0, 1, 80),  // Center block
  ];

  cratePositions.forEach((pos, index) => {
    const crate = MeshBuilder.CreateBox("crate" + index, { size: 2.5 }, scene);
    crate.position = pos;
    crate.material = crateMat;
    crate.receiveShadows = true;
    shadowGenerator.addShadowCaster(crate);
  });

  const courseLength = 100;

  const wallLeft = MeshBuilder.CreateBox("wallLeft", { width: 1, height: 6, depth: courseLength }, scene);
  wallLeft.position = new Vector3(-8, 3, 40); // Sit to the left (X=-8)
  wallLeft.material = wallMat;
  wallLeft.receiveShadows = true;
  shadowGenerator.addShadowCaster(wallLeft);

  const wallRight = MeshBuilder.CreateBox("wallRight", { width: 1, height: 6, depth: courseLength }, scene);
  wallRight.position = new Vector3(8, 3, 40); // Sit to the right (X=8)
  wallRight.material = wallMat;
  wallRight.receiveShadows = true;
  shadowGenerator.addShadowCaster(wallRight);

  const finishLine = MeshBuilder.CreateGround("finish", { width: 14, height: 2 }, scene);
  finishLine.position = new Vector3(0, 0.02, 85);
  const finishMat = new StandardMaterial("finishMat", scene);
  finishMat.diffuseColor = new Color3(0, 1, 0); // Bright Green
  finishLine.material = finishMat;
}

export default function createStartScene(engine: Engine) {
  let scene = new Scene(engine);

  let ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  let groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
  groundMat.specularColor = new Color3(0, 0, 0); // Matte ground
  ground.material = groundMat;
  ground.receiveShadows = true;

  let sky = MeshBuilder.CreateBox("sky", { size: 1000.0, sideOrientation: Mesh.BACKSIDE }, scene);
  let skyMat = new StandardMaterial("skyMat", scene);
  skyMat.diffuseColor = new Color3(0.5, 0.8, 1.0);
  sky.material = skyMat;

  let lightHemispheric = new HemisphericLight("lightHemispheric", new Vector3(0, 1, 0), scene);
  lightHemispheric.intensity = 0.5;

  let dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, -1), scene);
  dirLight.position = new Vector3(20, 40, 20);
  dirLight.intensity = 0.7;

  let shadowGenerator = new ShadowGenerator(1024, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;

  let camera = createFixedCamera(scene);

  let that: SceneData = {
    scene,
    ground,
    sky,
    lightHemispheric,
    camera
  };
  that.importMesh = importPlayerMesh(that.scene, camera, shadowGenerator);

  that.actionManager = actionManager(that.scene);

  createObstacleCourse(that.scene, shadowGenerator);

  return that;
}