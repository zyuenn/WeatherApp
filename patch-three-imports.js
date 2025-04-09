// patch-three-imports.js
const fs = require("fs");
const path = require("path");

const PATCHES = [
  {
    file: "./node_modules/three/examples/jsm/controls/OrbitControls.js",
    from: `} from 'three';`,
    to: `} from '/node_modules/three/build/three.module.js';`,
  },
  {
    file: "./node_modules/three/examples/jsm/loaders/OBJLoader.js",
    from: `} from 'three';`,
    to: `} from '/node_modules/three/build/three.module.js';`,
  },
  {
    file: "./node_modules/three/examples/jsm/loaders/MTLLoader.js",
    from: `} from 'three';`,
    to: `} from '/node_modules/three/build/three.module.js';`,
  },
];

for (const { file, from, to } of PATCHES) {
  const fullPath = path.resolve(file);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${file}`);
    continue;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  if (!content.includes(from)) {
    console.log(`Already patched: ${file}`);
    continue;
  }

  const updated = content.replace(from, to);
  fs.writeFileSync(fullPath, updated, "utf-8");
  console.log(`Patched ${file}`);
}
