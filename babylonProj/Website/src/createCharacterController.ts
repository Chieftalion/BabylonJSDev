import {
  Scene,
  ArcRotateCamera,
  Vector3,
  Mesh,
  SceneLoader,
  AnimationPropertiesOverride,
  ActionManager,
  ExecuteCodeAction,
  Quaternion,
  PhysicsAggregate,
  PhysicsShapeType,
  ShadowGenerator
} from "@babylonjs/core";

export function createCharacterController(scene: Scene, camera: ArcRotateCamera, shadowGenerator: ShadowGenerator) {

  let keyDownMap: any = {};

  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(new ExecuteCodeAction({ trigger: ActionManager.OnKeyDownTrigger }, (evt) => { keyDownMap[evt.sourceEvent.code] = true; }));
  scene.actionManager.registerAction(new ExecuteCodeAction({ trigger: ActionManager.OnKeyUpTrigger }, (evt) => { keyDownMap[evt.sourceEvent.code] = false; }));
  window.addEventListener("blur", () => { keyDownMap = {}; });

  SceneLoader.ImportMesh("", "/assets/models/men/", "dummy3.babylon", scene,
    function (newMeshes, particleSystems, skeletons) {
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];

      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh, true);
      camera.lockedTarget = mesh;

      // Physics Body (Capsule)
      let playerAgg = new PhysicsAggregate(mesh, PhysicsShapeType.CAPSULE, { mass: 1, friction: 0, restitution: 0 }, scene);
      playerAgg.body.setMassProperties({ inertia: new Vector3(0, 0, 0) }); // Lock rotation

      // Animations
      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1;

      let walkRange = skeleton.getAnimationRange("YBot_Walk");
      let idleRange = skeleton.getAnimationRange("YBot_Idle");

      let animating: boolean = false;
      let currentAnim: any = null;

      scene.onBeforeRenderObservable.add(() => {
        let keydown = false;
        const speed = 6.0;

        // Camera Directions
        const forward = camera.getForwardRay().direction;
        forward.y = 0;
        forward.normalize();

        const right = camera.getDirection(Vector3.Right());
        right.y = 0;
        right.normalize();

        let moveVector = Vector3.Zero();

        if (keyDownMap["KeyW"] || keyDownMap["ArrowUp"]) { moveVector.addInPlace(forward); keydown = true; }
        if (keyDownMap["KeyS"] || keyDownMap["ArrowDown"]) { moveVector.subtractInPlace(forward); keydown = true; }
        if (keyDownMap["KeyD"] || keyDownMap["ArrowRight"]) { moveVector.addInPlace(right); keydown = true; }
        if (keyDownMap["KeyA"] || keyDownMap["ArrowLeft"]) { moveVector.subtractInPlace(right); keydown = true; }

        // Physics Movement
        if (keydown && moveVector.length() > 0) {
          moveVector.normalize().scaleInPlace(speed);
          playerAgg.body.setLinearVelocity(new Vector3(moveVector.x, -4, moveVector.z));

          // Rotate Body
          const targetRotation = Math.atan2(moveVector.x, moveVector.z);
          mesh.rotationQuaternion = Quaternion.Slerp(
            mesh.rotationQuaternion || Quaternion.Identity(),
            Quaternion.FromEulerAngles(0, targetRotation, 0),
            0.15
          );
        } else {
          playerAgg.body.setLinearVelocity(new Vector3(0, -4, 0));
        }

        // Animation
        let desiredAnim = keydown ? walkRange : idleRange;
        if (currentAnim !== desiredAnim) {
          currentAnim = desiredAnim;
          scene.beginAnimation(skeleton, currentAnim.from, currentAnim.to, true);
        }
      });
    }
  );
}