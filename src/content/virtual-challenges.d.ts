declare module "virtual:challenges" {
  import type { CompiledChallenge } from "./schema.ts";
  const challenges: CompiledChallenge[];
  export default challenges;
}

/** Just what list pages need (no setup/check scripts or long texts). */
declare module "virtual:challenge-index" {
  import type { ChallengeSummary } from "./schema.ts";
  const challenges: ChallengeSummary[];
  export default challenges;
}

declare module "virtual:licenses" {
  import type { LicensesData } from "./licenses.ts";
  const data: LicensesData;
  export default data;
}
