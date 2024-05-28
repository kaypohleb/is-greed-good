"use client";
import FileIcon from "@assets/images/file.png";
import Image, { StaticImageData } from "next/image";
import { useRef } from "react";
export default function Window({
  title,
  icon = FileIcon,
  children,
}: {
  title: string;
  icon?: StaticImageData;
  children: React.ReactNode;
}) {
  const nodeRef = useRef(null);
  return (
    <div className="bg-paper text-black window">
      <div className="title-bar h-[30px] bg-silver flex justify-between items-center p-[2px] border-b-2 border-black">
        <div className="ml-2 flex gap-[2px] text-[16px] font-arcade no-select">
          <Image src={icon} alt="file_icon" height={15} />
          <span>{title}</span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className="w-4 h-4 flex justify-center items-center"
            aria-label="Minimize"
          >
            <span className="w-[8px] h-[2px] bg-black mt-[8px] mr-[2px]"></span>
          </button>
          <button
            type="button"
            className="w-4 h-4 flex justify-center items-center"
            aria-label="Maximize"
          >
            <div className="w-[9px] h-[8px] border-t-[2px] border-r-[1px] border-b-[1px] border-l-[1px] border-black border-solid"></div>
          </button>
          <button
            type="button"
            className="w-4 h-4 flex justify-center items-center pl-[1px] mr-[5px] text-[16px] font-ms"
            aria-label="Close"
          >
            x
          </button>
        </div>
      </div>
      <div className="window-body min-h-32 min-w-32 bg-white crt p-2">
        {children}
      </div>
    </div>
  );
}
