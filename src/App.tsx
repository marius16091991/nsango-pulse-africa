import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Portraits from "./pages/Portraits.tsx";
import Business from "./pages/Business.tsx";
import Culture from "./pages/Culture.tsx";
import Interviews from "./pages/Interviews.tsx";
import Videos from "./pages/Videos.tsx";
import Magazine from "./pages/Magazine.tsx";
import Actualites from "./pages/Actualites.tsx";
import Evenements from "./pages/Evenements.tsx";
import Podcasts from "./pages/Podcasts.tsx";
import APropos from "./pages/APropos.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Premium from "./pages/Premium.tsx";
import ArticlePage from "./pages/ArticlePage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import ArticlesManager from "./pages/admin/ArticlesManager.tsx";
import VideosManager from "./pages/admin/VideosManager.tsx";
import MediasManager from "./pages/admin/MediasManager.tsx";
import Publications from "./pages/admin/Publications.tsx";
import MagazineManager from "./pages/admin/MagazineManager.tsx";
import Surveys from "./pages/admin/Surveys.tsx";
import CommentsManager from "./pages/admin/CommentsManager.tsx";
import Advertising from "./pages/admin/Advertising.tsx";
import Subscriptions from "./pages/admin/Subscriptions.tsx";
import UsersManager from "./pages/admin/UsersManager.tsx";
import AnalyticsPage from "./pages/admin/AnalyticsPage.tsx";
import DistributionPage from "./pages/admin/DistributionPage.tsx";
import SettingsPage from "./pages/admin/SettingsPage.tsx";
import NotificationsPage from "./pages/admin/NotificationsPage.tsx";
import ContentManager from "./pages/admin/ContentManager.tsx";
import EmailsOutbox from "./pages/admin/EmailsOutbox.tsx";
import SocialMedia from "./pages/admin/SocialMedia.tsx";
import UserNotifications from "./pages/compte/Notifications.tsx";
import CompteLayout from "./pages/compte/CompteLayout.tsx";
import CompteOverview from "./pages/compte/Overview.tsx";
import CompteProfil from "./pages/compte/Profil.tsx";
import CompteSecurite from "./pages/compte/Securite.tsx";
import CompteAbonnement from "./pages/compte/Abonnement.tsx";
import SeoManager from "./pages/admin/SeoManager.tsx";
import SeoGlobal from "./components/seo/SeoGlobal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SeoGlobal />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portraits" element={<Portraits />} />
            <Route path="/business" element={<Business />} />
            <Route path="/culture" element={<Culture />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/magazine" element={<Magazine />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/podcasts" element={<Podcasts />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/compte" element={<CompteLayout />}>
              <Route index element={<CompteOverview />} />
              <Route path="profil" element={<CompteProfil />} />
              <Route path="notifications" element={<UserNotifications />} />
              <Route path="securite" element={<CompteSecurite />} />
              <Route path="abonnement" element={<CompteAbonnement />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="articles" element={<ArticlesManager />} />
              <Route path="videos" element={<VideosManager />} />
              <Route path="medias" element={<MediasManager />} />
              <Route path="publications" element={<Publications />} />
              <Route path="magazine" element={<MagazineManager />} />
              <Route path="surveys" element={<Surveys />} />
              <Route path="comments" element={<CommentsManager />} />
              <Route path="advertising" element={<Advertising />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="users" element={<UsersManager />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="distribution" element={<DistributionPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="emails" element={<EmailsOutbox />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="social" element={<SocialMedia />} />
              <Route path="seo" element={<SeoManager />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
