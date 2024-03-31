import { readFileSync, writeFileSync } from 'fs';

// Function to upload a file to TikTok
export async function uploadToTiktok(pathToFile) {
    // Check if access token exists in a text file
    let accessToken;
    try {
        accessToken = readFileSync('access_token.txt', 'utf8');
    } catch (err) {
        // Access token doesn't exist, generate a new one
        const refreshToken = 'your_refresh_token'; // Replace with your refresh token
        accessToken = await getAccessToken(refreshToken);
        writeFileSync('access_token.txt', accessToken);
    }

    // Upload the file using the access token
    const videoData = readFileSync(pathToFile);
    const response = await fetch('https://api.tiktok.com/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'video/mp4',
            'Authorization': `Bearer ${accessToken}`
        },
        body: videoData
    });

    return response.data;
}

// Function to get a new access token using a refresh token
async function getAccessToken(refreshToken) {
    // Call TikTok API to get a new access token using the refresh token
    const response = await fetch('https://api.tiktok.com/oauth/refresh_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        })
    });

    return response.data.access_token;
}

// Usage example
// const pathToFile = '/path/to/video.mp4';
// uploadToTiktok(pathToFile)
//     .then(result => {
//         console.log('Upload successful:', result);
//     })
//     .catch(error => {
//         console.error('Upload failed:', error);
//     });