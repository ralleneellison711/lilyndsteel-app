import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@shared/schema";
import lifestyle1 from "@assets/IMG_4183_1770482901079.jpeg";
import lifestyle2 from "@assets/IMG_4180_1770482901079.jpeg";
import lifestyle3 from "@assets/IMG_4178_1770482901079.jpeg";

const reviewFormSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(3, "Please share a bit more about your experience"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

function StarRating({ rating, interactive, onSelect }: { rating: number; interactive?: boolean; onSelect?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`transition-colors ${interactive ? "cursor-pointer" : "cursor-default"}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onSelect?.(star)}
          data-testid={`star-${star}`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hovered || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <h3 className="font-semibold text-foreground" data-testid={`text-reviewer-name-${review.id}`}>{review.name}</h3>
          <StarRating rating={review.rating} />
        </div>
        <p className="text-muted-foreground leading-relaxed" data-testid={`text-review-comment-${review.id}`}>
          {review.comment}
        </p>
        {review.createdAt && (
          <p className="text-xs text-muted-foreground/60 mt-3">
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </Card>
    </motion.div>
  );
}

export default function Reviews() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      name: "",
      rating: 0,
      comment: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your review has been submitted and will appear once approved.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Oops",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    submitMutation.mutate(data);
  };

  const lifestyleImages = [lifestyle1, lifestyle2, lifestyle3];

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            What Our Community Says
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from real people who wear their bracelets with intention.
          </p>
        </motion.div>

        {/* Lifestyle photos strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-16 max-w-3xl mx-auto"
        >
          {lifestyleImages.map((img, i) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden">
              <img
                src={img}
                alt={`Customer photo ${i + 1}`}
                className="w-full h-full object-cover"
                data-testid={`img-review-lifestyle-${i + 1}`}
              />
            </div>
          ))}
        </motion.div>

        {/* Reviews list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {reviews.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground mb-16 py-12">
            <p className="text-lg">Be the first to share your experience!</p>
          </div>
        )}

        {/* Submit review form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <Card className="p-8">
            <h2 className="font-display text-2xl mb-2 text-center">Share Your Experience</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              We'd love to hear how your bracelet makes you feel.
            </p>

            {submitted ? (
              <div className="text-center py-8">
                <p className="text-foreground font-medium mb-2">Thank you for your review!</p>
                <p className="text-muted-foreground text-sm">It will appear on this page once approved.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSubmitted(false)}
                  data-testid="button-write-another"
                >
                  Write Another
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name or initials" {...field} data-testid="input-review-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <StarRating
                            rating={field.value}
                            interactive
                            onSelect={(r) => field.onChange(r)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your experience with your bracelet..."
                            className="resize-none"
                            rows={4}
                            {...field}
                            data-testid="input-review-comment"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    {submitMutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
