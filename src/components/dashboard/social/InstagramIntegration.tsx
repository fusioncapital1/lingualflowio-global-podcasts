
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Instagram, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InstagramIntegrationProps {
  onConnectionChange: (platform: string, connected: boolean, username?: string) => void;
}

const InstagramIntegration = ({ onConnectionChange }: InstagramIntegrationProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate Instagram OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUsername = 'yourpodcast';
      setConnected(true);
      setUsername(mockUsername);
      onConnectionChange('instagram', true, mockUsername);
      
      toast({
        title: "Instagram Connected!",
        description: "Successfully connected your Instagram account.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Instagram. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setUsername('');
    onConnectionChange('instagram', false);
    
    toast({
      title: "Instagram Disconnected",
      description: "Your Instagram account has been disconnected.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <Instagram className="h-4 w-4 text-white" />
          </div>
          Instagram
        </CardTitle>
        <CardDescription>
          Share podcast highlights as posts and stories with auto-generated audiograms
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
                Use Zapier to automate Instagram posting
              </p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isConnecting ? "Connecting..." : "Connect Instagram"}
            </Button>
            
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a 
                href="https://developers.facebook.com/apps/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:underline"
              >
                Get Instagram Basic Display API access
              </a>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">@{username}</div>
                <div className="text-sm text-gray-600">Ready to post content</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
            
            <div className="text-sm space-y-2">
              <p><strong>Features enabled:</strong></p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Auto-post audiograms</li>
                <li>Stories with episode highlights</li>
                <li>Multi-language captions</li>
                <li>Podcast artwork overlays</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstagramIntegration;
