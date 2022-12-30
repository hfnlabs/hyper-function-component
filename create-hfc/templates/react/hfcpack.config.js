import react from "@vitejs/plugin-react";
import { defineHfcPackConfig } from 'hfcpack';

export default defineHfcPackConfig({
  entry: "./src/index.js",
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
  ],
});
