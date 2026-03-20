import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-muted/30 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-background p-8 rounded-2xl shadow-xl border border-border text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="font-display text-3xl mb-4 text-primary">Order Confirmed!</h1>
        
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. You'll receive a confirmation email shortly with your order details.
        </p>
        
        <div className="bg-muted/50 p-4 rounded-xl mb-8">
          <p className="text-sm text-muted-foreground">
            Your handcrafted jewelry will be lovingly prepared and shipped within 3-5 business days.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full" data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button className="w-full" data-testid="button-continue-shopping">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
