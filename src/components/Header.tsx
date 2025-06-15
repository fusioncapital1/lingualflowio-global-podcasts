
import { Button } from "@/components/ui/button";
import { Mic, Menu } from "lucide-react";
import { useState } from "react";
import AuthModal from "./auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LinguaFlow
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
                Pricing
              </a>
              <a href="#demo" className="text-gray-600 hover:text-purple-600 transition-colors">
                Demo
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="hidden md:flex" onClick={() => setShowAuthModal(true)}>
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Start Free Trial
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;
