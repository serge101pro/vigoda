import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { ScrollToTop } from "@/components/ScrollToTop";

// Layout
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import { OnboardingPage } from "@/pages/OnboardingPage";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import CartPage from "@/pages/CartPage";
import RecipesPage from "@/pages/RecipesPage";
import ProfilePage from "@/pages/ProfilePage";
import AffiliatePage from "@/pages/AffiliatePage";
import PriceComparisonPage from "@/pages/PriceComparisonPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import NotFound from "./pages/NotFound";

// Profile pages
import PremiumPage from "@/pages/profile/PremiumPage";
import SettingsPage from "@/pages/profile/SettingsPage";
import AwardsPage from "@/pages/profile/AwardsPage";
import UserRecipesPage from "@/pages/profile/UserRecipesPage";
import AnalyticsPage from "@/pages/profile/AnalyticsPage";
import LoyaltyCardsPage from "@/pages/profile/LoyaltyCardsPage";
import ShoppingListsPage from "@/pages/profile/ShoppingListsPage";
import ProfileEditPage from "@/pages/profile/ProfileEditPage";

// New pages
import RecipeDetailPage from "@/pages/RecipeDetailPage";
import AddressesPage from "@/pages/AddressesPage";
import FavoritesPage from "@/pages/FavoritesPage";
import ReadyMealsPage from "@/pages/ReadyMealsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import MealPlanDetailPage from "@/pages/MealPlanDetailPage";
import CateringPage from "@/pages/CateringPage";
import FarmProductsPage from "@/pages/FarmProductsPage";
import FamilyPlanningPage from "@/pages/FamilyPlanningPage";
import SocialRecipesPage from "@/pages/SocialRecipesPage";

const queryClient = new QueryClient();

function AppRoutes() {
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);

  if (!hasSeenOnboarding) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:section" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/cart/compare" element={<PriceComparisonPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/ready-meals" element={<ReadyMealsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/meal-plan/:id" element={<MealPlanDetailPage />} />
          <Route path="/ready-meal/:id" element={<ReadyMealDetailPage />} />
          <Route path="/catering" element={<CateringPage />} />
          <Route path="/catering/:id" element={<CateringDetailPage />} />
          <Route path="/promo/:id" element={<PromoDetailPage />} />
          <Route path="/farm-products" element={<FarmProductsPage />} />
          <Route path="/family" element={<FamilyPlanningPage />} />
          <Route path="/social-recipes" element={<SocialRecipesPage />} />
          <Route path="/profile/addresses" element={<AddressesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/affiliate" element={<AffiliatePage />} />
          <Route path="/profile/premium" element={<PremiumPage />} />
          <Route path="/profile/settings" element={<SettingsPage />} />
          <Route path="/profile/awards" element={<AwardsPage />} />
          <Route path="/profile/recipes" element={<UserRecipesPage />} />
          <Route path="/profile/analytics" element={<AnalyticsPage />} />
          <Route path="/profile/loyalty-cards" element={<LoyaltyCardsPage />} />
          <Route path="/profile/lists" element={<ShoppingListsPage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Route>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
