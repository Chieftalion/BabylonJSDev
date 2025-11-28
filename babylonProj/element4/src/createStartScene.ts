//import "@babylonjs/core/Debug/debugLayer";
//import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF/2.0";
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";
import {
  Scene,
  ArcRotateCamera,
  AssetsManager,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  Camera,
  Engine,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  Color3,
  StandardMaterial,
  Texture,
} from "@babylonjs/core";


function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  return light;
}

function createGround(scene: Scene) {
  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 16, height: 16 },
    scene
  );
  
    // Create a static box shape.
  let groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
  return groundAggregate;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 10,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.attachControl(true);
  return camera;
}

function createBox1(scene: Scene) {
  let box = MeshBuilder.CreateBox("box", { width: 1, height: 1 }, scene);
  box.position.x = -1;
  box.position.y = 3;
  box.position.z = 1;

  var texture = new StandardMaterial("reflective", scene);
  texture.ambientTexture = new Texture(
    "/assets/textures/wood.jpg",
    scene
  );
  texture.diffuseColor = new Color3(1, 1, 1);
  box.material = texture;
  let box1Aggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, {mass: 0.2, restitution:0.1, friction:0.4}, scene);
  box1Aggregate.body.setCollisionCallbackEnabled(true);
  return box1Aggregate;
}

function createBox2(scene: Scene) {
  let box = MeshBuilder.CreateBox("box", { width: 1, height: 1 }, scene);
  box.position.x = -0.7;
  box.position.y = 5;
  box.position.z = 1;

  var texture = new StandardMaterial("reflective", scene);
  texture.ambientTexture = new Texture(
    "/assets/textures/wood.jpg",
    scene
  );
  texture.diffuseColor = new Color3(1, 1, 1);
  box.material = texture;
  let box2Aggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, {mass: 0.2, restitution:0.1, friction:0.4}, scene);
  box2Aggregate.body.setCollisionCallbackEnabled(true);
  return box2Aggregate;
}

function addAssets(scene: Scene) {
  // add assets here
  const assetsManager = new AssetsManager(scene);
  const tree1 = assetsManager.addMeshTask(
    "tree1 task",
    "",
    "/assets/nature/gltf/",
    "CommonTree_1.gltf"
  );
  tree1.onSuccess = function (task) {
    const root = task.loadedMeshes[0];
    root.position = new Vector3(3, 0, 2);
    root.scaling = new Vector3(0.5, 0.5, 0.5);
    // Ensure all child meshes are visible
    task.loadedMeshes.forEach((mesh: any) => {
      mesh.isVisible = true;
    });
    //new PhysicsAggregate(root, PhysicsShapeType.MESH, {mass: 0}, scene);
    
    // Clone tree1
    const tree1Clone = root.clone("tree1_clone", null);
    tree1Clone!.position = new Vector3(0, 0, 5);
    //new PhysicsAggregate(tree1Clone!, PhysicsShapeType.MESH, {mass: 0}, scene);
  };

  const tree2 = assetsManager.addMeshTask(
    "tree1 task",
    "",
    "/assets/nature/gltf/",
    "CommonTree_2.gltf"
  );
  tree2.onSuccess = function (task) {
    task.loadedMeshes[0].position = new Vector3(0, 0, 2);
    task.loadedMeshes[0].scaling = new Vector3(0.5, 0.5, 0.5);
    // Clone tree2
    const tree2Clone = task.loadedMeshes[0].clone("tree2_clone", null);
    tree2Clone!.position = new Vector3(-3, 0, 5);
  };

  const tree3 = assetsManager.addMeshTask(
    "tree1 task",
    "",
    "/assets/nature/gltf/",
    "CommonTree_3.gltf"
  );
  tree3.onSuccess = function (task) {
    task.loadedMeshes[0].position = new Vector3(-3, 0, 2);
    task.loadedMeshes[0].scaling = new Vector3(0.5, 0.5, 0.5);
    // Clone tree3
    const tree3Clone = task.loadedMeshes[0].clone("tree3_clone", null);
    tree3Clone!.position = new Vector3(3, 0, 5);
  };

  assetsManager.onTaskErrorObservable.add(function (task) {
    console.log(
      "task failed",
      task.errorObject.message,
      task.errorObject.exception
    );
  });
  return assetsManager;
}


export default async function createStartScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    light?: HemisphericLight;
    ground?: PhysicsAggregate;
    camera?: Camera;
    box1?:PhysicsAggregate;
    box2?:PhysicsAggregate;
  }

  let that: SceneData = { scene: new Scene(engine) };

  let initializedHavok: any;

  HavokPhysics().then((havok) => {
    initializedHavok = havok;
  });

  const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();
  const hk: HavokPlugin = new HavokPlugin(true, havokInstance);
  that.scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

  //that.scene.debugLayer.show();

  that.light = createLight(that.scene);
  that.ground = createGround(that.scene);
  that.camera = createArcRotateCamera(that.scene);
  that.box1 = createBox1(that.scene);
  that.box2 = createBox2(that.scene);
  const assetsManager = addAssets(that.scene);
  assetsManager.load();
  return that;
}
