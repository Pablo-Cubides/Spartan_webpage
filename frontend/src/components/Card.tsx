import Image from 'next/image';

interface CardProps {
  imageUrl: string;
  title: string;
  description?: string;
  aspectRatio?: string;
}

export function Card({ imageUrl, title, description, aspectRatio = 'aspect-[3/4]' }: CardProps) {
  return (
    <div className="flex flex-col gap-3 pb-3">
      <div className={`relative w-full ${aspectRatio} rounded-lg overflow-hidden`}>
        <Image src={imageUrl} alt={title} layout="fill" objectFit="cover" />
      </div>
      <p className="text-base font-medium leading-normal text-white">{title}</p>
      {description && <p className="text-[#ababab] text-sm font-normal leading-normal">{description}</p>}
    </div>
  );
}
