import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Understanding Your Life Path Number",
    excerpt: "Your Life Path Number reveals the core essence of who you are. Discover how this ancient numerology practice can illuminate your journey of self-discovery.",
    date: "January 15, 2026",
    category: "Numerology",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "2",
    title: "The Healing Energy of Crystals",
    excerpt: "Each crystal carries its own unique vibration and energy. Learn how different crystals can support your emotional wellbeing and personal growth.",
    date: "January 10, 2026",
    category: "Crystals",
    imageUrl: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "3",
    title: "The Four Motion States: Finding Your Flow",
    excerpt: "Contraction, Stillness, Harmonizing, Expansion — understanding these motion states helps you recognize where you are in your emotional journey.",
    date: "January 5, 2026",
    category: "Self-Discovery",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "4",
    title: "Caring for Your Sterling Silver Jewelry",
    excerpt: "Keep your Lily & Steel pieces looking beautiful for years to come with these simple care tips and cleaning techniques.",
    date: "December 28, 2025",
    category: "Jewelry Care",
    imageUrl: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "5",
    title: "Master Numbers: 11, 22, and 33",
    excerpt: "Master Numbers carry intensified energy and greater potential. Explore what it means if your Life Path reveals one of these powerful numbers.",
    date: "December 20, 2025",
    category: "Numerology",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "6",
    title: "The Story Behind Lily & Steel",
    excerpt: "Every brand has a beginning. Discover the inspiration behind our consciousness jewelry and the meaning woven into every piece we create.",
    date: "December 15, 2025",
    category: "Our Story",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-medium text-primary mb-4">
            The Journal
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights on numerology, crystal energy, and the journey back to yourself
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full hover-elevate cursor-pointer group" data-testid={`blog-post-${post.id}`}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs font-medium text-accent uppercase tracking-wider">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </div>
                  </div>
                  <h2 className="font-display text-xl font-medium text-primary mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="bg-secondary/50 rounded-md p-10 max-w-2xl mx-auto">
            <h3 className="font-display text-2xl font-medium text-primary mb-4">
              Begin Your Journey
            </h3>
            <p className="text-muted-foreground mb-6">
              Discover your Life Path Number and find the bracelet that reflects your inner essence.
            </p>
            <Link
              href="/numerology"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
              data-testid="link-numerology-cta"
            >
              Calculate Your Number <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
