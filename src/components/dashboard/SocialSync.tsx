
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Twitter, Youtube, Instagram, Facebook, Settings, Globe, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import TwitterIntegration from './social/TwitterIntegration';
import YouTubeIntegration from './social/YouTubeIntegration';
import InstagramIntegration from './social/InstagramIntegration';
import FacebookIntegration from './social/FacebookIntegration';

interface SocialAccount {
  platform: string;
  connected: boolean;
  username?: string;
  lastSync?: string;
  autoPost: boolean;
}

const SocialSync = () => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: 'twitter', connected: false, autoPost: false },
    { platform: 'youtube', connected: false, autoPost: false },
    { platform: 'instagram', connected: false, autoPost: false },
    { platform: 'facebook', connected: false, autoPost: false },
  ]);

  const [postTemplate, setPostTemplate] = useState({
    title: '🎙️ New multilingual podcast episode available!',
    description: 'Check out our latest episode now available in {{languages}} languages. Breaking language barriers, one podcast at a time! #GlobalPodcast #Multilingual',
    hashtags: '#LingualFlowio #GlobalPodcast #Multilingual #PodcastTranslation',
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);

  const platformIcons = {
    twitter: Twitter,
    youtube: Youtube,
    instagram: Instagram,
    facebook: Facebook,
  };

  const platformColors = {
    twitter: 'bg-blue-500',
    youtube: 'bg-red-600',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    facebook: 'bg-blue-600',
  };

  const updateAccountConnection = (platform: string, connected: boolean, username?: string) => {
    setSocialAccounts(prev => 
      prev.map(account => 
        account.platform === platform 
          ? { ...account, connected, username, lastSync: connected ? new Date().toISOString() : undefined }
          : account
      )
    );
  };

  const toggleAutoPost = (platform: string) => {
    setSocialAccounts(prev => 
      prev.map(account => 
        account.platform === platform 
          ? { ...account, autoPost: !account.autoPost }
          : account
      )
    );
  };

  const handleBulkPost = async () => {
    const connectedAccounts = socialAccounts.filter(acc => acc.connected && acc.autoPost);
    
    if (connectedAccounts.length === 0) {
      toast({
        title: "No platforms enabled",
        description: "Please connect and enable auto-posting for at least one platform.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);
    
    try {
      // Simulate posting to all connected platforms
      for (const account of connectedAccounts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        toast({
          title: `Posted to ${account.platform}`,
          description: `Successfully shared to @${account.username}`,
        });
      }

      toast({
        title: "Bulk posting complete!",
        description: `Posted to ${connectedAccounts.length} platforms successfully.`,
      });
    } catch (error) {
      toast({
        title: "Posting failed",
        description: "Some posts may not have been published. Please check your connections.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Media Sync
          </CardTitle>
          <CardDescription>
            Automatically share your multilingual podcasts across all social platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {socialAccounts.map((account) => {
              const Icon = platformIcons[account.platform as keyof typeof platformIcons];
              const colorClass = platformColors[account.platform as keyof typeof platformColors];
              
              return (
                <Card key={account.platform} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium capitalize">{account.platform}</span>
                      </div>
                      {account.connected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant={account.connected ? "default" : "secondary"}>
                        {account.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                      
                      {account.connected && account.username && (
                        <p className="text-sm text-gray-600">@{account.username}</p>
                      )}
                      
                      {account.connected && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Auto-post</span>
                          <Switch
                            checked={account.autoPost}
                            onCheckedChange={() => toggleAutoPost(account.platform)}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="connect" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connect">Connect</TabsTrigger>
              <TabsTrigger value="template">Templates</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="connect" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TwitterIntegration onConnectionChange={updateAccountConnection} />
                <YouTubeIntegration onConnectionChange={updateAccountConnection} />
                <InstagramIntegration onConnectionChange={updateAccountConnection} />
                <FacebookIntegration onConnectionChange={updateAccountConnection} />
              </div>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Post Templates</CardTitle>
                  <CardDescription>
                    Customize how your podcast announcements appear on social media
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Post Title</label>
                    <Input
                      value={postTemplate.title}
                      onChange={(e) => setPostTemplate(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter post title..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={postTemplate.description}
                      onChange={(e) => setPostTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter post description..."
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use {{`{languages}`}} to automatically insert available languages
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Hashtags</label>
                    <Input
                      value={postTemplate.hashtags}
                      onChange={(e) => setPostTemplate(prev => ({ ...prev, hashtags: e.target.value }))}
                      placeholder="Enter hashtags..."
                    />
                  </div>
                  
                  <Button className="w-full">Save Template</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Actions</CardTitle>
                  <CardDescription>
                    Post to all connected platforms at once
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleBulkPost} 
                      disabled={isScheduling}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isScheduling ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Post to All Platforms
                        </>
                      )}
                    </Button>
                    
                    <Badge variant="outline">
                      {socialAccounts.filter(acc => acc.connected && acc.autoPost).length} platforms enabled
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    This will post your latest podcast episode to all connected platforms with auto-posting enabled.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Performance</CardTitle>
                  <CardDescription>
                    Track engagement across all platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2.5K</div>
                      <div className="text-sm text-gray-600">Total Reach</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">847</div>
                      <div className="text-sm text-gray-600">Engagements</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">12</div>
                      <div className="text-sm text-gray-600">Posts This Month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialSync;
