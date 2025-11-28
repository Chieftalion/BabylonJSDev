import { Engine } from "@babylonjs/core";
import createScene1 from "./scene01/createStartScene";
import createScene2 from "./scene02/createStartScene";
import menuScene from "./gui/guiScene";
import "./gui/main.css"; // Fixed path

const CanvasName = "renderCanvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let eng = new Engine(canvas, true, {}, true);

let scenes: any[] = [];
let gui: any;

(async function main() {
  gui = menuScene(eng, setSceneIndex);

  scenes[0] = await createScene1(eng);
  scenes[1] = await createScene2(eng);

  setSceneIndex(0);
})();

export default function setSceneIndex(index: number) {
  eng.stopRenderLoop();


  scenes.forEach((s) => {
    if (s && s.scene && s.scene.activeCamera) {
      s.scene.activeCamera.detachControl();
    }
  });

  if (scenes[index] && scenes[index].scene && scenes[index].scene.activeCamera) {
    scenes[index].scene.activeCamera.attachControl(canvas, true);
  }
  // -------------------------------

  eng.runRenderLoop(() => {
    if (scenes[index] && scenes[index].scene) {
      scenes[index].scene.render();
    }

    if (gui && gui.scene) {
      gui.scene.autoClear = false;
      gui.scene.render();
    }
  });
}