import { Engine } from "@babylonjs/core";
import menuScene from "./gui/guiScene";
import "./gui/main.css";

import createMeshes from "../../meshes01/src/createStartScene";
import createVillage from "../../village/src/createStartScene";
import createPhysics from "../../element4/src/createStartScene";
import createModels from "../../models/src/createStartScene";
import createAlpha from "../../element5/src/scene01/createStartScene";
import createSolar from "../../element5/src/scene02/createStartScene";

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

  console.log("Loading Portfolio...");

  try { scenes[0] = await createMeshes(eng); } catch (e) { console.error(e); }
  try { scenes[1] = await createVillage(eng); } catch (e) { console.error(e); }
  try { scenes[2] = await createPhysics(eng); } catch (e) { console.error(e); }
  try { scenes[3] = await createModels(eng); } catch (e) { console.error(e); }
  try { scenes[4] = await createAlpha(eng); } catch (e) { console.error(e); }
  try { scenes[5] = await createSolar(eng); } catch (e) { console.error(e); }

  setSceneIndex(-1);
})();

export default function setSceneIndex(index: number) {
  eng.stopRenderLoop();

  scenes.forEach((s) => {
    if (s && s.scene) {
      if (s.scene.activeCamera) s.scene.activeCamera.detachControl();

      if (s.scene.debugLayer && s.scene.debugLayer.isVisible()) {
        s.scene.debugLayer.hide();
      }
    }
  });

  if (index === -1 || index === -2) {
    gui.sphere.isVisible = true;
    eng.runRenderLoop(() => {
      gui.scene.render();
    });
  } else if (scenes[index] && scenes[index].scene) {
    gui.sphere.isVisible = false;
    scenes[index].scene.activeCamera.attachControl(canvas, true);
    eng.runRenderLoop(() => {
      scenes[index].scene.render();
      gui.scene.autoClear = false;
      gui.scene.render();
    });
  }
}