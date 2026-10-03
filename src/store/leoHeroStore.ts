import * as THREE from "three";

/**
 * Leo Events Hero Kinematics State
 * 
 * Shared target vectors for the shock-absorber camera rig and GSAP ScrollTrigger.
 * Eliminates garbage-collection object allocations inside useFrame and eliminates
 * direct mutation of camera.userData.
 */
export const leoKinematics = {
  targetPosition: new THREE.Vector3(0.0, 13.5, 21.8),
  targetLookAt: new THREE.Vector3(0.0, 3.5, 0.0),
};
