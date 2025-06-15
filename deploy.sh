
#!/bin/bash

# Set your Google Cloud project ID
PROJECT_ID="your-project-id-here"

# Set the region for deployment
REGION="us-central1"

# Service name - keeping it short to avoid character limits
SERVICE_NAME="linguaflow"

echo "🚀 Deploying LinguaFlowio to Google Cloud Run..."

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy using Cloud Build
echo "🔨 Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml .

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: $SERVICE_URL"
echo ""
echo "📋 Next steps:"
echo "1. Set up custom domain mapping if desired"
echo "2. Configure SSL certificate (automatic with custom domain)"
echo "3. Set up monitoring and logging"
