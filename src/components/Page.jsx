import { useRef } from "react";

export const Page = ({ number, front, back, ...props }) => {

  const groupRef = useRef();

  return (
    <group {...props} ref={groupRef}>
      <mesh scale={0.1} >
        <boxGeometry />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  )
}