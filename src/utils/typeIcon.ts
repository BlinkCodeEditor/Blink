import { 
  faCss3Alt, 
  faDartLang, 
  faGolang, 
  faHtml5, 
  faJava, 
  faPhp, 
  faPython, 
  faReact, 
  faRust, 
  faSass, 
  faSquareJs, 
  faSwift, 
  faTypescript 
} from "@fortawesome/free-brands-svg-icons";

import { 
  faFile,
  faImage 
} from "@fortawesome/free-regular-svg-icons";

import { 
  faFolder
} from "@fortawesome/free-solid-svg-icons";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Optional: define a type for the enhanced structure
export type FileType = 
  | "folder"
  | "file"
  | "html"
  | "css"
  | "js"
  | "ts"
  | "python"
  | "dart"
  | "golang"
  | "java"
  | "php"
  | "rust"
  | "sass"
  | "scss"
  | "swift"
  | "jsx"
  | "tsx"
  | "png"
  | "jpg"
  | "jpeg"
  | "gif"
  | "svg"
  | "ico";

// Enhanced structure: icon + color (as Tailwind class, CSS var, or hex)
export const typeIconMap: Record<FileType, { icon: IconDefinition; color: string }> = {
  folder: { icon: faFolder, color: "#7c7c7cff" },          // yellow/orange - classic folder
  file:   { icon: faFile,   color: "#90A4AE" },          // grey - generic file

  html:   { icon: faHtml5,  color: "#E44D26" },          // HTML orange
  css:    { icon: faCss3Alt,color: "#1572B6" },          // CSS blue
  js:     { icon: faSquareJs,color: "#F7DF1E" },         // JavaScript yellow
  ts:     { icon: faTypescript, color: "#3178C6" },      // TypeScript blue

  python: { icon: faPython, color: "#3776AB" },          // Python blue
  dart:   { icon: faDartLang,color: "#00B4AB" },         // Dart cyan/turquoise
  golang: { icon: faGolang, color: "#00ADD8" },          // Go cyan/blue
  java:   { icon: faJava,   color: "#F89820" },          // Java orange-reddish
  php:    { icon: faPhp,    color: "#777BB4" },          // PHP purple
  rust:   { icon: faRust,   color: "#DEA584" },          // Rust warm grey/orange
  sass:   { icon: faSass,   color: "#CC6699" },          // Sass pink/magenta
  scss:   { icon: faSass,   color: "#CC6699" },          // same as sass
  swift:  { icon: faSwift,  color: "#F05138" },           // Swift orange/red
  jsx: { icon: faReact, color: "#61DAFB" },
  tsx: { icon: faReact, color: "#61DAFB" },
  png: { icon: faImage, color: "#e082f5ff" },
  jpg: { icon: faImage, color: "#e082f5ff" },
  jpeg: { icon: faImage, color: "#e082f5ff" },
  gif: { icon: faImage, color: "#e082f5ff" },
  svg: { icon: faImage, color: "#e082f5ff" },
  ico: { icon: faImage, color: "#e082f5ff" },
};