# P2P File Transfer Application

This application enables file transfers between users in a peer-to-peer (P2P) model, where users identify themselves using pseudonyms instead of IP addresses.

## Features

- Users log in using pseudonyms
- Pseudonyms are stored locally, eliminating the need to enter them each time
- Direct file sending to other users
- Incoming file notifications with options:
  - "Yes" - accept and download the file
  - "No" - reject the transfer
  - "View Content" - preview the file before downloading
- Support for various file types (images, audio, video, PDF, text)
- File upload progress indicator

## Technologies

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## Installation

1. Clone the repository:
   ```
   git clone <repository-address>
   cd p2p-file-transfer-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the application:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use

1. Enter your pseudonym and click "Login"
2. After logging in, you'll see a list of available users on the left side
3. Click on the pseudonym of the user you want to send a file to
4. Select a file using the "Choose file" button
5. Click "Send" to start the transfer
6. The recipient will receive a notification about the incoming file and can accept, reject, or view its content

## Development Mode

To run the application with automatic reloading after changes:
```
npm run dev
```

## Project Structure

- `server.js` - main server file
- `public/` - static files (HTML, CSS, JS)
  - `index.html` - user interface
  - `style.css` - styles
  - `client.js` - client logic
- `user-data/` - directory for user data (created automatically)

## License

MIT
