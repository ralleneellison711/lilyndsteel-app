import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Trash2, ArrowRight, Loader2, Minus, Plus, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
    },
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    
    try {
      const response = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        items: items.map(item => ({
          name: item.name,
          description: item.description || '',
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || undefined,
        })),
        customerEmail: data.customerEmail,
        customerName: data.customerName,
      });
      
      const result = await response.json();
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Unable to process checkout. Please try again.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center bg-muted/30">
        <div className="text-center max-w-md">
          <h2 className="font-display text-3xl mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any crystals or bracelets yet.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Cart Items */}
        <div className="space-y-6">
          <h1 className="font-display text-3xl mb-8">Shopping Cart</h1>
          
          {items.map((item) => {
            const cartItemId = `${item.id}-${item.selectedOption || 'none'}`;
            return (
              <motion.div 
                key={cartItemId}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-background p-4 rounded-xl shadow-sm border border-border flex gap-4 items-center"
              >
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  {item.selectedOption && (
                    <p className="text-xs font-semibold text-accent mb-1 uppercase tracking-wider">
                      Option: {item.selectedOption}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm">${(item.price / 100).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1 border border-border">
                    <button 
                      onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                      className="p-1 hover:text-accent disabled:opacity-30"
                      disabled={item.quantity <= 1}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                      className="p-1 hover:text-accent"
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(cartItemId)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    data-testid="button-remove-item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Checkout Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-background p-8 rounded-2xl shadow-xl border border-border">
            <h2 className="font-display text-2xl mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-dashed border-border pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  {...form.register("customerName")}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Jane Doe"
                  data-testid="input-customer-name"
                />
                {form.formState.errors.customerName && (
                  <p className="text-destructive text-sm">{form.formState.errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  {...form.register("customerEmail")}
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="jane@example.com"
                  data-testid="input-customer-email"
                />
                {form.formState.errors.customerEmail && (
                  <p className="text-destructive text-sm">{form.formState.errors.customerEmail.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isCheckingOut}
                className="w-full py-4 mt-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="button-checkout"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Redirecting to Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Proceed to Payment
                  </>
                )}
              </button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                You'll be redirected to Stripe for secure payment processing.
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
