import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPastPaperSchema, PastPaper, Sale } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ChartBar, 
  FileText, 
  ShoppingCart, 
  Users, 
  Upload, 
  TrendingUp, 
  DollarSign,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { GRADES, SUBJECTS } from "@/lib/constants";
import { z } from "zod";

type FormData = z.infer<typeof insertPastPaperSchema>;

interface Analytics {
  totalSales: number;
  totalPapersSold: number;
  activeUsers: number;
  successRate: number;
  recentSales: Sale[];
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(insertPastPaperSchema.omit({ fileUrl: true, fileName: true })),
    defaultValues: {
      title: "",
      description: "",
      grade: "",
      subject: "",
      price: 0,
    },
  });

  // Queries
  const { data: papers = [] } = useQuery<PastPaper[]>({
    queryKey: ["/api/past-papers"],
    enabled: isLoggedIn,
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    enabled: isLoggedIn,
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    enabled: isLoggedIn,
  });

  // Mutations
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const createPaperMutation = useMutation({
    mutationFn: async (data: FormData & { file?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'file') {
          formData.append(key, value.toString());
        }
      });
      if (data.file) {
        formData.append('file', data.file);
      }
      
      const response = await fetch("/api/past-papers", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to create past paper");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/past-papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      form.reset();
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Past paper uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload past paper",
        variant: "destructive",
      });
    },
  });

  const deletePaperMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/past-papers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/past-papers"] });
      toast({
        title: "Success",
        description: "Past paper deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete past paper",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = form.getValues();
    
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      });
      return;
    }

    createPaperMutation.mutate({
      ...formData,
      file: selectedFile,
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" data-testid="admin-login">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                  data-testid="input-username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-kenyan-green hover:bg-green-700"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
            <p className="text-sm text-gray-600 text-center mt-4">
              Default credentials: admin / admin123
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" data-testid="admin-dashboard">
      <div className="bg-kenyan-green text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
            <p className="text-green-200">Nacs Consortium Management</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsLoggedIn(false)}
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <ChartBar className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="papers" data-testid="tab-papers">
              <FileText className="w-4 h-4 mr-2" />
              Past Papers
            </TabsTrigger>
            <TabsTrigger value="sales" data-testid="tab-sales">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="upload" data-testid="tab-upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-total-sales">
                        KSh {analytics?.totalSales?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-kenyan-green text-white p-3 rounded-lg">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+12% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Papers Sold</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-papers-sold">
                        {analytics?.totalPapersSold || 0}
                      </p>
                    </div>
                    <div className="bg-warm-orange text-white p-3 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+8% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-active-users">
                        {analytics?.activeUsers || 0}
                      </p>
                    </div>
                    <div className="bg-blue-500 text-white p-3 rounded-lg">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+15% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-success-rate">
                        {analytics?.successRate || 0}%
                      </p>
                    </div>
                    <div className="bg-kenyan-gold text-white p-3 rounded-lg">
                      <ChartBar className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+2% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.recentSales && analytics.recentSales.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.recentSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between py-3 border-b"
                        data-testid={`sale-${sale.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-kenyan-green text-white rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{sale.paperIds.length} paper(s)</p>
                            <p className="text-sm text-gray-600">{sale.customerEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">KSh {sale.totalAmount}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent sales</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="papers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Past Papers</CardTitle>
              </CardHeader>
              <CardContent>
                {papers.length > 0 ? (
                  <div className="space-y-4">
                    {papers.map((paper) => (
                      <div
                        key={paper.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`paper-row-${paper.id}`}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{paper.title}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{paper.grade}</Badge>
                            <Badge variant="outline">{paper.subject}</Badge>
                            <Badge className="bg-kenyan-green text-white">KSh {paper.price}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" data-testid={`button-view-${paper.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-edit-${paper.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePaperMutation.mutate(paper.id)}
                            disabled={deletePaperMutation.isPending}
                            data-testid={`button-delete-${paper.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No past papers uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length > 0 ? (
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`sale-row-${sale.id}`}
                      >
                        <div>
                          <p className="font-medium">{sale.customerEmail}</p>
                          <p className="text-sm text-gray-600">
                            {sale.paperIds.length} paper(s) • {sale.paymentMethod}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(sale.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-kenyan-green">
                            KSh {sale.totalAmount}
                          </p>
                          <Badge 
                            className={sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {sale.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No sales yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Past Paper</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Paper Title</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="e.g., Grade 3 Mathematics Term 1"
                      data-testid="input-title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Describe the content of this past paper"
                      data-testid="input-description"
                    />
                    {form.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grade">Grade Level</Label>
                      <Select 
                        onValueChange={(value) => form.setValue("grade", value)}
                        value={form.watch("grade")}
                      >
                        <SelectTrigger data-testid="select-grade">
                          <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.grade && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.grade.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select 
                        onValueChange={(value) => form.setValue("subject", value)}
                        value={form.watch("subject")}
                      >
                        <SelectTrigger data-testid="select-subject">
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price">Price (KSh)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...form.register("price", { valueAsNumber: true })}
                      placeholder="120"
                      data-testid="input-price"
                    />
                    {form.formState.errors.price && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="file">PDF File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="mt-2"
                      data-testid="input-file"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-1">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-kenyan-green text-white hover:bg-green-700"
                    disabled={createPaperMutation.isPending}
                    data-testid="button-upload"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {createPaperMutation.isPending ? "Uploading..." : "Upload Past Paper"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
