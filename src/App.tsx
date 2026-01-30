import { useEffect, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import PaymentMethodsPage from "@/pages/profile/PaymentMethodsPage";
import WalletPage from "@/pages/profile/WalletPage";
import AboutPage from "@/pages/AboutPage";
import PermissionsPage from "@/pages/profile/PermissionsPage";
import PreferencesPage from "@/pages/profile/PreferencesPage";
import NotificationsPage from "@/pages/profile/NotificationsPage";

// New pages
import RecipeDetailPage from "@/pages/RecipeDetailPage";
import AddressesPage from "@/pages/AddressesPage";
import FavoritesPage from "@/pages/FavoritesPage";
import ReadyMealsPage from "@/pages/ReadyMealsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import MealPlanDetailPage from "@/pages/MealPlanDetailPage";
import CateringPage from "@/pages/CateringPage";
import CateringDetailPage from "@/pages/CateringDetailPage";
import FarmProductsPage from "@/pages/FarmProductsPage";
import FamilyPlanningPage from "@/pages/FamilyPlanningPage";
import SocialRecipesPage from "@/pages/SocialRecipesPage";
import PromoDetailPage from "@/pages/PromoDetailPage";
import ReadyMealDetailPage from "@/pages/ReadyMealDetailPage";
import FarmProductDetailPage from "@/pages/FarmProductDetailPage";
import StoresPage from "@/pages/StoresPage";
import StoreDetailPage from "@/pages/StoreDetailPage";
import FarmsPage from "@/pages/FarmsPage";
import FarmDetailPage from "@/pages/FarmDetailPage";
import PromosPage from "@/pages/PromosPage";
import PaymentPage from "@/pages/PaymentPage";
import NearestStoresPage from "@/pages/NearestStoresPage";
import ShoppingRoutePage from "@/pages/ShoppingRoutePage";
import DailyDealsPage from "@/pages/DailyDealsPage";
import CheckoutPage from "@/pages/CheckoutPage";
import MealPlanGeneratorPage from "@/pages/MealPlanGeneratorPage";
import BusinessLandingPage from "@/pages/BusinessLandingPage";
import OrganizationDashboardPage from "@/pages/organization/OrganizationDashboardPage";
import OrganizationAnalyticsPage from "@/pages/organization/OrganizationAnalyticsPage";
import OrganizationDocumentsPage from "@/pages/organization/OrganizationDocumentsPage";
import OrganizationEmployeesPage from "@/pages/organization/OrganizationEmployeesPage";
import OrganizationOrdersPage from "@/pages/organization/OrganizationOrdersPage";
import OrganizationApprovalsPage from "@/pages/organization/OrganizationApprovalsPage";
import CoopCartPage from "@/pages/organization/CoopCartPage";

// Legal pages
import TermsPage from "@/pages/legal/TermsPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import SupportPage from "@/pages/legal/SupportPage";
import PersonalDataPolicyPage from "@/pages/legal/PersonalDataPolicyPage";
import PublicOfferPage from "@/pages/legal/PublicOfferPage";
import RecommendationRulesPage from "@/pages/legal/RecommendationRulesPage";

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
      <ScrollToTopButton />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:section" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/cart/compare" element={<PriceComparisonPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/ready-meals" element={<ReadyMealsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/meal-plan/:id" element={<MealPlanDetailPage />} />
          <Route path="/ready-meal/:id" element={<ReadyMealDetailPage />} />
          <Route path="/catering" element={<CateringPage />} />
          <Route path="/catering/:id" element={<CateringDetailPage />} />
          <Route path="/promos" element={<PromosPage />} />
          <Route path="/promo/:id" element={<PromoDetailPage />} />
          <Route path="/daily-deals" element={<DailyDealsPage />} />
          <Route path="/farm-products" element={<FarmProductsPage />} />
          <Route path="/farm-product/:id" element={<FarmProductDetailPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/store/:id" element={<StoreDetailPage />} />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farm/:id" element={<FarmDetailPage />} />
          <Route path="/family" element={<FamilyPlanningPage />} />
          <Route path="/social-recipes" element={<SocialRecipesPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/nearest-stores" element={<NearestStoresPage />} />
          <Route path="/shopping-route" element={<ShoppingRoutePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/meal-plan-generator" element={<MealPlanGeneratorPage />} />
          <Route path="/business" element={<BusinessLandingPage />} />
          <Route path="/organization" element={<OrganizationDashboardPage />} />
          <Route path="/organization/analytics" element={<OrganizationAnalyticsPage />} />
          <Route path="/organization/documents" element={<OrganizationDocumentsPage />} />
          <Route path="/organization/employees" element={<OrganizationEmployeesPage />} />
          <Route path="/organization/orders" element={<OrganizationOrdersPage />} />
          <Route path="/organization/approvals" element={<OrganizationApprovalsPage />} />
          <Route path="/organization/coop-cart" element={<CoopCartPage />} />
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
          <Route path="/profile/payment-methods" element={<PaymentMethodsPage />} />
          <Route path="/profile/affiliate/wallet" element={<WalletPage />} />
          <Route path="/profile/permissions" element={<PermissionsPage />} />
          <Route path="/profile/preferences" element={<PreferencesPage />} />
          <Route path="/profile/notifications" element={<NotificationsPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Legal pages */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/personal-data-policy" element={<PersonalDataPolicyPage />} />
          <Route path="/public-offer" element={<PublicOfferPage />} />
          <Route path="/recommendation-rules" element={<RecommendationRulesPage />} />
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

const App = () => {
  // Global error handler to prevent white screen on mobile (especially Android)
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      // Prevent the default browser handling which can crash the app on Android
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error("Runtime error:", event.error);
      // Prevent the default browser handling which can crash the app on Android
      event.preventDefault();
    };

    // Android WebView specific: catch any global errors
    const handleGlobalError = (...args: unknown[]) => {
      console.error("Global error caught:", args);
      return true; // Prevent default error handling
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);
    
    // Override console.error to catch any remaining issues
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      originalConsoleError.apply(console, args);
      // Don't throw - just log
    };
    
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
