declare module "react-scrollama" {
  import * as React from "react";

  export type ScrollDirection = "up" | "down";

  export interface StepProps<T = unknown> {
    data: T;
    children: React.ReactNode;
  }

  export interface ScrollamaProps<T = unknown> {
    onStepEnter?: (args: {
      data: T;
      direction: ScrollDirection;
      entry: IntersectionObserverEntry;
    }) => void;
    onStepExit?: (args: {
      data: T;
      direction: ScrollDirection;
      entry: IntersectionObserverEntry;
    }) => void;
    offset?: number;
    children: React.ReactNode;
  }

  export const Scrollama: <T = unknown>(props: ScrollamaProps<T>) => JSX.Element;
  export const Step: <T = unknown>(props: StepProps<T>) => JSX.Element;
}