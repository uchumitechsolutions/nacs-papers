import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema, loginUserSchema, type InsertUser, type LoginUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Redirect if already logged in
  if (!isLoading && isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginUser) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Auth Form */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin 
                ? "Sign in to your account to access your purchase history" 
                : "Join us to track your past papers and access your downloads anytime"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLogin ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              data-testid="input-username"
                              placeholder="Enter your username" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              data-testid="input-password"
                              placeholder="Enter your password" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-kenyan-green text-white hover:bg-green-700"
                      disabled={loginMutation.isPending}
                      data-testid="button-signin"
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                data-testid="input-firstname"
                                placeholder="First name" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                data-testid="input-lastname"
                                placeholder="Last name" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              data-testid="input-register-username"
                              placeholder="Choose a username" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email" 
                              data-testid="input-email"
                              placeholder="your@email.com" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              data-testid="input-register-password"
                              placeholder="Choose a secure password" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-kenyan-green text-white hover:bg-green-700"
                      disabled={registerMutation.isPending}
                      data-testid="button-signup"
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="mt-6 text-center">
                <Button 
                  variant="link" 
                  onClick={() => setIsLogin(!isLogin)}
                  data-testid="button-toggle-auth"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Hero Section */}
        <div className="text-center md:text-left">
          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400"
              alt="Students studying"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kenya's Premier CBC Past Papers Platform
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-kenyan-green rounded-full"></div>
              <p>Access hundreds of CBC curriculum past papers</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-warm-orange rounded-full"></div>
              <p>Track your purchase history and re-download anytime</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p>Secure payments via M-Pesa and Visa</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p>Instant PDF downloads after purchase</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Don't want to create an account? You can still{" "}
              <Button 
                variant="link" 
                className="text-kenyan-green p-0 h-auto"
                onClick={() => window.location.href = "/"}
                data-testid="button-browse-guest"
              >
                browse and purchase as a guest
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}