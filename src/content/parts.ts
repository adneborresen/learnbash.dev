// The parts of the course, in order. A challenge's `module` names its part;
// the challenges of a part are numbered together (see docs/curriculum.md).
export const PARTS = [
  {
    id: "find-your-way",
    title: "Find your way and work with files",
    summary: "Move around, read files and safely create, copy, rename and delete them.",
  },
  {
    id: "incident",
    title: "Investigate an incident",
    summary: "Search logs, count and rank what you find, save a report and run a fix.",
  },
] as const;

export type PartId = (typeof PARTS)[number]["id"];
