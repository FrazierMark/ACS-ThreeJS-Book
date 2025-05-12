import { TextureLoader } from 'three';
import { SRGBColorSpace } from 'three';
import axios from 'axios';

const textureLoader = new TextureLoader();
const textureCache = new Map();

/**
 * Load a texture from a URL or use cached version if already loaded
 * @param {string} url - URL of the texture
 * @returns {Promise<THREE.Texture>} Promise that resolves to a THREE.Texture
 */
export const loadTextureFromUrl = (url) => {
	return new Promise((resolve, reject) => {
		// Check cache first
		if (textureCache.has(url)) {
			resolve(textureCache.get(url));
			return;
		}

		// Load the texture
		textureLoader.load(
			url,
			(texture) => {
				texture.colorSpace = SRGBColorSpace;
				textureCache.set(url, texture);
				resolve(texture);
			},
			undefined,
			(error) => {
				console.error(`Error loading texture from ${url}:`, error);
				reject(error);
			}
		);
	});
};

/**
 * Preload a texture by URL in the background
 * @param {string} url - URL of the texture to preload
 */
export const preloadTexture = (url) => {
	if (!url || textureCache.has(url)) return;

	loadTextureFromUrl(url).catch((error) => {
		console.warn(`Preloading texture failed for ${url}:`, error);
	});
};

/**
 * Load an image from a URL as a blob URL that can be used in the Three.js texture loader
 * This is useful for CORS-restricted images or when you need to process an image before using it
 * @param {string} url - URL of the image
 * @returns {Promise<string>} Promise that resolves to a blob URL
 */
export const loadImageAsBlobUrl = async (url) => {
	try {
		const response = await axios.get(url, { responseType: 'blob' });
		return URL.createObjectURL(response.data);
	} catch (error) {
		console.error(`Error fetching image from ${url}:`, error);
		throw error;
	}
};

/**
 * Load a fallback texture for cases when the original texture fails to load
 * @returns {Promise<THREE.Texture>} Promise that resolves to a fallback texture
 */
export const loadFallbackTexture = (type = 'cover') => {
	const fallbackUrl =
		type === 'cover' ? '/textures/front.jpg' : '/textures/back.jpg';

	return loadTextureFromUrl(fallbackUrl);
};
