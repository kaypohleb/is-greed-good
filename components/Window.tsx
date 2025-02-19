"use client";
import { motion } from "framer-motion";
import FileIcon from "@assets/images/file.png";
import Image, { StaticImageData } from "next/image";
export default function Window({
  title,
  icon = FileIcon,
  enableButton = false,
  color = "white",
  float = false,
  children,
}: {
  title: string;
  icon?: StaticImageData;
  enableButton?: boolean;
  color?: string;
  float?: boolean;
  children: React.ReactNode;
}) {
  const floatCSS = float ? "floatInCircle" : "";
  const containerCSS = "bg-paper text-black window flex flex-col m-4 w-fit " + floatCSS;
  const bgColor = color === "white" ? "bg-white" : `bg-[${color}]`;

  const windowCSS = "window-body min-h-32 min-w-32 overflow-auto p-2 " + bgColor;

  return (
    <motion.div
      className={containerCSS}
      animate={{
        scale: [0, 1],
        opacity: [0, 1],
      }}
    >
      <div className="title-bar h-[30px] bg-silver flex justify-between items-center p-[2px] border-b-2 border-black">
        <div className="ml-2 flex gap-[2px] text-[12px] font-arcade no-select">
          {title ? <Image src={icon} alt="file_icon" height={15} /> : null}
          <span>{title}</span>
        </div>
        <div className="flex gap-1">
          <button
            disabled={!enableButton}
            type="button"
            className="w-4 h-4 flex justify-center items-center opacity-40"
            aria-label="Minimize"
          >
            <span className="w-[8px] h-[2px] bg-black mt-[8px] mr-[2px]"></span>
          </button>
          <button
            disabled={!enableButton}
            type="button"
            className="w-4 h-4 flex justify-center items-center opacity-40"
            aria-label="Maximize"
          >
            <div className="w-[9px] h-[8px] border-t-[2px] border-r-[1px] border-b-[1px] border-l-[1px] border-black border-solid"></div>
          </button>
          <button
            disabled={!enableButton}
            type="button"
            className="w-4 h-4 flex justify-center items-center pl-[1px] mr-[5px] text-[16px] font-ms opacity-40"
            aria-label="Close"
          >
            x
          </button>
        </div>
      </div>
      <div className={windowCSS}>
        {children}
      </div>
    </motion.div>
  );
}
