
# Vortica - Video Editor API

## 📖 Overview

Vortica is a powerful API inspired by YouTube, designed to manage videos, playlists, comments, tweets, subscriptions, and likes. This document provides a comprehensive guide to its functionalities, API endpoints, and installation steps.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB, Mongoose
-   **Authentication**: JWT (JSON Web Tokens), bcrypt
-   **Cloud Storage**: Cloudinary
-   **File Upload**: Multer
-   **Environment Variables**: dotenv

## 📥 Installation & Setup

### Prerequisites

-   Node.js installed
-   MongoDB instance (local or cloud-based)
-   Cloudinary account for media storage

### Steps to Install & Run the Project

1.  Clone the repository:
    
    ```sh
    git clone https://github.com/yourusername/vortica.git
    cd vortica
    
    ```
    
2.  Install dependencies:
    
    ```sh
    npm install
    
    ```
    
3.  Create a `.env` file in the root directory and configure environment variables:
    
    ```env
    CLOUDINARY_CLOUD_NAME=your-cloud-name
    CLOUDINARY_API_KEY=your-api-key
    CLOUDINARY_API_SECRET=your-api-secret
    JWT_SECRET=your-secret-key
    MONGO_URI=your-mongodb-uri
    
    ```
    
4.  Start the development server:
    
    ```sh
    npm run dev
    
    ```
    
    For production:
    
    ```sh
    npm start
    
    ```
    

## 📌 API Endpoints

### 📄 Comment Routes

```sh
GET    /comment/getVideoComments/:videoId  # Fetch comments for a video
POST   /comment/addComment/:videoId       # Add a comment to a video
PUT    /comment/updateComment/:commentId  # Update a comment
DELETE /comment/deleteComment/:commentId  # Delete a comment

```

### 📊 Dashboard Routes

```sh
GET    /dashboard/getChannelStats/:creatorId  # Get channel statistics
GET    /dashboard/getChannelVideos/:creatorId # Fetch videos from a channel

```

### 👍 Like Routes

```sh
PUT    /like/toggleVideoLike/:videoId  # Like/Unlike a video
PUT    /like/toggleTweetLike/:tweetId  # Like/Unlike a tweet
PUT    /like/toggleCommentLike/:commentId # Like/Unlike a comment
GET    /like/getLikedVideos  # Get all liked videos

```

### 🎵 Playlist Routes

```sh
POST   /playlist/createPlaylist  # Create a new playlist
GET    /playlist/getUserPlaylists/:userId  # Get user’s playlists
GET    /playlist/getPlaylistById/:playlistId  # Get playlist details
PUT    /playlist/addVideoToPlaylist/:playlistId  # Add a video to a playlist
PUT    /playlist/removeVideoFromPlaylist/:playlistId  # Remove a video from a playlist
DELETE /playlist/deletePlaylist/:playlistId  # Delete a playlist
PUT    /playlist/updatePlaylist/:playlistId  # Update playlist details

```

### 📢 Subscription Routes

```sh
PUT    /subscription/toggleSubscription/:creatorId  # Subscribe/Unsubscribe from a channel
GET    /subscription/getChannelSubscriptions/:creatorId  # Get a creator's subscribers
GET    /subscription/getSubscribedChannels/:userId  # Get user’s subscribed channels

```

### 📝 Tweet Routes

```sh
POST   /tweet/create  # Create a tweet
PUT    /tweet/update/:tweetId  # Update a tweet
DELETE /tweet/delete/:tweetId  # Delete a tweet
GET    /tweet/getUserTweets/:userId  # Fetch user’s tweets

```

### 👤 User Routes

```sh
POST   /users/register  # Register a new user
POST   /users/login  # Log in a user
POST   /users/refreshToken  # Refresh JWT token
POST   /users/logout  # Log out a user

```

### 🎬 Video Routes

```sh
GET    /video/getAllVideos  # Get all videos
GET    /video/getVideoById/:videoId  # Fetch details of a specific video
POST   /video/publish  # Upload & publish a video
PUT    /video/update/:videoId  # Update video details
DELETE /video/delete/:videoId  # Delete a video
GET    /video/getAllUserVideos  # Get all videos uploaded by a user
PUT    /video/togglePublishedVideo/:videoId  # Publish/Unpublish a video

```

## 🚀 Future Enhancements

-   **Advanced Search**: Implement AI-powered search for video recommendations.
-   **Live Streaming**: Support for real-time video streaming.
-   **Monetization**: Introduce a payment gateway for premium features.

## 🤝 Contribution

Feel free to fork this project and submit pull requests for any feature enhancements or bug fixes.

