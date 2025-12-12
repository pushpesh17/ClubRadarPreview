import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Calendar, User } from "lucide-react";
import Link from "next/link";

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "Top 10 Nightclubs in Mumbai You Must Visit",
      excerpt: "Discover the hottest clubs in Mumbai with the best music, ambience, and crowd.",
      author: "ClubRadar Team",
      date: "2024-01-10",
      category: "City Guide",
      image: "/api/placeholder/400/250",
    },
    {
      id: 2,
      title: "How to Choose the Perfect Club for Your Night Out",
      excerpt: "A comprehensive guide to finding the right venue based on music, crowd, and vibe.",
      author: "ClubRadar Team",
      date: "2024-01-08",
      category: "Tips",
      image: "/api/placeholder/400/250",
    },
    {
      id: 3,
      title: "DJ Spotlight: Interview with Mumbai's Hottest DJ",
      excerpt: "Exclusive interview with one of Mumbai's most popular DJs about the nightlife scene.",
      author: "ClubRadar Team",
      date: "2024-01-05",
      category: "Interviews",
      image: "/api/placeholder/400/250",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">ClubRadar Blog</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Stay updated with the latest nightlife trends, club reviews, and party tips
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="aspect-video w-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <Link
                  href={`/blog/${post.id}`}
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Read more →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

