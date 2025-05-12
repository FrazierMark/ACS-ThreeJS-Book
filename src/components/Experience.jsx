import { Environment, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { useSelector } from "react-redux";

export const Experience = () => {
  const selectedBook = useSelector(state => state.books.selectedBook);

  return (
    <>
      <OrbitControls />
      <Environment preset="studio"></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      {selectedBook && <Book position={[0, 0, 0]} />}
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
