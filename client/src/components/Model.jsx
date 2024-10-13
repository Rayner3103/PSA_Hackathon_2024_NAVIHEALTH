import React, { Suspense } from "react";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function handleModelClick(setOpen) {
  // request for prediction
  return setOpen(true)
}

// Model component that loads and renders a 3D model
const ModelAGV = ({ modelPath, scale, setOpen }) => {
  // useGLTF hook to load GLTF or GLB files
  const { scene } = useGLTF(modelPath);
  scene
  return <primitive object={scene} scale={scale} position={[50, -25, 0]} onClick={() => {handleModelClick(setOpen)}} onPointerMissed={(e) => {setOpen(false)}}/>;
};
const ModelCrane = ({ modelPath, position, scale, setOpen }) => {
  // useGLTF hook to load GLTF or GLB files
  const { scene } = useGLTF(modelPath);
  scene
  return <primitive object={scene} scale={scale} position={[-50, -25, 0]} onClick={() => {handleModelClick(setOpen)}} onPointerMissed={(e) => {setOpen(false)}}/>;
};

// Main ThreeModel component
const ThreeModel = ({ camera, setOpen }) => {
  return (
    <Canvas style={{ height: window.innerHeight, width: 0.7 * window.innerWidth }} camera={camera} >
      {/* Ambient light for subtle lighting */}
      <ambientLight intensity={0.5} />
      {/* Directional light to give the scene a light source */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        {/* The Model component where we load the 3D model */}
        <ModelAGV modelPath="/agv.glb" scale={0.05} setOpen={setOpen}/>
        <ModelCrane modelPath="/harbor_crane.glb" scale={5} setOpen={setOpen}/>
        {/* OrbitControls allow user to move the camera around */}
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
};

export default ThreeModel;