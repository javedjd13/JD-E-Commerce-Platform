import { ImageOff } from 'lucide-react';

type ProductImagePlaceholderProps = {
  title: string;
  className?: string;
};

export function ProductImagePlaceholder({ title, className = '' }: ProductImagePlaceholderProps) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 p-4 text-center text-slate-400 ${className}`}>
      <ImageOff className="h-8 w-8" />
      <span className="line-clamp-2 text-xs font-semibold text-slate-500">{title}</span>
    </div>
  );
}
