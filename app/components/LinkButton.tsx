"use client";

import { AnchorHTMLAttributes } from "react";

function LinkButton(anchorProps: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const clx =
    (anchorProps.className || "") +
    " " +
    "font-arcade py-1 px-2 text-black shadow-md border-2 text-[14px] flex justify-center items-center rounded-[3px] windows-button";
  return (
    <a
      href={anchorProps.href || "/"}
      className={clx}
      {...anchorProps}
    />
  );
}

export default LinkButton;
