
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Twitter, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TwitterIntegrationProps {
  onConnectionChange: (platform: string, connected: boolean, username?: string) => void;
}

const TwitterIntegration = ({ onConnectionChange }: TwitterIntegrationProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate Twitter OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUsername = 'YourPodcast';
      setConnected(true);
      setUsername(mockUsername);
      onConnectionChange('twitter', true, mockUsername);
      
      toast({
        title: "Twitter Connected!",
        description: "Successfully connected your Twitter account.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Twitter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setUsername('');
    onConnectionChange('twitter', false);
    
    toast({
      title: "Twitter Disconnected",
      description: "Your Twitter account has been disconnected.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Twitter className="h-4 w-4 text-white" />
          </div>
          Twitter / X
        </CardTitle>
        <CardDescription>
          Share your podcasts as tweets with automatic threading for long content
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
                Use Zapier to automate posting to Twitter
              </p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {isConnecting ? "Connecting..." : "Connect Twitter"}
            </Button>
            
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a 
                href="https://developer.twitter.com/en/portal/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Get Twitter API access
              </a>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Connected as @{username}</div>
                <div className="text-sm text-gray-600">Ready to post tweets</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
            
            <div className="text-sm space-y-2">
              <p><strong>Features enabled:</strong></p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Auto-tweet new episodes</li>
                <li>Thread long descriptions</li>
                <li>Include language tags</li>
                <li>Add podcast artwork</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwitterIntegration;
