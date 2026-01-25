# Flash Drop ⚡️

Ultra-simple file sharing for everyone. No login required.

## 🚀 Features
- **Drag & Drop Upload**: Instant file sharing.
- **Short Codes**: Share files via a simple 6-digit code.
- **Auto-Expiry**: Files are automatically deleted after 1 hour.
- **No Login**: Completely anonymous and frictionless.
- **Responsive**: Works on mobile and desktop.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Multer
- **Storage**: Local filesystem (temporary)

## 🏃‍♂️ How to Run

### Prerequisites
- Node.js installed

### 1. Start the Backend
```bash
cd server
npm install
node index.js
```
Server will run on `http://localhost:3000`.

### 2. Start the Frontend
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
Client will run on `http://localhost:5173`.

## 📝 Usage
1. Open `http://localhost:5173`
2. Drop a file to upload.
3. Share the **6-digit code** or the **link** with someone.
4. They open the link or enter the code at `http://localhost:5173/d`.
5. Download starts!

## ⚠️ Notes
- Files are stored in `server/uploads`.
- Data is stored in-memory, so restarting the server clears the database (but not the files in `uploads` - manual cleanup or server logic handles that).
