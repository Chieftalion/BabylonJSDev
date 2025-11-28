import {
  Scene,
  ArcRotateCamera,
  Vector3,
  Camera,
  Engine
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

function createSceneButton(scene: Scene, name: string, note: string, index: number, x: string, y: string, advtex: GUI.AdvancedDynamicTexture, onButtonClick: (i: number) => void) {
  let button = GUI.Button.CreateSimpleButton(name, note);
  button.left = x;
  button.top = y;
  button.width = "80px";
  button.height = "30px";
  button.color = "white";
  button.cornerRadius = 20;
  button.background = "purple";

  button.onPointerUpObservable.add(function () {
    console.log("THE BUTTON HAS BEEN CLICKED: " + index);
    onButtonClick(index - 1);
  });

  advtex.addControl(button);
  return button;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2;
  let camBeta = Math.PI / 2.5;
  let camDist = 10;
  let camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera("camera1", camAlpha, camBeta, camDist, camTarget, scene);
  camera.attachControl(false);
  return camera;
}

export default function menuScene(engine: Engine, setSceneCallback: (i: number) => void) {
  interface SceneData {
    scene: Scene;
    advancedTexture: GUI.AdvancedDynamicTexture;
    button1: GUI.Button;
    button2: GUI.Button;
    camera: Camera;
  }

  let scene = new Scene(engine);
  let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);

  var button1 = createSceneButton(scene, "but1", "1", 1, "-150px", "120px", advancedTexture, setSceneCallback);
  var button2 = createSceneButton(scene, "but2", "2", 2, "150px", "120px", advancedTexture, setSceneCallback);

  var camera = createArcRotateCamera(scene);

  let that: SceneData = {
    scene,
    advancedTexture,
    button1,
    button2,
    camera
  };

  return that;
}