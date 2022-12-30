import preact from "@preact/preset-vite";
import { defineHfcPackConfig } from 'hfcpack';

export default defineHfcPackConfig({
  entry: "./src/index.ts",
  plugins: [preact()],
});
