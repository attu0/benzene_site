import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import URDFLoader from "urdf-loader";
import { useStore } from "./store";
import { resolve, ROBOT_RADIUS, ENVIRONMENTS } from "./env";
import Lidar from "./Lidar";

const LEFT = "left_wheel_joint";
const RIGHT = "right_wheel_joint";
const R = 0.035; // wheel radius (m)
const L = 0.185; // wheel separation (m)
const LIFT = 0.02; // extra clearance above the floor (m)

// bot-cam window (keep in sync with .botcam in index.css)
const CAM = { w: 320, h: 240, margin: 16, fwd: 0.12, y: 0.14, fov: 75 };

export default function Robot() {
  const group = useRef();
  const [robot, setRobot] = useState(null);
  const home = useRef(new Map());
  const keys = useRef({});
  const sim = useRef({ x: 0, z: 0, h: 0, left: 0, right: 0 });
  const controls = useThree((s) => s.controls);
  const tmp = useRef(new THREE.Vector3());
  const lidarGroup = useRef();
  const botCam = useMemo(
    () => new THREE.PerspectiveCamera(CAM.fov, CAM.w / CAM.h, 0.02, 40),
    [],
  );
  const transparent = useStore((s) => s.transparent);
  const env = useStore((s) => s.env);

  // back to the dock whenever the environment changes
  useEffect(() => {
    const s = sim.current;
    s.x = 0;
    s.z = 0;
    s.h = 0;
    if (controls) {
      controls.target.set(0, 0.1, 0);
      controls.object.position.set(1.2, 0.8, 1.2);
      controls.update();
    }
  }, [env, controls]);

  useEffect(() => {
    let cancelled = false;
    let done = false;
    let loaded = null;

    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    loader.packages = { benzene_description: "/benzene_description" };

    // fires once the URDF AND all STL meshes have finished loading
    manager.onLoad = () => {
      if (cancelled || done || !loaded) return;
      done = true;
      const r = loaded;
      r.rotation.x = -Math.PI / 2; // ROS is Z-up, three.js is Y-up

      r.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.material) o.material = o.material.clone();
        }
      });

      // rest the lowest point of the robot exactly on the floor
      r.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(r);
      r.position.y -= box.min.y - LIFT;

      Object.values(r.joints).forEach((j) =>
        home.current.set(j, j.position.clone()),
      );
      setRobot(r);
    };

    loader.load("/benzene.urdf", (r) => {
      loaded = r;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const down = (e) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e) => (keys.current[e.key.toLowerCase()] = false);
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    return () => {
      removeEventListener("keydown", down);
      removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    if (!robot) return;
    robot.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material.transparent = transparent;
        o.material.opacity = transparent ? 0.3 : 1;
        o.material.needsUpdate = true;
      }
    });
  }, [robot, transparent]);

  useFrame((_, dt) => {
    if (!robot) return;
    const { speed, explode, env: envKey } = useStore.getState();
    const k = keys.current;
    const slow = k.shift ? 0.4 : 1;
    let v =
      ((k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0)) *
      speed *
      slow;
    let w =
      ((k.a || k.arrowleft ? 1 : 0) - (k.d || k.arrowright ? 1 : 0)) *
      1.2 *
      slow;
    if (explode > 0) {
      v = 0;
      w = 0;
    }

    const s = sim.current;
    s.h += w * dt;
    s.x += Math.cos(s.h) * v * dt;
    s.z -= Math.sin(s.h) * v * dt;
    const [cx, cz] = resolve(s.x, s.z, ROBOT_RADIUS, ENVIRONMENTS[envKey].boxes);
    s.x = cx;
    s.z = cz;
    s.left += ((v - (w * L) / 2) / R) * dt;
    s.right += ((v + (w * L) / 2) / R) * dt;

    group.current.position.set(s.x, 0, s.z);
    group.current.rotation.y = s.h;
    robot.joints[LEFT]?.setJointValue(s.left);
    robot.joints[RIGHT]?.setJointValue(s.right);

    home.current.forEach((p, j) => {
      const dir =
        p.lengthSq() > 1e-8
          ? p.clone().normalize()
          : new THREE.Vector3(0, 0, 1);
      j.position.copy(p).addScaledVector(dir, explode);
    });

    if (v !== 0)
      useStore.setState((st) => ({ distance: st.distance + Math.abs(v) * dt }));

    if (controls) {
      const before = controls.target.clone();
      controls.target.lerp(tmp.current.set(s.x, 0.1, s.z), 0.08);
      controls.object.position.add(controls.target.clone().sub(before));
    }
  });

  // Takes over rendering (priority > 0): main view first, then the bot-cam
  // picture-in-picture in the bottom-right corner.
  useFrame(({ gl, scene, camera, size }) => {
    gl.setScissorTest(false);
    gl.setViewport(0, 0, size.width, size.height);
    gl.render(scene, camera);

    if (!robot || !useStore.getState().botCam) return;

    const s = sim.current;
    const fx = Math.cos(s.h);
    const fz = -Math.sin(s.h);
    botCam.position.set(s.x + fx * CAM.fwd, CAM.y, s.z + fz * CAM.fwd);
    botCam.lookAt(botCam.position.x + fx, CAM.y, botCam.position.z + fz);

    // the camera shouldn't see the robot's own body or the lidar overlay
    const lg = lidarGroup.current;
    const lidarWasVisible = lg ? lg.visible : false;
    group.current.visible = false;
    if (lg) lg.visible = false;

    const x = size.width - CAM.w - CAM.margin;
    gl.setScissorTest(true);
    gl.setViewport(x, CAM.margin, CAM.w, CAM.h);
    gl.setScissor(x, CAM.margin, CAM.w, CAM.h);
    gl.render(scene, botCam);
    gl.setScissorTest(false);
    gl.setViewport(0, 0, size.width, size.height);

    group.current.visible = true;
    if (lg) lg.visible = lidarWasVisible;
  }, 1);

  return (
    <>
      <group ref={group}>{robot && <primitive object={robot} />}</group>
      <Lidar sim={sim} groupRef={lidarGroup} />
    </>
  );
}