// The challenge format: front matter of challenges/NN-slug/challenge.md and
// the compiled form the website receives. See docs/authoring.md.
import { z } from "zod";
import { PARTS } from "./parts.ts";

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use lowercase letters, digits and dashes");

export const challengeMetaSchema = z
  .object({
    id: slug,
    title: z.string().min(3).max(60),
    /** The part of the course (an id from parts.ts). */
    module: z.enum(PARTS.map((p) => p.id) as [string, ...string[]]),
    /** The single new idea this challenge teaches (shown to learners). */
    concept: z.string().min(3).max(80),
    /** Commands/syntax first introduced here. Later challenges may reuse them. */
    introduces: z.array(z.string().min(1)).max(6),
    /** Commands/syntax introduced by an earlier challenge that this one needs. */
    reuses: z.array(z.string().min(1)).default([]),
    /** "state": the checker inspects the VM. "answer": the learner types an answer. */
    check: z.enum(["state", "answer"]),
    /** Label of the answer box (answer challenges only). */
    answer_label: z.string().min(3).optional(),
    /** The correct answer, used by the tests (answer challenges only). */
    expected_answer: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((meta, ctx) => {
    const isAnswer = meta.check === "answer";
    for (const key of ["answer_label", "expected_answer"] as const) {
      if (isAnswer && meta[key] === undefined) {
        ctx.addIssue({ code: "custom", path: [key], message: `required when check is "answer"` });
      }
      if (!isAnswer && meta[key] !== undefined) {
        ctx.addIssue({ code: "custom", path: [key], message: `only allowed when check is "answer"` });
      }
    }
  });

export type ChallengeMeta = z.infer<typeof challengeMetaSchema>;

/** Body sections every challenge.md must have, in this order. */
export const SECTIONS = ["Story", "Goal", "Hint 1", "Hint 2", "Hint 3", "Explanation"] as const;

/** A challenge in lists (the landing page). */
export interface ChallengeSummary {
  id: string;
  order: number;
  title: string;
  module: string;
  concept: string;
}

/** What the website gets for each challenge (no solutions or test data). */
export interface CompiledChallenge {
  id: string;
  /** Position in the course, from the NN- folder prefix. */
  order: number;
  title: string;
  module: string;
  concept: string;
  introduces: string[];
  reuses: string[];
  check: "state" | "answer";
  answerLabel?: string;
  storyHtml: string;
  goalHtml: string;
  hintsHtml: string[];
  explanationHtml: string;
  setup: string;
  checkScript: string;
}
