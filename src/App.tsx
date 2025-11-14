import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import Index from "./pages/Index";
import { Professionals } from "./pages/Professionals";
import { Framework } from "./pages/Framework";
import { ProfileWrapper } from "./pages/ProfileWrapper";
import { Auth } from "./pages/Auth";
import { NewAuth } from "./pages/NewAuth";
import { Admin } from "./pages/Admin";
import { CompanyRegister } from "./pages/CompanyRegister";
import { CompanyDashboard } from "./pages/CompanyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/framework" element={<Framework />} />
          <Route path="/profile" element={<ProfileWrapper />} />
          <Route path="/profile/:userId" element={<ProfileWrapper />} />
          <Route path="/login" element={<NewAuth />} />
          <Route path="/signup" element={<NewAuth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/company-register" element={<CompanyRegister />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/admin" element={<Admin />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
