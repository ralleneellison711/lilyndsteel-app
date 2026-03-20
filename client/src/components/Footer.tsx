import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h3 className="font-display text-2xl font-semibold mb-6">Lily & Steel</h3>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            Handcrafted jewelry that bridges the physical and spiritual. 
            Sterling silver bracelets infused with the power of numerology and crystals.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-6">Explore</h4>
          <ul className="space-y-4 text-muted-foreground">
            <li><Link href="/numerology" className="hover:text-primary transition-colors">Numerology Finder</Link></li>
            <li><Link href="/shop" className="hover:text-primary transition-colors">Shop Bracelets</Link></li>
            <li><Link href="/cart" className="hover:text-primary transition-colors">My Cart</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-6">Contact</h4>
          <p className="text-muted-foreground mb-4">support@lilyandsteel.com</p>
          <p className="text-xs text-muted-foreground opacity-60">
            © {new Date().getFullYear()} Lily & Steel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
