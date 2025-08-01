import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLoaderData, useActionData, useNavigation, useFetcher, Form } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

// Global UI Components Import - ALWAYS include this entire block
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Input, FloatingLabelInput } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Progress } from "~/components/ui/progress";
import { Slider } from "~/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { Toggle } from "~/components/ui/toggle";

// Utility Components Import
import { GlassmorphicPanel } from "~/components/ui/glassmorphic-panel";
import { GradientBackground } from "~/components/ui/gradient-background";
import { AnimatedIcon } from "~/components/ui/animated-icon";
import { ThemeProvider, ThemeToggle } from "~/components/ui/theme-provider";

// Utility Functions
import { cn } from "~/lib/utils";
import { safeLucideIcon } from "~/components/ui/icon";
import { useIsMobile } from "~/hooks/use-mobile";
import { useToast } from "~/hooks/use-toast";

// Types
interface GroceryItem {
  id: string;
  name: string;
  category: string;
  expiryDate: string;
  daysUntilExpiry: number;
  quantity: number;
  unit: string;
  imageUrl: string;
  addedDate: string;
  location: string;
  barcode?: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl: string;
  matchingIngredients: number;
  totalIngredients: number;
}

interface Notification {
  id: string;
  type: 'expiry' | 'recipe' | 'shopping' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const meta: MetaFunction = () => {
  return [
    { title: "FreshTrack - AI Grocery Management" },
    { name: "description", content: "Smart grocery management with AI-powered expiry tracking, recipe suggestions, and food waste reduction." },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Initialize storage classes
    const { groceriesStorage } = await import("~/lib/.server/groceries.storage");
    const { recipesStorage } = await import("~/lib/.server/recipes.storage");
    
    // Initialize sample data
    await Promise.allSettled([
      groceriesStorage.ensureInitialized(),
      recipesStorage.ensureInitialized()
    ]);
    
    // Mock user ID for demo
    const userId = 1;
    
    // Load comprehensive data
    const [groceryItems, recipes, notifications, stats] = await Promise.allSettled([
      groceriesStorage.getGroceryItems(userId, 20),
      recipesStorage.getRecipes(10),
      groceriesStorage.getNotifications(userId),
      groceriesStorage.getGroceryStats(userId)
    ]);
    
    // Process grocery items to add calculated fields
    const processedItems = (groceryItems.status === 'fulfilled' ? groceryItems.value : []).map(item => {
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        expiryDate: item.expiryDate,
        daysUntilExpiry,
        quantity: item.quantity,
        unit: item.unit,
        imageUrl: item.imageUrl || "https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800",
        addedDate: item.addedDate,
        location: item.location,
        barcode: item.barcode
      };
    });
    
    // Process recipes to add matching ingredients
    const processedRecipes = (recipes.status === 'fulfilled' ? recipes.value : []).map(recipe => ({
      id: recipe.id.toString(),
      name: recipe.name,
      description: recipe.description || "",
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty as 'Easy' | 'Medium' | 'Hard',
      imageUrl: recipe.imageUrl || "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800",
      matchingIngredients: Math.floor(Math.random() * 3) + 2, // Mock matching
      totalIngredients: recipe.ingredients?.length || 5
    }));
    
    // Process notifications
    const processedNotifications = (notifications.status === 'fulfilled' ? notifications.value : []).map(notification => ({
      id: notification.id.toString(),
      type: notification.type as 'expiry' | 'recipe' | 'shopping' | 'general',
      title: notification.title,
      message: notification.message,
      timestamp: notification.createdAt.toISOString(),
      read: notification.isRead,
      priority: notification.priority as 'low' | 'medium' | 'high'
    }));
    
    const processedStats = stats.status === 'fulfilled' ? stats.value : {
      totalItems: 0,
      expiringItems: 0,
      wasteReduced: 0,
      moneySaved: 0,
      recipesFound: 0
    };
    
    return json({
      groceryItems: processedItems,
      recipes: processedRecipes,
      notifications: processedNotifications,
      stats: {
        ...processedStats,
        recipesFound: processedRecipes.length
      },
    });
  } catch (error) {
    console.error("Loader error:", error);
    
    // Return fallback data
    return json({
      groceryItems: [],
      recipes: [],
      notifications: [],
      stats: {
        totalItems: 0,
        expiringItems: 0,
        wasteReduced: 0,
        moneySaved: 0,
        recipesFound: 0
      },
      error: "Failed to load data"
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    const { groceriesStorage } = await import("~/lib/.server/groceries.storage");
    const { recipesStorage } = await import("~/lib/.server/recipes.storage");
    
    switch (intent) {
      case "add-item": {
        const itemData = {
          userId: 1, // Mock user ID
          name: formData.get("name") as string,
          category: formData.get("category") as string,
          expiryDate: formData.get("expiryDate") as string,
          quantity: parseInt(formData.get("quantity") as string),
          unit: formData.get("unit") as string,
          location: formData.get("location") as string,
          addedDate: new Date().toISOString().split('T')[0]
        };
        
        await groceriesStorage.createGroceryItem(itemData);
        return redirect("/?refresh=" + Date.now());
      }

      case "scan-item": {
        const userId = 1; // Mock user ID
        await groceriesStorage.scanGroceryImage(userId, "Mock image description");
        return redirect("/?refresh=" + Date.now());
      }

      case "mark-notification-read": {
        const notificationId = parseInt(formData.get("notificationId") as string);
        await groceriesStorage.markNotificationRead(notificationId);
        return redirect("/?refresh=" + Date.now());
      }

      case "save-recipe": {
        const recipeId = parseInt(formData.get("recipeId") as string);
        const userId = 1; // Mock user ID
        
        await recipesStorage.saveRecipe({
          userId,
          recipeId,
          isFavorite: true
        });
        
        return json({ success: true, message: "Recipe saved to favorites!" });
      }

      case "delete-item": {
        const itemId = parseInt(formData.get("itemId") as string);
        await groceriesStorage.deleteGroceryItem(itemId);
        return redirect("/?refresh=" + Date.now());
      }

      case "update-item": {
        const itemId = parseInt(formData.get("itemId") as string);
        const updates = {
          name: formData.get("name") as string,
          category: formData.get("category") as string,
          expiryDate: formData.get("expiryDate") as string,
          quantity: parseInt(formData.get("quantity") as string),
          unit: formData.get("unit") as string,
          location: formData.get("location") as string
        };
        
        await groceriesStorage.updateGroceryItem(itemId, updates);
        return redirect("/?refresh=" + Date.now());
      }

      default:
        return json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Operation failed" }, { status: 500 });
  }
};

export default function Index() {
  const { groceryItems, recipes, notifications, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // SPA State Management
  const [activeView, setActiveView] = useState<'dashboard' | 'inventory' | 'recipes' | 'scanner' | 'notifications'>('dashboard');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isSubmitting = navigation.state === "submitting";

  // Show success/error messages
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      toast({
        title: "Success!",
        description: actionData.message,
        duration: 3000,
      });
    } else if (actionData && 'error' in actionData && actionData.error) {
      toast({
        title: "Error",
        description: actionData.error,
        duration: 3000,
        variant: "destructive",
      });
    }
  }, [actionData, toast]);

  // Filter functions
  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(groceryItems.map(item => item.category)))];

  const getExpiryStatus = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) return { status: 'expired', color: 'bg-red-500', text: 'Expired' };
    if (daysUntilExpiry <= 1) return { status: 'critical', color: 'bg-red-400', text: 'Expires Today' };
    if (daysUntilExpiry <= 3) return { status: 'warning', color: 'bg-warm-orange', text: `${daysUntilExpiry} days left` };
    if (daysUntilExpiry <= 7) return { status: 'caution', color: 'bg-yellow-400', text: `${daysUntilExpiry} days left` };
    return { status: 'fresh', color: 'bg-fresh-green', text: `${daysUntilExpiry} days left` };
  };

  const handleScanItem = async () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Item Scanned!",
        description: "Organic Apples detected and added to inventory",
        duration: 3000,
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-mint-primary/5">
      {/* Header */}
      <header className="-mx-6 -mt-6 bg-white/90 backdrop-blur-md border-b border-coral-primary/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-coral-primary to-mint-primary rounded-xl flex items-center justify-center shadow-lg">
                {safeLucideIcon('Leaf', 'w-6 h-6 text-white')}
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-gray-900">FreshTrack</h1>
                <p className="text-xs text-gray-500">AI Grocery Manager</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
                { id: 'inventory', label: 'Inventory', icon: 'Package' },
                { id: 'recipes', label: 'Recipes', icon: 'ChefHat' },
                { id: 'scanner', label: 'Scanner', icon: 'Camera' },
                { id: 'notifications', label: 'Alerts', icon: 'Bell' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    activeView === item.id
                      ? "bg-coral-primary text-white shadow-lg"
                      : "text-gray-600 hover:text-coral-primary hover:bg-coral-primary/5"
                  )}
                >
                  {safeLucideIcon(item.icon, 'w-4 h-4')}
                  <span>{item.label}</span>
                  {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {safeLucideIcon('Menu', 'w-6 h-6 text-gray-600')}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex justify-around py-2">
          {[
            { id: 'dashboard', icon: 'LayoutDashboard', label: 'Home' },
            { id: 'inventory', icon: 'Package', label: 'Items' },
            { id: 'recipes', icon: 'ChefHat', label: 'Recipes' },
            { id: 'scanner', icon: 'Camera', label: 'Scan' },
            { id: 'notifications', icon: 'Bell', label: 'Alerts' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 relative",
                activeView === item.id
                  ? "text-coral-primary"
                  : "text-gray-400"
              )}
            >
              {safeLucideIcon(item.icon, 'w-5 h-5')}
              <span className="text-xs mt-1">{item.label}</span>
              {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">{notifications.filter(n => !n.read).length}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 pb-20 md:pb-8">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900">
                Welcome to <span className="text-coral-primary">FreshTrack</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your AI-powered grocery companion that helps reduce food waste and discover amazing recipes
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="text-center p-4 bg-gradient-to-br from-coral-primary/10 to-coral-primary/5 border-coral-primary/20">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-coral-primary">{stats.totalItems}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-red-500">{stats.expiringItems}</div>
                  <div className="text-sm text-gray-600">Expiring Soon</div>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4 bg-gradient-to-br from-fresh-green/30 to-fresh-green/10 border-fresh-green/40">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-green-600">{stats.wasteReduced}%</div>
                  <div className="text-sm text-gray-600">Waste Reduced</div>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4 bg-gradient-to-br from-warm-orange/20 to-warm-orange/10 border-warm-orange/30">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-orange-600">${stats.moneySaved}</div>
                  <div className="text-sm text-gray-600">Money Saved</div>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4 bg-gradient-to-br from-mint-primary/20 to-mint-primary/10 border-mint-primary/30">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-mint-dark">{stats.recipesFound}</div>
                  <div className="text-sm text-gray-600">Recipes Found</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => setActiveView('scanner')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-coral-primary to-coral-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {safeLucideIcon('Camera', 'w-8 h-8 text-white')}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan Items</h3>
                  <p className="text-gray-600 text-sm">Use AI to quickly add items by scanning</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => setActiveView('recipes')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-mint-primary to-mint-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {safeLucideIcon('ChefHat', 'w-8 h-8 text-white')}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Recipes</h3>
                  <p className="text-gray-600 text-sm">Discover recipes with your ingredients</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => setShowAddItemModal(true)}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-soft-blue to-soft-blue-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {safeLucideIcon('Plus', 'w-8 h-8 text-white')}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Manually</h3>
                  <p className="text-gray-600 text-sm">Add items to your inventory manually</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Items & Expiring Soon */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Expiring Soon */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {safeLucideIcon('AlertTriangle', 'w-5 h-5 text-red-500')}
                    <span>Expiring Soon</span>
                  </CardTitle>
                  <CardDescription>Items that need your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groceryItems
                      .filter(item => item.daysUntilExpiry <= 3)
                      .slice(0, 3)
                      .map((item) => {
                        const status = getExpiryStatus(item.daysUntilExpiry);
                        return (
                          <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                            </div>
                            <Badge className={cn("text-white", status.color)}>
                              {status.text}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                  {groceryItems.filter(item => item.daysUntilExpiry <= 3).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No items expiring soon! 🎉</p>
                  )}
                </CardContent>
              </Card>

              {/* Recipe Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {safeLucideIcon('Lightbulb', 'w-5 h-5 text-mint-primary')}
                    <span>Recipe Suggestions</span>
                  </CardTitle>
                  <CardDescription>Based on your available ingredients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recipes.slice(0, 2).map((recipe) => (
                      <div 
                        key={recipe.id} 
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setSelectedRecipe(recipe);
                          setShowRecipeModal(true);
                        }}
                      >
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                          <p className="text-sm text-gray-500">{recipe.prepTime + recipe.cookTime} min • {recipe.difficulty}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-mint-primary">
                            {recipe.matchingIngredients}/{recipe.totalIngredients}
                          </div>
                          <div className="text-xs text-gray-500">ingredients</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setActiveView('recipes')}
                  >
                    View All Recipes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Inventory View */}
        {activeView === 'inventory' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
                <p className="text-gray-600">Manage your grocery items</p>
              </div>
              <Button onClick={() => setShowAddItemModal(true)} className="bg-coral-primary hover:bg-coral-dark">
                {safeLucideIcon('Plus', 'w-4 h-4 mr-2')}
                Add Item
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const status = getExpiryStatus(item.daysUntilExpiry);
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Badge className={cn("absolute top-3 right-3 text-white", status.color)}>
                          {status.text}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.quantity} {item.unit}</span>
                          <span className="text-gray-500">{item.location}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            Added {new Date(item.addedDate).toLocaleDateString()}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {safeLucideIcon('MoreVertical', 'w-4 h-4')}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setSelectedItem(item);
                                setShowEditModal(true);
                              }}>
                                {safeLucideIcon('Edit', 'w-4 h-4 mr-2')}
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                if (confirm('Are you sure you want to delete this item?')) {
                                  const form = new FormData();
                                  form.append('intent', 'delete-item');
                                  form.append('itemId', item.id);
                                  fetch('/', { method: 'POST', body: form });
                                }
                              }}>
                                {safeLucideIcon('Trash2', 'w-4 h-4 mr-2')}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {safeLucideIcon('Package', 'w-12 h-12 text-gray-400')}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <Button onClick={() => setShowAddItemModal(true)} className="bg-coral-primary hover:bg-coral-dark">
                  Add Your First Item
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Recipes View */}
        {activeView === 'recipes' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recipe Suggestions</h2>
              <p className="text-gray-600">Discover delicious recipes with your available ingredients</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => {
                  setSelectedRecipe(recipe);
                  setShowRecipeModal(true);
                }}>
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-3 right-3 bg-mint-primary text-white">
                        {recipe.matchingIngredients}/{recipe.totalIngredients} ingredients
                      </Badge>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                      <p className="text-gray-600 mb-4">{recipe.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            {safeLucideIcon('Clock', 'w-4 h-4 mr-1')}
                            {recipe.prepTime + recipe.cookTime} min
                          </span>
                          <span className="flex items-center">
                            {safeLucideIcon('Users', 'w-4 h-4 mr-1')}
                            {recipe.servings} servings
                          </span>
                        </div>
                        <Badge variant="outline" className={cn(
                          recipe.difficulty === 'Easy' ? 'text-green-600 border-green-600' :
                          recipe.difficulty === 'Medium' ? 'text-yellow-600 border-yellow-600' :
                          'text-red-600 border-red-600'
                        )}>
                          {recipe.difficulty}
                        </Badge>
                      </div>

                      <Progress 
                        value={(recipe.matchingIngredients / recipe.totalIngredients) * 100} 
                        className="mb-4"
                      />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          You have {recipe.matchingIngredients} of {recipe.totalIngredients} ingredients
                        </span>
                        <Button size="sm" variant="outline">
                          View Recipe
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Scanner View */}
        {activeView === 'scanner' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">AI Scanner</h2>
              <p className="text-gray-600">Scan items to automatically add them to your inventory</p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <div className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300",
                  isScanning 
                    ? "bg-gradient-to-br from-coral-primary to-coral-light animate-pulse" 
                    : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-coral-primary/20 hover:to-coral-light/20"
                )}>
                  {isScanning ? (
                    <div className="animate-spin">
                      {safeLucideIcon('Loader', 'w-12 h-12 text-white')}
                    </div>
                  ) : (
                    safeLucideIcon('Camera', 'w-12 h-12 text-gray-600')
                  )}
                </div>

                {isScanning ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Scanning...</h3>
                    <p className="text-gray-600">AI is analyzing your item</p>
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-coral-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-coral-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-coral-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Ready to Scan</h3>
                    <p className="text-gray-600">Point your camera at a grocery item to get started</p>
                    <Form method="post">
                      <input type="hidden" name="intent" value="scan-item" />
                      <Button 
                        type="submit"
                        className="bg-coral-primary hover:bg-coral-dark"
                        disabled={isScanning}
                      >
                        {safeLucideIcon('Camera', 'w-4 h-4 mr-2')}
                        Start Scanning
                      </Button>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Scans */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>Items you've recently scanned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Organic Apples", time: "2 minutes ago", confidence: 98 },
                    { name: "Greek Yogurt", time: "1 hour ago", confidence: 95 },
                    { name: "Whole Grain Bread", time: "3 hours ago", confidence: 92 },
                  ].map((scan, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-900">{scan.name}</h4>
                        <p className="text-sm text-gray-500">{scan.time}</p>
                      </div>
                      <Badge className="bg-fresh-green text-green-800">
                        {scan.confidence}% confident
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications View */}
        {activeView === 'notifications' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              <p className="text-gray-600">Stay updated with your grocery alerts</p>
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={cn(
                  "transition-all duration-300",
                  !notification.read ? "border-l-4 border-l-coral-primary bg-coral-primary/5" : "border-l-4 border-l-gray-200"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          notification.type === 'expiry' ? "bg-red-100" :
                          notification.type === 'recipe' ? "bg-mint-primary/20" :
                          notification.type === 'shopping' ? "bg-soft-blue/20" :
                          "bg-gray-100"
                        )}>
                          {notification.type === 'expiry' && safeLucideIcon('AlertTriangle', 'w-5 h-5 text-red-500')}
                          {notification.type === 'recipe' && safeLucideIcon('ChefHat', 'w-5 h-5 text-mint-primary')}
                          {notification.type === 'shopping' && safeLucideIcon('ShoppingCart', 'w-5 h-5 text-soft-blue')}
                          {notification.type === 'general' && safeLucideIcon('Info', 'w-5 h-5 text-gray-500')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                            <Badge variant="outline" className={cn(
                              notification.priority === 'high' ? 'text-red-600 border-red-600' :
                              notification.priority === 'medium' ? 'text-yellow-600 border-yellow-600' :
                              'text-gray-600 border-gray-600'
                            )}>
                              {notification.priority} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <Form method="post">
                          <input type="hidden" name="intent" value="mark-notification-read" />
                          <input type="hidden" name="notificationId" value={notification.id} />
                          <Button variant="ghost" size="sm" type="submit">
                            Mark as Read
                          </Button>
                        </Form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {safeLucideIcon('Bell', 'w-12 h-12 text-gray-400')}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your grocery inventory
            </DialogDescription>
          </DialogHeader>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="add-item" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" placeholder="e.g., Organic Bananas" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Meat">Meat</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                    <SelectItem value="Pantry">Pantry</SelectItem>
                    <SelectItem value="Frozen">Frozen</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select name="unit" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="g">Grams</SelectItem>
                    <SelectItem value="lbs">Pounds</SelectItem>
                    <SelectItem value="oz">Ounces</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="ml">ML</SelectItem>
                    <SelectItem value="containers">Containers</SelectItem>
                    <SelectItem value="packages">Packages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select name="location" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                    <SelectItem value="Freezer">Freezer</SelectItem>
                    <SelectItem value="Pantry">Pantry</SelectItem>
                    <SelectItem value="Counter">Counter</SelectItem>
                    <SelectItem value="Cabinet">Cabinet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" name="expiryDate" type="date" required />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddItemModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-coral-primary hover:bg-coral-dark" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the item details
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update-item" />
              <input type="hidden" name="itemId" value={selectedItem.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Item Name</Label>
                  <Input id="edit-name" name="name" defaultValue={selectedItem.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select name="category" defaultValue={selectedItem.category} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                      <SelectItem value="Meat">Meat</SelectItem>
                      <SelectItem value="Bakery">Bakery</SelectItem>
                      <SelectItem value="Pantry">Pantry</SelectItem>
                      <SelectItem value="Frozen">Frozen</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input id="edit-quantity" name="quantity" type="number" min="1" defaultValue={selectedItem.quantity} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select name="unit" defaultValue={selectedItem.unit} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="g">Grams</SelectItem>
                      <SelectItem value="lbs">Pounds</SelectItem>
                      <SelectItem value="oz">Ounces</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="ml">ML</SelectItem>
                      <SelectItem value="containers">Containers</SelectItem>
                      <SelectItem value="packages">Packages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Select name="location" defaultValue={selectedItem.location} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                      <SelectItem value="Freezer">Freezer</SelectItem>
                      <SelectItem value="Pantry">Pantry</SelectItem>
                      <SelectItem value="Counter">Counter</SelectItem>
                      <SelectItem value="Cabinet">Cabinet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                <Input id="edit-expiryDate" name="expiryDate" type="date" defaultValue={selectedItem.expiryDate} required />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-coral-primary hover:bg-coral-dark" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Item"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Recipe Modal */}
      <Dialog open={showRecipeModal} onOpenChange={setShowRecipeModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecipe.name}</DialogTitle>
                <DialogDescription>
                  {selectedRecipe.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <img 
                  src={selectedRecipe.imageUrl} 
                  alt={selectedRecipe.name}
                  className="w-full h-48 object-cover rounded-lg"
                />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-coral-primary">{selectedRecipe.prepTime}</div>
                    <div className="text-sm text-gray-600">Prep Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-mint-primary">{selectedRecipe.cookTime}</div>
                    <div className="text-sm text-gray-600">Cook Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-soft-blue">{selectedRecipe.servings}</div>
                    <div className="text-sm text-gray-600">Servings</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <div className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox id={`ingredient-${index}`} />
                        <label htmlFor={`ingredient-${index}`} className="text-sm">
                          {ingredient}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-coral-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowRecipeModal(false)}>
                  Close
                </Button>
                <Form method="post" className="inline">
                  <input type="hidden" name="intent" value="save-recipe" />
                  <input type="hidden" name="recipeId" value={selectedRecipe.id} />
                  <Button type="submit" className="bg-mint-primary hover:bg-mint-dark">
                    {safeLucideIcon('Heart', 'w-4 h-4 mr-2')}
                    Save Recipe
                  </Button>
                </Form>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}