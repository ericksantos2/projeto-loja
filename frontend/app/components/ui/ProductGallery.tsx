import { cn } from "~/lib/cn";

type ProductGalleryProps = {
  images: string[];
  selectedImage: string;
  onSelect: (image: string) => void;
  productName: string;
};

export default function ProductGallery({
  images,
  selectedImage,
  onSelect,
  productName,
}: ProductGalleryProps) {
  return (
    <section aria-label={`Imagens de ${productName}`}>
      <div className="aspect-square overflow-hidden rounded-2xl bg-white sm:rounded-3xl">
        <img
          src={selectedImage}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => onSelect(image)}
              aria-label={`Exibir imagem ${index + 1} de ${productName}`}
              aria-pressed={selectedImage === image}
              className={cn(
                "h-18 w-18 cursor-pointer overflow-hidden rounded-xl border-2",
                selectedImage === image
                  ? "border-amber-400"
                  : "border-transparent",
              )}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
