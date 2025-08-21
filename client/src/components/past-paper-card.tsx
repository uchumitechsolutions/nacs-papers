import { Star, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PastPaper } from "@shared/schema";
import { CartItem } from "@/App";

interface PastPaperCardProps {
  paper: PastPaper;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
}

export default function PastPaperCard({ paper, onAddToCart, onBuyNow }: PastPaperCardProps) {
  const cartItem: CartItem = {
    id: paper.id.toString(),
    title: paper.title,
    grade: paper.grade,
    price: paper.price,
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      Mathematics: "bg-blue-100 text-blue-800",
      English: "bg-green-100 text-green-800",
      Kiswahili: "bg-orange-100 text-orange-800",
      Science: "bg-purple-100 text-purple-800",
      "Social Studies": "bg-yellow-100 text-yellow-800",
      "Creative Arts": "bg-pink-100 text-pink-800",
      "Physical Education": "bg-indigo-100 text-indigo-800",
      "Religious Education": "bg-gray-100 text-gray-800",
    };
    return colors[subject as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6" data-testid={`card-paper-${paper.id}`}>
      <img
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
        alt={`${paper.subject} past paper`}
        className="w-full h-24 sm:h-32 object-cover rounded-lg mb-4"
      />
      
      <div className="flex items-center justify-between mb-2">
        <Badge className="bg-kenyan-green text-white" data-testid={`text-grade-${paper.id}`}>
          {paper.grade}
        </Badge>
        <Badge className={getSubjectColor(paper.subject)} data-testid={`text-subject-${paper.id}`}>
          {paper.subject}
        </Badge>
      </div>
      
      <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2" data-testid={`text-title-${paper.id}`}>
        {paper.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2" data-testid={`text-description-${paper.id}`}>
        {paper.description}
      </p>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl sm:text-2xl font-bold text-kenyan-green" data-testid={`text-price-${paper.id}`}>
          KSh {paper.price}
        </span>
        <div className="flex items-center text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
          <span className="ml-1 text-gray-600 text-sm">4.8</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => onAddToCart(cartItem)}
          variant="default"
          className="flex-1 bg-kenyan-green text-white hover:bg-green-700 text-sm"
          data-testid={`button-add-cart-${paper.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        <Button
          onClick={() => onBuyNow(cartItem)}
          className="bg-warm-orange text-white hover:bg-orange-600 sm:w-auto text-sm"
          data-testid={`button-buy-now-${paper.id}`}
        >
          <Zap className="w-4 h-4 sm:mr-0 mr-2" />
          <span className="sm:hidden">Buy Now</span>
        </Button>
      </div>
    </div>
  );
}
