import { useRef, useMemo, useEffect } from "react";
import { BoxGeometry, MeshStandardMaterial, SkinnedMesh, Bone, Skeleton, Vector3, Uint16BufferAttribute, Float32BufferAttribute, Color } from "three";
import { useHelper, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSelector } from "react-redux";
import { getAllPages } from "../features/pagesSlice";
import { degToRad, MathUtils } from "three/src/math/MathUtils";
import { easing } from 'maath';
import { SkeletonHelper, SRGBColorSpace } from "three";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; //4:3 aspect ratio
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const easingFactor = 0.5;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

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

export const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const pages = useSelector(getAllPages);

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
  const lastOpened = useRef(opened);
  const turnedAt = useRef(0);
  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    // Create the bone chain
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }

      if (i > 0) {
        bones[i - 1].add(bone) // attach the bone to the previous bone
      }
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(number === 0
          ? {
            roughnessMap: pictureRoughness,
          }
          : {
            roughness: 0.1,
          }),
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        ...(number === pages.length - 1
          ? {
            roughnessMap: pictureRoughness,
          }
          : {
            roughness: 0.1,
          }),
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  useHelper(skinnedMeshRef, SkeletonHelper, "red");
  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8)
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? groupRef.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningCurveIntensity = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      let rotationAngle = insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningCurveIntensity * targetRotation;

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
        } else {
          rotationAngle = 0
        }
      }
      easing.dampAngle(target.rotation, "y", rotationAngle, easingFactor, delta);
    }

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