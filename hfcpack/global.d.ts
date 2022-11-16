import { ResolvedConfig } from "./src/config";

export {};
declare global {
  interface HfcManifest {
    name: string;
    version: string;
    banner: string;
    homepage: string;
    description: string;
    keywords: string[];
    license: string;
    repository: string;
    deps: ResolvedConfig["deps"];
    sharedNpmImportMap: ResolvedConfig["sharedNpmImportMap"];
  }
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
