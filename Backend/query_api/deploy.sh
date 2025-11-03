#!/bin/bash

# Backend deployment script for Cloud Run

echo "🚀 Starting ClearChartAI backend deployment to Cloud Run..."

# Set variables
PROJECT_ID="sunlit-adviser-471323-p0"
SERVICE_NAME="clearchartai-api"
REGION="us-central1"

# Build and deploy to Cloud Run
echo "📦 Building and deploying to Cloud Run..."

gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,ENVIRONMENT=production \
  --project $PROJECT_ID

# Check if deployment succeeded
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Note the service URL shown above"
    echo "2. Update frontend/.env.production with the backend URL"
    echo "3. Map custom domain: gcloud run domain-mappings create --service $SERVICE_NAME --domain api.clearchartai.io --region $REGION --project $PROJECT_ID"
else
    echo "❌ Deployment failed"
    exit 1
fi
