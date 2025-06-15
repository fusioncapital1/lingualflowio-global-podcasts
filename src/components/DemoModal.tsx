
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Play, Upload, Globe, Download } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: Upload,
      title: "Upload Your Podcast",
      description: "Simply drag and drop your audio file or paste a URL from your podcast platform.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Globe,
      title: "Select Target Languages",
      description: "Choose from 30+ languages including Spanish, French, German, Japanese, and more.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Play,
      title: "AI Processing",
      description: "Our AI transcribes, translates, and generates voice in your selected languages.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Download,
      title: "Download & Distribute",
      description: "Get your translated episodes ready for distribution on any platform.",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            How LinguaFlow Works
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Demo Video Placeholder */}
          <div className="aspect-video bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="h-16 w-16 mx-auto mb-4" />
              <p className="text-xl font-semibold">Demo Video</p>
              <p className="text-sm opacity-90">See LinguaFlow in action</p>
            </div>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to Transform Your Podcast?</h3>
            <p className="text-gray-600 mb-4">Join thousands of podcasters reaching global audiences</p>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Play className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoModal;
