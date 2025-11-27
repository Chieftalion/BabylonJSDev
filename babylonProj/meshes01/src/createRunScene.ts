import { Vector3, Quaternion } from "@babylonjs/core";

import { SceneData } from "./interfaces";

let boxAngle: number = 0.3;
let boxSpeed: number = 0.0025;


let lightAngle: number = 0;
let lightSpeed: number = 0.005;
const lightXpos: number = 1;
const lightZpos: number = 5;

export default function createRunScene(runScene: SceneData) {
  runScene.scene.onAfterRenderObservable.add(() => {

    const axis: Vector3 = new Vector3(0, 0, 1).normalize();
    const quat: Quaternion = Quaternion.RotationAxis(
      axis,
      boxAngle * 2 * Math.PI
    );
    runScene.box!.rotationQuaternion = quat;
    boxAngle += boxSpeed;
    boxAngle %= 1;

    if (runScene.point) {
      runScene.point.position.x = Math.sin(lightAngle) * 10;
      runScene.point.position.z = Math.cos(lightAngle) * 10;

      runScene.point.position.y = 5 + Math.sin(lightAngle * 3);

      lightAngle += 0.01;
    }
  });
}