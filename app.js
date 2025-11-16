// YouTube Player Application
class YouTubePlayer {
    constructor() {
        this.recentVideos = [];
        this.maxRecentVideos = 5;
        this.init();
    }

    init() {
        this.bindEvents();
        this.focusInput();
    }

    bindEvents() {
        const urlInput = document.getElementById('urlInput');
        const playButton = document.getElementById('playButton');

        // Play button click
        playButton.addEventListener('click', () => {
            this.playVideo();
        });

        // Enter key press
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.playVideo();
            }
        });

        // Clear error on input
        urlInput.addEventListener('input', () => {
            this.hideError();
        });
    }

    focusInput() {
        const urlInput = document.getElementById('urlInput');
        urlInput.focus();
    }

    extractVideoId(url) {
        if (!url) return null;

        // Remove whitespace
        url = url.trim();

        // Regular expressions for different YouTube URL formats
        const patterns = [
            // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            // Shortened URL: https://youtu.be/VIDEO_ID
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            // Embed URL: https://www.youtube.com/embed/VIDEO_ID
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            // Mobile URL: https://m.youtube.com/watch?v=VIDEO_ID
            /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            // Additional patterns with parameters
            /youtube\.com.*[?&]v=([a-zA-Z0-9_-]{11})/,
            // Just the video ID
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    isValidVideoId(videoId) {
        return videoId && videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId);
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.classList.add('hidden');
    }

    showLoading() {
        const loadingElement = document.getElementById('loadingIndicator');
        loadingElement.classList.remove('hidden');
    }

    hideLoading() {
        const loadingElement = document.getElementById('loadingIndicator');
        loadingElement.classList.add('hidden');
    }

    async playVideo() {
        const urlInput = document.getElementById('urlInput');
        const playButton = document.getElementById('playButton');
        const url = urlInput.value.trim();

        if (!url) {
            this.showError('Please enter a YouTube URL');
            return;
        }

        // Extract video ID
        const videoId = this.extractVideoId(url);

        if (!videoId || !this.isValidVideoId(videoId)) {
            this.showError('Invalid YouTube URL. Please check the URL and try again.');
            return;
        }

        // Disable button and show loading
        playButton.disabled = true;
        this.hideError();
        this.showLoading();

        try {
            // Get video title (basic implementation)
            const videoTitle = await this.getVideoTitle(videoId);
            
            // Load the video
            this.loadVideo(videoId);
            
            // Add to recent videos
            this.addToRecent({
                id: videoId,
                title: videoTitle,
                timestamp: new Date()
            });

            // Clear input
            urlInput.value = '';

        } catch (error) {
            console.error('Error loading video:', error);
            this.showError('Error loading video. Please try again.');
        } finally {
            playButton.disabled = false;
            this.hideLoading();
        }
    }

    async getVideoTitle(videoId) {
        // Simple fallback title since we can't make API calls without keys
        return `YouTube Video (${videoId})`;
    }

    loadVideo(videoId) {
        const videoPlayer = document.getElementById('videoPlayer');
        const iframe = document.getElementById('youtubeIframe');
        
        // Build embed URL with autoplay
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        
        iframe.src = embedUrl;
        videoPlayer.classList.remove('hidden');

        // Scroll to video
        videoPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    addToRecent(video) {
        // Remove duplicate if exists
        this.recentVideos = this.recentVideos.filter(v => v.id !== video.id);
        
        // Add to beginning
        this.recentVideos.unshift(video);
        
        // Limit to max count
        if (this.recentVideos.length > this.maxRecentVideos) {
            this.recentVideos = this.recentVideos.slice(0, this.maxRecentVideos);
        }
        
        this.updateRecentVideosList();
    }

    updateRecentVideosList() {
        const listElement = document.getElementById('recentVideosList');
        
        if (this.recentVideos.length === 0) {
            listElement.innerHTML = '<p class="no-videos">No recent videos</p>';
            return;
        }

        listElement.innerHTML = this.recentVideos.map(video => `
            <div class="recent-video-item" data-video-id="${video.id}">
                <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" 
                     alt="${video.title}" 
                     class="recent-video-thumbnail"
                     onerror="this.style.display='none'">
                <div class="recent-video-info">
                    <div class="recent-video-title">${video.title}</div>
                    <div class="recent-video-date">${this.formatDate(video.timestamp)}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        listElement.querySelectorAll('.recent-video-item').forEach(item => {
            item.addEventListener('click', () => {
                const videoId = item.dataset.videoId;
                this.loadVideo(videoId);
            });
        });
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    // Method to play a video directly by ID (for recent videos)
    playVideoById(videoId) {
        if (!this.isValidVideoId(videoId)) {
            this.showError('Invalid video ID');
            return;
        }

        this.loadVideo(videoId);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new YouTubePlayer();
});

// Add some sample functionality for demonstration
document.addEventListener('DOMContentLoaded', () => {
    // Add sample recent videos for demonstration (optional)
    const player = new YouTubePlayer();
    
    // You can uncomment the following to add sample recent videos
    // setTimeout(() => {
    //     player.addToRecent({
    //         id: 'dQw4w9WgXcQ',
    //         title: 'Rick Astley - Never Gonna Give You Up',
    //         timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    //     });
    // }, 1000);
});