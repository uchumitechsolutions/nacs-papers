import { Button } from "@/components/ui/button";
import { Search, Play, Smartphone, Mail, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PastPaper } from "@shared/schema";
import { CartItem } from "@/App";
import PastPaperCard from "@/components/past-paper-card";

interface HomeProps {
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
}

export default function Home({ onAddToCart, onBuyNow }: HomeProps) {
  const { data: papers = [] } = useQuery<PastPaper[]>({
    queryKey: ["/api/past-papers"],
  });

  const featuredPapers = papers.slice(0, 3);

  const handleBuyNow = (item: CartItem) => {
    onBuyNow(item);
  };

  return (
    <div data-testid="page-home">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-kenyan-green to-green-600 text-white py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6" data-testid="text-hero-title">
                Master CBC Curriculum with Past Papers
              </h1>
              <p className="text-lg sm:text-xl mb-6 lg:mb-8 text-green-100" data-testid="text-hero-description">
                Access comprehensive past papers for all CBC levels. Pay securely with M-Pesa or Visa and get instant email delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Link href="/browse">
                  <Button 
                    size="lg" 
                    className="bg-warm-orange hover:bg-orange-600 text-white"
                    data-testid="button-browse-papers"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Browse Past Papers
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-kenyan-green"
                  data-testid="button-learn-more"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://www.earlybirdschools.co.ke/wp-content/uploads/2021/12/Earlybird-CBC.jpg"
                alt="Students studying CBC curriculum"
                className="rounded-xl shadow-2xl w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-features-title">
              Why Choose Nacs Consortium?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-features-description">
              We provide the most comprehensive and affordable CBC past papers in Kenya
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl" data-testid="feature-mpesa">
              <div className="bg-kenyan-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">M-Pesa Integration</h3>
              <p className="text-gray-600">Pay easily with M-Pesa for instant access to past papers. No need for bank cards.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl" data-testid="feature-email">
              <div className="bg-warm-orange text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Email Delivery</h3>
              <p className="text-gray-600">Get your past papers delivered to your email immediately after payment.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl" data-testid="feature-cbc">
              <div className="bg-kenyan-gold text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CBC Compliant</h3>
              <p className="text-gray-600">All past papers follow the official CBC curriculum guidelines and standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-kenyan-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-center">
            <div data-testid="stat-papers">
              <div className="text-2xl sm:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm sm:text-base text-green-200">Past Papers Available</div>
            </div>
            <div data-testid="stat-students">
              <div className="text-2xl sm:text-4xl font-bold mb-2">2,000+</div>
              <div className="text-sm sm:text-base text-green-200">Happy Students</div>
            </div>
            <div data-testid="stat-success">
              <div className="text-2xl sm:text-4xl font-bold mb-2">98%</div>
              <div className="text-sm sm:text-base text-green-200">Success Rate</div>
            </div>
            <div data-testid="stat-counties">
              <div className="text-2xl sm:text-4xl font-bold mb-2">47</div>
              <div className="text-sm sm:text-base text-green-200">Counties Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Papers Section */}
      {featuredPapers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-featured-title">
                Featured Past Papers
              </h2>
              <p className="text-xl text-gray-600" data-testid="text-featured-description">
                Popular past papers that students love
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPapers.map((paper) => (
                <PastPaperCard
                  key={paper.id}
                  paper={paper}
                  onAddToCart={onAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/browse">
                <Button 
                  size="lg" 
                  className="bg-kenyan-green text-white hover:bg-green-700"
                  data-testid="button-view-all"
                >
                  View All Past Papers
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Nacs Consortium</h3>
              <p className="text-gray-400 mb-4">
                Empowering Kenyan students with quality CBC past papers for academic excellence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/browse"><a className="hover:text-white">Browse Papers</a></Link></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Payment Methods</h4>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-kenyan-green px-3 py-2 rounded text-sm">M-Pesa</div>
                <div className="bg-blue-600 px-3 py-2 rounded text-sm">Visa</div>
              </div>
              <p className="text-gray-400 text-sm">Secure payments with 256-bit SSL encryption</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Nacs Consortium. All rights reserved. Made with ❤️ for Kenyan students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
