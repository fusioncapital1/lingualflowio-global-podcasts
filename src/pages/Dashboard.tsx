
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast'; // For error notifications
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Globe, Mic, Users, Crown, Calendar } from 'lucide-react';
import PodcastUpload from '@/components/dashboard/PodcastUpload';
import PodcastList from '@/components/dashboard/PodcastList';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { subscribed, subscriptionTier, subscriptionEnd, openCustomerPortal, checkSubscription } = useSubscription();

  const [totalPodcasts, setTotalPodcasts] = useState<number>(0);
  const [distinctLanguagesTranslated, setDistinctLanguagesTranslated] = useState<number>(0);
  const [podcastsProcessing, setPodcastsProcessing] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  const fetchDashboardStats = useCallback(async () => {
    if (!user) return;

    setLoadingStats(true);
    try {
      // 1. Total Podcasts
      const { count: podcastCount, error: podcastError } = await supabase
        .from('podcasts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (podcastError) throw podcastError;
      setTotalPodcasts(podcastCount || 0);

      // 2. Distinct Languages Translated (requires user's podcast IDs first)
      const { data: userPodcasts, error: userPodcastsError } = await supabase
        .from('podcasts')
        .select('id')
        .eq('user_id', user.id);

      if (userPodcastsError) throw userPodcastsError;

      if (userPodcasts && userPodcasts.length > 0) {
        const userPodcastIds = userPodcasts.map(p => p.id);
        const { data: translatedEpisodes, error: translatedEpisodesError } = await supabase
          .from('translated_episodes')
          .select('language_code')
          .in('podcast_id', userPodcastIds)
          .eq('status', 'completed');

        if (translatedEpisodesError) throw translatedEpisodesError;

        const distinctLangs = new Set(translatedEpisodes?.map(ep => ep.language_code) || []);
        setDistinctLanguagesTranslated(distinctLangs.size);
      } else {
        setDistinctLanguagesTranslated(0);
      }

      // 3. Podcasts Processing
      const processingStatuses = ['processing', 'transcribing', 'pending_transcription', 'translation_in_progress']; // Define your processing statuses
      const { count: processingCount, error: processingError } = await supabase
        .from('podcasts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', processingStatuses);

      if (processingError) throw processingError;
      setPodcastsProcessing(processingCount || 0);

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Stats Error",
        description: `Failed to load dashboard statistics: ${error.message}`,
        variant: "destructive",
      });
      // Keep existing values or reset to 0 on error? For now, keep existing.
    } finally {
      setLoadingStats(false);
    }
  }, [user]); // Dependency: user

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      // Also refresh subscription status if needed, or assume it's handled by useSubscription
      checkSubscription();
    }
  }, [user, fetchDashboardStats, checkSubscription]);


  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
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
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.user_metadata?.full_name || user?.email}</span>
              <Button variant="ghost" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Subscription Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-purple-600" />
              Subscription Status
            </CardTitle>
            <CardDescription>
              Manage your LinguaFlow subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Plan:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    subscribed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscriptionTier || 'Free Trial'}
                  </span>
                </div>
                {subscriptionEnd && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Renews: {formatDate(subscriptionEnd)}</span>
                  </div>
                )}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={checkSubscription}>
                  Refresh Status
                </Button>
                {subscribed && (
                  <Button onClick={openCustomerPortal}>
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Podcasts</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : totalPodcasts}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalPodcasts === 1 ? "podcast uploaded" : "podcasts uploaded"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : distinctLanguagesTranslated}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique languages translated
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : podcastsProcessing}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">∞</div>
              <p className="text-xs text-muted-foreground">
                Global audience potential
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PodcastUpload />
          <PodcastList />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
