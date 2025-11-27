import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  Light,
  Camera,
  Engine,
  StandardMaterial,
  Color3,
  HemisphericLight as Hemi,
  PointLight,
  SpotLight,
  DirectionalLight,
  ShadowGenerator,
  Texture,
} from "@babylonjs/core";

export interface SceneData {
  scene: Scene;
  box?: Mesh;
  light?: Light;
  hemi?: HemisphericLight;
  point?: PointLight;
  spot?: SpotLight;
  sphere?: Mesh;
  cylinder?: Mesh;
  cone?: Mesh;
  triangle?: Mesh;
  capsule?: Mesh;
  ground?: Mesh;
  camera?: Camera;
  shadow?: ShadowGenerator;
  dLight?: DirectionalLight;
}