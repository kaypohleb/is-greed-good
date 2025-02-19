import Image, { StaticImageData } from "next/image";

export default function ImageLinkButton({
  src,
  caption,
  href,
}: {
  src: StaticImageData;
  caption: string;
  href: string;
}) {
  return (
    <a href={href} className="flex flex-col items-center gap-1">
      <Image width={160} src={src} alt={caption} />
      {caption ? <span className="font-arcade p-2 ">{caption}</span> : null}
    </a>
  );
}
