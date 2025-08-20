import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, Calendar, FileText, LogOut } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface UserPurchase {
  id: string;
  userId: string | null;
  paperId: string | null;
  saleId: string | null;
  purchasedAt: Date | null;
  paper?: {
    id: string;
    title: string;
    description: string;
    grade: string;
    subject: string;
    price: number;
    fileUrl: string;
    fileName: string;
    createdAt: Date;
  } | null;
}

export default function Account() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please Login",
        description: "You need to login to view your account.",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<UserPurchase[]>({
    queryKey: ["/api/user/purchases"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (isLoading || purchasesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kenyan-green"></div>
          <p className="mt-4 text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="py-16 bg-gray-50" data-testid="page-account">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-kenyan-green rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" data-testid="text-user-name">
                    {user?.firstName || user?.lastName 
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : user?.username || 'User Account'}
                  </h1>
                  <p className="text-gray-600" data-testid="text-user-email">
                    {user?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Purchase Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-kenyan-green text-white p-3 rounded-lg">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-purchases">
                    {purchases.length}
                  </p>
                  <p className="text-gray-600">Past Papers Purchased</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-warm-orange text-white p-3 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-spent">
                    KSh {purchases.reduce((total, purchase) => total + (purchase.paper?.price || 0), 0)}
                  </p>
                  <p className="text-gray-600">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 text-white p-3 rounded-lg">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-last-purchase">
                    {purchases.length > 0 && purchases[0].purchasedAt 
                      ? new Date(purchases[0].purchasedAt).toLocaleDateString()
                      : 'None'}
                  </p>
                  <p className="text-gray-600">Last Purchase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase History */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length > 0 ? (
              <div className="space-y-4" data-testid="purchase-history">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`purchase-${purchase.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
                        alt="Past paper thumbnail"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium" data-testid={`text-paper-title-${purchase.id}`}>
                          {purchase.paper?.title || 'Unknown Paper'}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" data-testid={`text-paper-grade-${purchase.id}`}>
                            {purchase.paper?.grade}
                          </Badge>
                          <Badge variant="outline" data-testid={`text-paper-subject-${purchase.id}`}>
                            {purchase.paper?.subject}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Purchased on {purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-kenyan-green" data-testid={`text-paper-price-${purchase.id}`}>
                        KSh {purchase.paper?.price || 0}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        data-testid={`button-download-${purchase.id}`}
                        onClick={() => {
                          if (purchase.paper?.fileUrl) {
                            window.open(purchase.paper.fileUrl, '_blank');
                          }
                        }}
                      >
                        Download PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="empty-purchases">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Purchases Yet</h3>
                <p className="text-gray-500 mb-4">You haven't purchased any past papers yet.</p>
                <Button
                  onClick={() => window.location.href = '/browse'}
                  className="bg-kenyan-green text-white hover:bg-green-700"
                  data-testid="button-browse-papers"
                >
                  Browse Past Papers
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}