import { PhysicsAggregate } from "@babylonjs/core";
import { SceneData } from "./interfaces";
import { gui, setText} from "./gui";

// Collision callback function
const collideCB = (collision: {
  collider: { transformNode: { name: any } };
  collidedAgainst: { transformNode: { name: any } };
  point: any;
  distance: any;
  impulse: any;
  normal: any;
}): void => {
  console.log(
    "collideCB",
    collision.collider.transformNode.name,
    collision.collidedAgainst.transformNode.name
  );
};

const collideCB1 = (collision: {
  collider: { transformNode: { name: any } };
  collidedAgainst: { transformNode: { name: any } };
  point: any;
  distance: any;
  impulse: any;
  normal: any;
}): void => {
  console.log(
    "collideCB1",
    collision.collider.transformNode.name,
    collision.collidedAgainst.transformNode.name
  );
  setText(collision.collider.transformNode.name,1);
  setText(collision.collidedAgainst.transformNode.name,2);
  setText(collision.point.x.toFixed(2),3)
  setText(collision.point.z.toFixed(2),4);

};

export function setupCollisions(sceneData: SceneData): void {
  // Collision filter groups
  const FILTER_GROUP_GROUND = 1;
  const FILTER_GROUP_PLATFORM = 2;
  const FILTER_GROUP_CUBE = 3;
  const FILTER_GROUP_OBSTACLE = 4;
  const FILTER_GROUP_PLAYER = 5;

  // Apply masks and collisions to physics agggregates
  if (sceneData.ground) {
    sceneData.ground.shape.filterMembershipMask = FILTER_GROUP_GROUND;
    sceneData.ground.shape.filterCollideMask = FILTER_GROUP_CUBE | FILTER_GROUP_GROUND;
    sceneData.ground.body.getCollisionObservable().add(collideCB1);
  }

  if (sceneData.box1) {
    sceneData.box1.shape.filterMembershipMask = FILTER_GROUP_CUBE;
        sceneData.box1.shape.filterCollideMask = FILTER_GROUP_CUBE | FILTER_GROUP_GROUND;
    sceneData.box1.body?.getEventMask();
    sceneData.box1.body?.getCollisionObservable().add(collideCB);
  }

  if (sceneData.box2) {
    sceneData.box2.shape.filterMembershipMask = FILTER_GROUP_CUBE;
        sceneData.box2.shape.filterCollideMask = FILTER_GROUP_CUBE | FILTER_GROUP_GROUND;
    sceneData.box2.body?.getEventMask();
    sceneData.box2.body?.getCollisionObservable().add(collideCB);
  }
}

