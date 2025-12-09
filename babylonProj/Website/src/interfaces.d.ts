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
  ground?: Mesh | PhysicsAggregate; // Can be either
  skybox?: Mesh;
  camera?: Camera | ArcRotateCamera;
  light?: HemisphericLight | PointLight;
  stars?: any; // For the star systems
  planets?: any[]; // For the solar system list

  // GUI specific
  advancedTexture?: GUI.AdvancedDynamicTexture;
  button1?: GUI.Button;
  button2?: GUI.Button;
}