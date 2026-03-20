import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Loader2, Info, Plus, Heart, Shield, Eye, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { BraceletStyle, Crystal } from "@shared/schema";

export default function Shop() {
  const { data: braceletStyles, isLoading: loadingStyles } = useQuery<BraceletStyle[]>({
    queryKey: ['/api/bracelet-styles'],
  });

  const { data: crystals, isLoading: loadingCrystals } = useQuery<Crystal[]>({
    queryKey: ['/api/crystals'],
  });

  const { addToCart } = useCart();

  const motionIcons: Record<string, any> = {
    contraction: Shield,
    stillness: Eye,
    harmonizing: Heart,
    expansion: Sun,
  };

  const motionColors: Record<string, string> = {
    contraction: 'from-stone-600 to-stone-800',
    stillness: 'from-slate-500 to-slate-700',
    harmonizing: 'from-rose-400 to-rose-600',
    expansion: 'from-amber-400 to-amber-600',
  };

  const handleAddBracelet = (style: BraceletStyle) => {
    addToCart({
      id: 0,
      name: style.displayName,
      description: style.shortDesc,
      price: style.price,
      imageUrl: style.imageUrl || '',
      category: 'bracelet',
      numerologyNumber: null,
    });
  };

  const handleAddCrystal = (crystal: Crystal) => {
    addToCart({
      id: 0,
      name: crystal.displayName,
      description: crystal.shortDesc,
      price: crystal.price,
      imageUrl: crystal.imageUrl || '',
      category: 'crystal',
      numerologyNumber: null,
    });
  };

  const isLoading = loadingStyles || loadingCrystals;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group crystals by motion
  const crystalsByMotion: Record<string, Crystal[]> = {
    contraction: crystals?.filter(c => c.motions?.includes('contraction')) || [],
    stillness: crystals?.filter(c => c.motions?.includes('stillness')) || [],
    harmonizing: crystals?.filter(c => c.motions?.includes('harmonizing')) || [],
    expansion: crystals?.filter(c => c.motions?.includes('expansion')) || [],
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-primary">The Collection</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Handcrafted sterling silver bracelets and natural crystal charms, 
            designed to support your journey of self-discovery.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 border border-accent/10 rounded-full">
            <Info className="w-4 h-4 text-accent" />
            <p className="text-sm text-muted-foreground">
              Natural stone variations: sizes, shapes, and bails may vary.
            </p>
          </div>
        </div>

        {/* Bracelet Styles Section */}
        <section className="mb-20">
          <h2 className="font-display text-2xl md:text-3xl mb-2 text-primary">Bracelet Styles</h2>
          <p className="text-muted-foreground mb-8">
            Choose the bracelet that matches your current motion state.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {braceletStyles?.slice().sort((a, b) => {
              const order = ['the root', 'the witness', 'the integration', 'the bloom'];
              return order.indexOf(a.displayName.toLowerCase()) - order.indexOf(b.displayName.toLowerCase());
            }).map((style, index) => {
              const Icon = motionIcons[style.motion] || Heart;
              
              return (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background rounded-2xl border border-border overflow-hidden group"
                >
                  <div className={`h-64 ${style.imageUrl ? 'bg-black' : `bg-gradient-to-br ${motionColors[style.motion] || 'from-primary to-primary/80'}`} flex items-center justify-center overflow-hidden`}>
                    {style.imageUrl ? (
                      <img 
                        src={style.imageUrl} 
                        alt={style.displayName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Icon className="w-12 h-12 text-white/80" />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent capitalize">
                        {style.motion}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-primary mb-1">{style.displayName}</h3>
                    <p className="text-sm text-accent mb-2">{style.symbol} Symbol</p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{style.shortDesc}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-xl font-display text-primary">${(style.price / 100).toFixed(2)}</span>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddBracelet(style)}
                        data-testid={`button-add-bracelet-${style.id}`}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Crystals by Motion Section */}
        <section>
          <h2 className="font-display text-2xl md:text-3xl mb-2 text-primary">Crystal Charms</h2>
          <p className="text-muted-foreground mb-8">
            Each crystal is aligned with a motion state to support your current season.
          </p>

          {Object.entries(crystalsByMotion).map(([motionKey, motionCrystals]) => {
            if (motionCrystals.length === 0) return null;
            const Icon = motionIcons[motionKey] || Heart;
            
            return (
              <div key={motionKey} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${motionColors[motionKey] || 'from-primary to-primary/80'}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display text-xl text-primary capitalize">{motionKey}</h3>
                  <span className="text-sm text-muted-foreground">
                    {motionCrystals.length} crystals
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {motionCrystals.map((crystal, index) => (
                    <motion.div
                      key={crystal.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-background p-4 rounded-xl border border-border hover-elevate"
                    >
                      {crystal.imageUrl && (
                        <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 bg-muted/30">
                          <img
                            src={crystal.imageUrl}
                            alt={crystal.displayName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            data-testid={`img-crystal-${crystal.id}`}
                          />
                        </div>
                      )}
                      <h4 className="font-display text-sm text-primary mb-1 line-clamp-1">{crystal.displayName}</h4>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{crystal.shortDesc}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {crystal.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm font-display text-primary">${(crystal.price / 100).toFixed(2)}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleAddCrystal(crystal)}
                          data-testid={`button-add-crystal-${crystal.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA to Numerology */}
        <section className="mt-20 text-center">
          <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 p-12 rounded-3xl border border-border">
            <h2 className="font-display text-3xl text-primary mb-4">Not Sure Where to Start?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Discover your Life Path Number and let us guide you to the perfect bracelet and crystal combination.
            </p>
            <Button size="lg" asChild data-testid="link-discover-blueprint">
              <Link href="/numerology">Discover Your Blueprint</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
