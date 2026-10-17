declare module "virtual:challenges" {
  import type { CompiledChallenge } from "./schema.ts";
  const challenges: CompiledChallenge[];
  export default challenges;
}
