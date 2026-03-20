import { type Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const isBracelet = product.category === 'bracelet';

  // Parse imageUrl - stored as JSON array string
  let images: string[] = [];
  if (typeof product.imageUrl === 'string') {
    try {
      images = JSON.parse(product.imageUrl);
    } catch {
      images = [product.imageUrl];
    }
  } else if (Array.isArray(product.imageUrl)) {
    images = product.imageUrl;
  }
  
  if (images.length === 0) {
    images = ["https://via.placeholder.com/400"];
  }

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    if (isBracelet && !selectedOption) return;
    addToCart(product, selectedOption || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-background rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border overflow-hidden flex flex-col"
    >
      <div className="aspect-[4/5] bg-secondary/30 relative overflow-hidden">
        {/* Image carousel */}
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Image navigation buttons */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
          </>
        )}
      </div>
      
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-display text-base md:text-lg font-semibold text-primary mb-1 break-words leading-tight">{product.name}</h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
          
          {isBracelet && (
            <div className="mb-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Customization</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'number', label: 'Add Number Charm' },
                  { id: 'crystal', label: 'Add Crystal Charm' },
                  { id: 'both', label: 'Add Both Charms' },
                  { id: 'none', label: 'Bracelet Only' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.label)}
                    className={`text-xs py-2 px-3 rounded-lg border transition-all flex items-center justify-between ${
                      selectedOption === opt.label 
                        ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {opt.label}
                    {selectedOption === opt.label && <Check className="w-3 h-3 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
          <span className="font-body font-medium text-xl text-primary">
            ${(product.price / 100).toFixed(2)}
          </span>
          <Button 
            onClick={handleAddToCart}
            disabled={isBracelet && !selectedOption}
            size="sm"
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isBracelet ? 'Add to Cart' : `Add ${product.category === 'crystal' ? 'Crystal' : 'Charm'} to Cart`}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
