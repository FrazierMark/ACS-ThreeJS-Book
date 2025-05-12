import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { useSelector } from "react-redux";
import ChatWindow from "./components/ChatWindow";

function App() {
  const selectedBook = useSelector(state => state.books.selectedBook);

  return (
    <>
      <UI />
      <Loader />

      {selectedBook && (
        <div className="flex w-full h-screen">
          <div className="w-1/3 p-4 pt-20">
            <ChatWindow />
          </div>

          <div className="w-2/3">
            <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
              <group position-y={0}>
                <Suspense fallback={null}>
                  <Experience />
                </Suspense>
              </group>
            </Canvas>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
