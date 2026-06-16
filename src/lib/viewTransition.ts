import * as React from "react";

/**
 * React's `<ViewTransition>` ships in the React build Next.js vendors (and is
 * enabled by `experimental.viewTransition` in next.config.ts), but it is not
 * yet declared in `@types/react`. We resolve the real component off the React
 * namespace and give it a precise prop type here, so every scene can import a
 * fully-typed `ViewTransition` without scattering casts across the codebase.
 *
 * `enter` / `exit` accept either a single class name or a map keyed by the
 * `transitionTypes` carried on the originating <Link> / router.push().
 */
export type TransitionClass = string | Record<string, string>;

export interface ViewTransitionProps {
  children: React.ReactNode;
  name?: string;
  enter?: TransitionClass;
  exit?: TransitionClass;
  update?: TransitionClass;
  share?: TransitionClass;
  default?: TransitionClass;
}

export const ViewTransition = (
  React as unknown as {
    ViewTransition: React.ComponentType<ViewTransitionProps>;
  }
).ViewTransition;
