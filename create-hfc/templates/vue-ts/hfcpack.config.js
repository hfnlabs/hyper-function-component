import vue from "@vitejs/plugin-vue";
import { defineHfcPackConfig } from 'hfcpack';

export default defineHfcPackConfig({
  entry: "./src/index.ts",
  plugins: [vue()],
});
