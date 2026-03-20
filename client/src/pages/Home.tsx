import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import heroBracelet from "@assets/FE236E3C-F968-43AF-AB23-773753757208_1769296647497.png";
import lifestyle1 from "@assets/IMG_4183_1770482901079.jpeg";
import lifestyle2 from "@assets/IMG_4180_1770482901079.jpeg";
import lifestyle3 from "@assets/IMG_4178_1770482901079.jpeg";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Abstract crystal background */}
        <div className="absolute inset-0 z-0 bg-black">
          <img
            src={heroBracelet}
            alt="Sterling silver bracelet with crystals"
            className="w-full h-full object-contain opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-white mb-6 drop-shadow-md"
          >
            Lily & Steel
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-white/90 font-light tracking-wide mb-10 max-w-2xl mx-auto drop-shadow-sm space-y-4"
          >
            <p>Lily & Steel is a consciousness jewelry brand created to honor both softness and survival.</p>
            <p>We design symbolic bracelets that reflect emotional movement, self-awareness, and the return to inner strength.</p>
            <p className="italic">Every piece is an invitation to remember ME.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/numerology" 
              className="px-8 py-4 bg-background text-primary font-semibold rounded-full hover:bg-muted transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Find Your Crystal
            </Link>
            <Link 
              href="/shop" 
              className="px-8 py-4 bg-black/30 backdrop-blur-md text-white border border-white/30 font-semibold rounded-full hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Shop Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Where ME Begins Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl mb-8">Where ME Begins</h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Lily & Steel is built on the understanding that before personality, before identity, and before healing — there is ME.
            </p>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Your Life Path offers insight into how ME moves through experience.
              <br />
              Your current motion reflects what ME is carrying today.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              We pair these insights with symbolic crystals and refined sterling silver designs to create bracelets that support awareness, grounding, and emotional wholeness.
            </p>
            <p className="text-foreground text-lg italic mb-10">
              Each piece is an invitation to return to yourself.
            </p>
            <Link href="/numerology" className="inline-block border-b border-primary pb-1 text-primary hover:text-accent hover:border-accent transition-colors">
              Discover your Life Path →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Lifestyle Gallery */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl text-center mb-4"
          >
            Worn with Intention
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground text-lg text-center mb-12 max-w-xl mx-auto"
          >
            Sterling silver meets crystal energy — designed to move with you.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[lifestyle1, lifestyle2, lifestyle3].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="aspect-[3/4] rounded-md overflow-hidden"
              >
                <img
                  src={img}
                  alt={`Lily & Steel bracelet lifestyle photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  data-testid={`img-lifestyle-${i + 1}`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured CTA */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl mb-6">Sterling Silver Collection</h2>
          <p className="text-muted-foreground text-lg mb-10">
            Timeless designs crafted to last a lifetime. Each bracelet features our signature Lily charm.
          </p>
          <Link 
            href="/shop" 
            className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            View Bracelets
          </Link>
        </div>
      </section>
    </div>
  );
}
