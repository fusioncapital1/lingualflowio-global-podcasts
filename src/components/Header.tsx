
import { Button } from "@/components/ui/button";
import { Mic, Menu, X } from "lucide-react";
import { useState } from "react";
import AuthModal from "./auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

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
                LingualFlowio
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
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hidden md:flex"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="hidden md:flex" onClick={() => setShowAuthModal(true)}>
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hidden md:flex"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Start Free Trial
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={toggleMobileMenu}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4 pt-4">
                <a 
                  href="#features" 
                  className="text-gray-600 hover:text-purple-600 transition-colors px-2 py-1"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  className="text-gray-600 hover:text-purple-600 transition-colors px-2 py-1"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Pricing
                </a>
                <a 
                  href="#demo" 
                  className="text-gray-600 hover:text-purple-600 transition-colors px-2 py-1"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Demo
                </a>
                <div className="flex flex-col space-y-2 pt-2">
                  {user ? (
                    <Button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full"
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => {
                          setShowAuthModal(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full"
                        onClick={() => {
                          setShowAuthModal(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        Start Free Trial
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;
