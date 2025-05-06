import { useRef, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial, SkinnedMesh, Bone, Skeleton, Vector3, Uint16BufferAttribute, Float32BufferAttribute, Color } from "three";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; //4:3 aspect ratio
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();

const skinIndexes = [] // Bones
const skinWeights = [] // Weights determine how much each bone affects the vertex


// Create a skin index and weight for each vertex
for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i); //get the vertex position
  const x = vertex.x // get the x coordinate of the vertex

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0); // Add the weights for each vertex
}

// Add the skin index and weight to the geometry
pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
)

pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
)

const whiteColor = new Color("white");

const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "pink",
  }),
  new MeshStandardMaterial({
    color: "blue",
  }),
]

export const Page = ({ number, front, back, ...props }) => {
  const groupRef = useRef();
  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    const rootBone = new Bone();
    rootBone.position.set(0, 0, 0);
    bones.push(rootBone);

    // Create the bone chain
    for (let i = 1; i < PAGE_SEGMENTS + 1; i++) {
      const bone = new Bone();
      bone.position.x = SEGMENT_WIDTH;
      bones[i - 1].add(bone);
      bones.push(bone);
    }

    // Create the skeleton with the bone hierarchy
    const skeleton = new Skeleton(bones);

    // Create the skinned mesh
    const mesh = new SkinnedMesh(pageGeometry, pageMaterials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    // Add the root bone to the mesh and bind the skeleton
    mesh.add(bones[0]);
    mesh.bind(skeleton);

    // Update the skeleton's matrices
    skeleton.pose();

    return mesh;
  }, []);

  return (
    <group {...props} ref={groupRef}>
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
    </group>
  )
}