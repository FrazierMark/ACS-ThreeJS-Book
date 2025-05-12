import { useRef, useMemo, useEffect, useState } from "react";
import { BoxGeometry, MeshStandardMaterial, SkinnedMesh, Bone, Skeleton, Vector3, Uint16BufferAttribute, Float32BufferAttribute, Color, DataTexture, RGBAFormat } from "three";
import { useHelper, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSelector } from "react-redux";
import { getAllPages } from "../features/pagesSlice";
import { getBookCovers } from "../redux/actions/bookActions";
import { degToRad, MathUtils } from "three/src/math/MathUtils";
import { easing } from 'maath';
import { SkeletonHelper, SRGBColorSpace, Texture } from "three";
import { loadTextureFromUrl, loadFallbackTexture } from "../services/textureService";

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

// Create a programmatic roughness texture
const createRoughnessTexture = (roughnessValue, size = 32) => {
  // Create a texture filled with the roughness value
  const data = new Uint8Array(size * size * 4);
  const value = Math.floor(roughnessValue * 255);

  for (let i = 0; i < size * size * 4; i += 4) {
    data[i] = value;     // R
    data[i + 1] = value; // G
    data[i + 2] = value; // B
    data[i + 3] = 255;   // A (opacity)
  }

  const roughnessTexture = new DataTexture(data, size, size, RGBAFormat);
  roughnessTexture.needsUpdate = true;
  return roughnessTexture;
};

// Create various roughness textures
const glossyRoughnessTexture = createRoughnessTexture(0.1);   // For covers (glossy)
const matteRoughnessTexture = createRoughnessTexture(0.6);    // For pages (matte)

export const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const pages = useSelector(getAllPages);
  const bookCovers = useSelector(getBookCovers);

  // State to hold dynamically loaded textures
  const [frontTexture, setFrontTexture] = useState(null);
  const [backTexture, setBackTexture] = useState(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  // Determine if this is a cover page
  const isFrontCover = number === 0;
  const isBackCover = number === pages.length - 1;
  const isCover = isFrontCover || isBackCover;

  // Preload textures when component mounts
  useEffect(() => {
    pages.forEach(page => {
      useTexture.preload(`/textures/${page.front}.jpg`);
      useTexture.preload(`/textures/${page.back}.jpg`);
    });
  }, [pages]);

  // Load textures from the API or fallback to static files
  useEffect(() => {
    const loadTextures = async () => {
      let front, back;

      // For the front cover (first page) or back cover (last page)
      if (number === 0 && bookCovers.front) {
        // Try to load front cover from API
        try {
          front = await loadTextureFromUrl(bookCovers.front);
        } catch (error) {
          front = await loadTextureFromUrl(`/textures/${front}.jpg`);
        }
      } else if (number === pages.length - 1 && bookCovers.back) {
        // Try to load back cover from API
        try {
          back = await loadTextureFromUrl(bookCovers.back);
        } catch (error) {
          back = await loadTextureFromUrl(`/textures/${back}.jpg`);
        }
      } else {
        // Load regular page textures
        front = await loadTextureFromUrl(`/textures/${front}.jpg`);
        back = await loadTextureFromUrl(`/textures/${back}.jpg`);
      }

      // Fix texture color space
      if (front) front.colorSpace = SRGBColorSpace;
      if (back) back.colorSpace = SRGBColorSpace;

      setFrontTexture(front);
      setBackTexture(back);
      setTexturesLoaded(true);
    };

    loadTextures();
  }, [number, front, back, pages.length, bookCovers]);

  // Use static textures while dynamic ones load
  const [staticFront, staticBack] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
  ]);

  staticFront.colorSpace = staticBack.colorSpace = SRGBColorSpace;

  // Use dynamic textures when loaded, otherwise fallback to static ones
  const picture = frontTexture || staticFront;
  const picture2 = backTexture || staticBack;

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

    // Choose the appropriate roughness texture based on page type
    const frontRoughness = isFrontCover ? glossyRoughnessTexture : matteRoughnessTexture;
    const backRoughness = isBackCover ? glossyRoughnessTexture : matteRoughnessTexture;

    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        roughnessMap: frontRoughness,
        roughness: isFrontCover ? 0.1 : 0.6,
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        roughnessMap: backRoughness,
        roughness: isBackCover ? 0.1 : 0.6,
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [picture, picture2, isFrontCover, isBackCover]);

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