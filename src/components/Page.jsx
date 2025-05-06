import { useRef, useMemo, useEffect } from "react";
import { BoxGeometry, MeshStandardMaterial, SkinnedMesh, Bone, Skeleton, Vector3, Uint16BufferAttribute, Float32BufferAttribute, Color } from "three";
import { useHelper, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSelector } from "react-redux";
import { allPages } from "../features/pagesSlice";
import { degToRad } from "three/src/math/MathUtils";
import { SkeletonHelper, SRGBColorSpace } from "three";

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
]

export const Page = ({ number, front, back, page, opened, ...props }) => {
  const pages = useSelector(allPages);

  // Preload textures when component mounts
  useEffect(() => {
    pages.forEach(page => {
      useTexture.preload(`/textures/${page.front}.jpg`);
      useTexture.preload(`/textures/${page.back}.jpg`);
      useTexture.preload(`/textures/book-cover-roughness.jpg`);
    });
  }, [pages]);

  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length - 1) ? [`/textures/book-cover-roughness.jpg`] : []
  ]);

  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;

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
    const materials = [...pageMaterials,
    new MeshStandardMaterial({
      color: whiteColor,
      map: picture,
      ...(number === 0) ? {
        roughnessMap: pictureRoughness,
      } : {
        roughness: 0.1 // closer to 1 is more matte
      }
    }),
    new MeshStandardMaterial({
      color: whiteColor,
      map: picture2,
      ...(number === pages.length - 1) ? {
        roughnessMap: pictureRoughness,
      } : {
        roughness: 0.1 // closer to 1 is more matte
      }
    }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
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

  useHelper(skinnedMeshRef, SkeletonHelper, "red");
  useFrame(() => {
    if (!skinnedMeshRef.current) return;


    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    targetRotation += degToRad(number * 0.5)

    const bones = skinnedMeshRef.current.skeleton.bones;
    bones[0].rotation.y = targetRotation;
  });

  return (
    <group {...props} ref={groupRef}>
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  )
}