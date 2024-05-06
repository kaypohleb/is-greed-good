"use client";

import { AnchorHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ClassValue } from "clsx";

const baseStyles: ClassValue = {
  solid:
    "inline-flex justify-center rounded-lg py-2 px-3 text-sm font-semibold outline-2 outline-offset-2 transition-colors",
  outline:
    "inline-flex justify-center rounded-lg border py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] text-sm outline-2 outline-offset-2 transition-colors",
};

const variantStyles: ClassValue = {
  solid: {
    cyan: "relative overflow-hidden bg-cyan-500 text-white before:absolute before:inset-0 active:before:bg-transparent hover:before:bg-white/10 active:bg-cyan-600 active:text-white/80 before:transition-colors",
    white:
      "bg-white text-cyan-900 hover:bg-white/90 active:bg-white/90 active:text-cyan-900/70",
    gray: "bg-gray-800 text-white hover:bg-gray-900 active:bg-gray-800 active:text-white/80",
  },
  outline: {
    gray: "border-gray-300 text-gray-700 hover:border-gray-400 active:bg-gray-100 active:text-gray-700/80",
  },
};

interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant: "solid" | "outline";
  color: "cyan" | "white" | "gray";
}

const defaultButtonProps: AnchorButtonProps = {
  variant: "solid",
  color: "gray",
};

const LinkButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  function LinkButton(anchorProps = defaultButtonProps, ref) {
    const className = clsx(
      baseStyles[anchorProps.variant],
      variantStyles[anchorProps.variant][anchorProps.color],
      anchorProps.className
    );

    return (
      <Link
        ref={ref}
        href={anchorProps.href || "/"}
        className={className}
        {...anchorProps}
      />
    );
  }
);

export default LinkButton;
