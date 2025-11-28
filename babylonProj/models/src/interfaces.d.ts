import { Scene, Mesh, HemisphericLight, ArcRotateCamera } from "@babylonjs/core";

export interface SceneData {
  scene: Scene;
  ground: Mesh;
  sky: Mesh;
  lightHemispheric: HemisphericLight;
  camera: ArcRotateCamera;
  importMesh?: any;
  actionManager?: any;
}