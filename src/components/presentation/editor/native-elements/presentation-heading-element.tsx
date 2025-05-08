"use client";

import React from "react";

import { cn, withRef, withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";
import { PresentationElement } from "./presentation-element";

const headingVariants = cva("relative mb-1", {
  variants: {
    variant: {
      h1: "pb-1 text-5xl font-bold",
      h2: "pb-px text-3xl font-semibold tracking-tight",
      h3: "pb-px text-2xl font-semibold tracking-tight",
      h4: "text-xl font-semibold tracking-tight",
      h5: "text-lg font-semibold tracking-tight",
      h6: "text-base font-semibold tracking-tight",
    },
  },
});

const HeadingElementVariants = withVariants(
  PresentationElement,
  headingVariants,
  ["variant"],
);

export const PresentationHeadingElement = withRef<
  typeof HeadingElementVariants
>(({ children, as = "h1", className, ...props }, ref) => {
  return (
    <HeadingElementVariants
      ref={ref}
      as={as}
      variant={as as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"}
      className={cn("presentation-heading", className)}
      {...props}
    >
      {children}
    </HeadingElementVariants>
  );
});
