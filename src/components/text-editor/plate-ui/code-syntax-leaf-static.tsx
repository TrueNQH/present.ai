import React from "react";

import type { SlateLeafProps } from "@udecode/plate-common";

import { cn } from "@udecode/cn";
import { SlateLeaf } from "@udecode/plate-common";

export function CodeSyntaxLeafStatic({
  children,
  className,
  ...props
}: SlateLeafProps) {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const syntaxClassName = `prism-token token ${props.leaf.tokenType}`;

  return (
    <SlateLeaf className={cn(className, syntaxClassName)} {...props}>
      {children}
    </SlateLeaf>
  );
}
