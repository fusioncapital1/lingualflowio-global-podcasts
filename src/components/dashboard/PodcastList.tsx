
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Globe, Play, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  original_language: string;
}

const PodcastList = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPodcasts();
    }
  }, [user]);

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPodcasts(data || []);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Podcasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Your Podcasts
        </CardTitle>
        <CardDescription>
          Manage and translate your uploaded podcasts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {podcasts.length === 0 ? (
          <div className="text-center py-8">
            <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No podcasts uploaded yet</p>
            <p className="text-sm text-gray-400">Upload your first podcast to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {podcasts.map((podcast) => (
              <div key={podcast.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{podcast.title}</h3>
                    {podcast.description && (
                      <p className="text-gray-600 text-sm mt-1">{podcast.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(podcast.status)}>
                        {podcast.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(podcast.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Globe className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PodcastList;
