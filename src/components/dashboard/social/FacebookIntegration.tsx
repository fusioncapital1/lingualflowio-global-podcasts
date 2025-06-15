
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Facebook, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FacebookIntegrationProps {
  onConnectionChange: (platform: string, connected: boolean, username?: string) => void;
}

const FacebookIntegration = ({ onConnectionChange }: FacebookIntegrationProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [pageName, setPageName] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate Facebook OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPageName = 'Your Podcast Page';
      setConnected(true);
      setPageName(mockPageName);
      onConnectionChange('facebook', true, mockPageName);
      
      toast({
        title: "Facebook Connected!",
        description: "Successfully connected your Facebook page.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Facebook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setPageName('');
    onConnectionChange('facebook', false);
    
    toast({
      title: "Facebook Disconnected",
      description: "Your Facebook page has been disconnected.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Facebook className="h-4 w-4 text-white" />
          </div>
          Facebook
        </CardTitle>
        <CardDescription>
          Share podcasts on your Facebook page with automatic event creation and community engagement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <>
            <div>
              <label className="text-sm font-medium">Zapier Webhook URL (Optional)</label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use Zapier to automate Facebook posting
              </p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? "Connecting..." : "Connect Facebook"}
            </Button>
            
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a 
                href="https://developers.facebook.com/apps/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Get Facebook Graph API access
              </a>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">{pageName}</div>
                <div className="text-sm text-gray-600">Ready to share posts</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
            
            <div className="text-sm space-y-2">
              <p><strong>Features enabled:</strong></p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Auto-post new episodes</li>
                <li>Create listening events</li>
                <li>Multi-language descriptions</li>
                <li>Community engagement tools</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacebookIntegration;
