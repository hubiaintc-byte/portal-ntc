import Image from "next/image";

export type ProporcaoImagem = "1:1" | "4:3" | "3:2" | "16:9" | "20:23";

export interface ImagemSoberanaProps {
  src: string;
  alt: string;
  proporcao?: ProporcaoImagem;
  prioridade?: boolean;
  sizes?: string;
  className?: string;
}

const ASPECT: Record<ProporcaoImagem, string> = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-video",
  "20:23": "aspect-[20/23]",
};

export function ImagemSoberana({
  src,
  alt,
  proporcao = "16:9",
  prioridade = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
}: ImagemSoberanaProps) {
  const classes = ["relative w-full overflow-hidden bg-pergaminho", ASPECT[proporcao], className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <Image src={src} alt={alt} fill priority={prioridade} sizes={sizes} className="object-cover" />
    </div>
  );
}
