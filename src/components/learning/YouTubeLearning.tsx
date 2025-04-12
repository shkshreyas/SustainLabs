import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, ThumbsUp, Eye, Calendar, Search, RefreshCw } from 'lucide-react';

// Types for YouTube API responses
interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

// API key for YouTube Data API v3
const API_KEY = 'AIzaSyCj_AxKAAYgCeN22OTreUwZsuTy83GKA08';

// Categories/topics for sustainability and educational videos
const TOPICS = [
  'sustainability',
  'renewable energy',
  'climate change',
  'green technology',
  'environmental conservation',
  'sustainable development',
  'carbon footprint',
  'eco-friendly',
  'clean energy',
  'circular economy'
];

const YouTubeLearning: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<string>('sustainability');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Function to fetch videos from YouTube API
  const fetchVideos = async (query: string, pageToken: string | null = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build the search URL
      let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${query}+sustainability+education&type=video&key=${API_KEY}`;
      
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }
      
      // Fetch videos
      const response = await fetch(url);
      const data: YouTubeSearchResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.items || 'Failed to fetch videos');
      }
      
      // Get video IDs for fetching statistics
      const videoIds = data.items.map(item => item.id.videoId).join(',');
      
      // Fetch video statistics
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();
      
      // Merge video details with their statistics
      const videosWithStats = data.items.map(video => {
        const videoStats = statsData.items.find(
          (item: any) => item.id === video.id.videoId
        );
        return {
          ...video,
          statistics: videoStats ? videoStats.statistics : null
        };
      });
      
      setVideos(videosWithStats);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching YouTube videos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount or when active topic changes
  useEffect(() => {
    fetchVideos(activeTopic);
  }, [activeTopic]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchVideos(searchQuery);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format view count with abbreviations (e.g., 1.5M, 320K)
  const formatViewCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-base-200 rounded-lg p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Play className="h-5 w-5 text-red-500" />
            Sustainability Learning Videos
          </h2>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="relative w-full md:w-auto">
            <div className="flex">
              <input
                type="text"
                placeholder="Search sustainability videos..."
                className="input input-bordered w-full md:w-64 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary ml-2"
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>

        {/* Topic filters */}
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              className={`btn btn-sm ${
                activeTopic === topic ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => setActiveTopic(topic)}
              disabled={loading}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center my-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Videos grid */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {videos.map((video) => (
              <div
                key={video.id.videoId}
                className="card bg-base-100 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <figure className="relative">
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-circle"
                    >
                      <Play className="h-6 w-6" />
                    </a>
                  </div>
                </figure>
                <div className="card-body p-4">
                  <h3 className="card-title text-sm font-semibold line-clamp-2">
                    {video.snippet.title}
                  </h3>
                  <p className="text-xs opacity-80 line-clamp-2">
                    {video.snippet.description}
                  </p>
                  <div className="flex justify-between items-center mt-3 text-xs opacity-70">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(video.snippet.publishedAt)}</span>
                    </div>
                    {video.statistics && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{formatViewCount(video.statistics.viewCount)}</span>
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          <span>{formatViewCount(video.statistics.likeCount || '0')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card-actions justify-end mt-3">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-outline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Watch
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No videos message */}
        {!loading && videos.length === 0 && !error && (
          <div className="text-center my-8">
            <p className="text-lg">No videos found. Try a different search term.</p>
          </div>
        )}

        {/* Load more button */}
        {nextPageToken && (
          <div className="flex justify-center mt-6">
            <button
              className="btn btn-outline"
              onClick={() => fetchVideos(activeTopic, nextPageToken)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Videos'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeLearning; 