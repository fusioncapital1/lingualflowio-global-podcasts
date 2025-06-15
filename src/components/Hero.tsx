
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Globe, Users, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Reach Global Audiences with AI-Powered Podcast Translation
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your podcast into 30+ languages in minutes. Break language barriers and unlock millions of new listeners worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Try Free Demo
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-purple-200 hover:border-purple-300">
              Watch How It Works
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white/60 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">30+ Languages</h3>
                <p className="text-gray-600">Expand globally with support for major world languages</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">75% More Reach</h3>
                <p className="text-gray-600">Access untapped audiences in global markets</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">10x Faster</h3>
                <p className="text-gray-600">AI translation in minutes, not weeks</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-100">
            <div className="aspect-video bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Button size="lg" variant="secondary" className="bg-white/90 hover:bg-white text-purple-600">
                <Play className="mr-2 h-6 w-6" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
