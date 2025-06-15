
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Brain, Mic2, FileAudio, Languages, Sparkles } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Translation",
      description: "Advanced neural networks ensure context-aware translations that maintain your podcast's personality and tone.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Mic2,
      title: "Voice Cloning",
      description: "Generate translated episodes in your own voice using cutting-edge voice synthesis technology.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileAudio,
      title: "Auto Transcription",
      description: "Convert speech to text with 99% accuracy using OpenAI Whisper technology.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Languages,
      title: "30+ Languages",
      description: "Reach audiences in Spanish, French, German, Japanese, Mandarin, and 25+ more languages.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process a 60-minute episode in under 10 minutes with our optimized AI pipeline.",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: Sparkles,
      title: "Smart Editing",
      description: "AI automatically handles filler words, pauses, and formatting for professional results.",
      gradient: "from-teal-500 to-blue-500"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Powerful Features for Global Podcasters
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to transform your podcast into a global phenomenon
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
