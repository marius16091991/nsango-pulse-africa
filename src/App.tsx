import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Portraits from "./pages/Portraits.tsx";
import Business from "./pages/Business.tsx";
import Culture from "./pages/Culture.tsx";
import Interviews from "./pages/Interviews.tsx";
import Videos from "./pages/Videos.tsx";
import Magazine from "./pages/Magazine.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portraits" element={<Portraits />} />
          <Route path="/business" element={<Business />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/magazine" element={<Magazine />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
