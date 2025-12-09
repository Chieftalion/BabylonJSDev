import {
  Scene,
  Mesh,
  HemisphericLight,
  Camera,
  ArcRotateCamera,
  PhysicsAggregate,
  PointLight
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export interface SceneData {
  scene: Scene;
  ground?: Mesh | PhysicsAggregate;
  skybox?: Mesh;
  camera?: Camera | ArcRotateCamera;
  light?: HemisphericLight | PointLight;
  stars?: any;
  planets?: any[];

  advancedTexture?: GUI.AdvancedDynamicTexture;
  button1?: GUI.Button;
  button2?: GUI.Button;
}