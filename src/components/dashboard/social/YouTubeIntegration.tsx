
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Youtube, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface YouTubeIntegrationProps {
  onConnectionChange: (platform: string, connected: boolean, username?: string) => void;
}

const YouTubeIntegration = ({ onConnectionChange }: YouTubeIntegrationProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [channelName, setChannelName] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate YouTube OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockChannelName = 'Your Podcast Channel';
      setConnected(true);
      setChannelName(mockChannelName);
      onConnectionChange('youtube', true, mockChannelName);
      
      toast({
        title: "YouTube Connected!",
        description: "Successfully connected your YouTube channel.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to YouTube. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setChannelName('');
    onConnectionChange('youtube', false);
    
    toast({
      title: "YouTube Disconnected",
      description: "Your YouTube channel has been disconnected.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <Youtube className="h-4 w-4 text-white" />
          </div>
          YouTube
        </CardTitle>
        <CardDescription>
          Upload podcast episodes as videos with auto-generated subtitles in multiple languages
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
                Use Zapier to automate YouTube uploads
              </p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isConnecting ? "Connecting..." : "Connect YouTube"}
            </Button>
            
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a 
                href="https://console.developers.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-red-600 hover:underline"
              >
                Get YouTube Data API access
              </a>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">{channelName}</div>
                <div className="text-sm text-gray-600">Ready to upload videos</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
            
            <div className="text-sm space-y-2">
              <p><strong>Features enabled:</strong></p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Auto-upload podcast videos</li>
                <li>Multi-language subtitles</li>
                <li>Optimized thumbnails</li>
                <li>SEO-optimized descriptions</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeIntegration;
