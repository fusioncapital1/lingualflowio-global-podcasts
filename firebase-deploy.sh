
#!/bin/bash

echo "🚀 Deploying LinguaFlowio to Firebase Hosting..."

# Install Firebase CLI if not already installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Login to Firebase (if not already logged in)
echo "🔐 Logging into Firebase..."
firebase login

# Initialize Firebase project (if needed)
echo "🏗️ Setting up Firebase project..."
firebase use lingualflowio --add

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at: https://lingualflowio.web.app"
echo "🌐 Alternative URL: https://lingualflowio.firebaseapp.com"
