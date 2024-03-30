import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';

// const __dirname = dirname(__filename);

// Set up the gapi authentication
const auth = new google.auth.GoogleAuth({
    keyFile: './google-credentials.json',
    scopes: ['https://www.googleapis.com/auth/youtube.upload']
});

const TOKEN_PATH = `./google-access-token.json`;

// Function to authenticate and get the access token
async function getAccessToken() {
    // Check if we have a saved token
    if (fs.existsSync(TOKEN_PATH)) {
        console.log("foundAccessToken()");
        const tokenData = fs.readFileSync(TOKEN_PATH);
        const token = JSON.parse(tokenData);
        const expiryDate = new Date(token.expiry_date);

        // If the token is still valid, return it
        if (expiryDate > new Date()) {
            return token.access_token;
        }
    }

    console.log("getAccessToken()");
    const authToken = await auth.getClient();
    const accessToken = await authToken.getAccessToken();

    // Save the token
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(accessToken.token));

    return accessToken.token;
}

// Function to upload the video to YouTube
export async function uploadToYoutube(filepath) {
    try {
        let accessToken = await getAccessToken();

        // Create a YouTube API client
        let youtube = google.youtube({
            version: 'v3',
            auth: accessToken
        });

        // Try to upload the video
        try {
            const videoData = fs.createReadStream(filepath);
            console.log("video stream created");
            
            const res = await youtube.videos.insert({
                part: 'snippet,status',
                requestBody: {
                    snippet: {
                        title: 'My Uploaded Video',
                        description: 'Description of my uploaded video'
                    },
                    status: {
                        privacyStatus: 'public'
                    }
                },
                media: {
                    body: videoData
                }
            });

            console.log(`Video uploaded with ID: ${res.data.id}`);
        } catch (error) {
            // If the token has expired, refresh it and retry the upload
            if (error.code === 401) {
                accessToken = await getAccessToken();
                youtube = google.youtube({
                    version: 'v3',
                    auth: accessToken
                });

                // Retry the upload
                // ... (same code as above)
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error uploading video:', error);
    }
}