import {} from "@babylonjs/core";

import { SceneData } from "./interfaces";

export default function createRunScene(runScene: SceneData) {
 
  var stash: { [key: string]: string } = { message: "Empty Stash" };
 




  
  runScene.scene.onAfterRenderObservable.add(() => {});
}
