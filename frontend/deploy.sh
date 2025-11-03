#!/bin/bash

# Frontend deployment script

echo "🚀 Starting ClearChartAI frontend deployment..."

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Build production frontend
echo "📦 Building production frontend..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"

    # Deploy to Firebase Hosting
    echo "🚀 Deploying to Firebase Hosting..."
    firebase deploy --only hosting

    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Your site is live at: https://clearchartai.io"
    else
        echo "❌ Deployment failed"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi
