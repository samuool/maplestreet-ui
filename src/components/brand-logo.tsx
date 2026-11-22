import Image from "next/image";
import stirge from "../../assets/stirge.png";

export default function BrandLogo() {
  return (
    <span
      className="inline-flex flex-col items-center gap-0 align-middle text-secondary"
      role="img"
      aria-label="Maplestreet"
    >
      <Image
        className="size-6 shrink-0 translate-y-[0.85rem] object-contain"
        src={stirge}
        alt=""
        width={36}
        height={36}
      />
      <span className="font-display text-[clamp(1.05rem,2vw,1.35rem)] leading-[1.15] font-bold tracking-[0.025em]">
        <span>maple</span>
        <span className="text-tertiary">street</span>
      </span>
    </span>
  );
}
