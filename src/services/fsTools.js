import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// =
const { readJSON, writeJSON, writeFile } = fs;
// = Path
export const mediaFolderPath = join(process.cwd(), "/src/data/");
const mediaJson = join(mediaFolderPath, "/mediaLib.json");
const reviewsJson = join(mediaFolderPath, "/reviewsLib.json");
// =
export const getMedia = () => readJSON(mediaJson);
export const writeMedia = (content) => writeJSON(mediaJson, content);
// =
export const getReviews = () => readJSON(reviewsJson);
export const writeReviews = (content) => writeJSON(reviewsJson, content);
