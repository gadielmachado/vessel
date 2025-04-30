import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ViewVessels from "./pages/ViewVessels";
import AddVessel from "./pages/AddVessel";
import EditVessel from "./pages/EditVessel";
import EmbedCodePage from "./pages/EmbedCode";
import EmbedView from "./pages/EmbedView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ViewVessels />} />
          <Route path="/add" element={<AddVessel />} />
          <Route path="/edit/:id" element={<EditVessel />} />
          <Route path="/embed" element={<EmbedCodePage />} />
          <Route path="/embed-view" element={<EmbedView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
