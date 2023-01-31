import { ResolvedConfig } from "./src/config";

export {};
declare global {
  interface HfcManifest {
    name: string;
    version: string;
    banner: string;
    homepage: string;
    description: string;
    license: string;
    repository: string;
    deps: ResolvedConfig["deps"];
    sharedNpmImportMap: ResolvedConfig["sharedNpmImportMap"];
  }
}
