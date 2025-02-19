"use client";
import { ButtonHTMLAttributes } from "react";

function FillButton(buttonProps: ButtonHTMLAttributes<HTMLButtonElement>) {
  const clx =
    (buttonProps.className || "") +
    " " +
    "font-arcade py-2 px-2 text-black border-2 text-[14px] flex justify-center items-center windows-button w-full";
  return (
    <button
      type="button"
      className={clx}
      
      onClick={buttonProps.onClick}
    >
      {buttonProps.children}
    </button>
  );
}

export default FillButton;
