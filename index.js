import chokidar from 'chokidar';
import { uploadToYoutube } from './src/youtube.js';
import { uploadToTiktok } from './src/tiktok.js';


// Check if a directory was provided as a command-line argument
if (process.argv.length < 3) {
    console.error('Please provide a directory to watch as a command-line argument.');
    process.exit(1);
}

const folderPath = process.argv[2]; // Use the directory provided as a command-line argument

const watcher = chokidar.watch(folderPath, {
    ignored: /^\./, // Ignore dotfiles
    persistent: true // Keep watching even if there are no listeners
});

watcher
    .on('add', (filePath) => {
        console.log(`New file added: ${filePath}`);
        (async () => {
            try {
                await Promise.all([
                    uploadToYoutube(filePath),
                    uploadToTiktok(filePath)
                ]);
                console.log('Both uploads completed successfully');
                // Delete the file here
            } catch (error) {
                console.error(`Error occurred during upload: ${error}`);
                // Handle error and continue with the rest of the upload calls
            }
        })();
        console.log("donezo");
        // Do something with the new file
    })
    .on('error', (error) => {
        console.error(`Watcher error: ${error}`);
    });