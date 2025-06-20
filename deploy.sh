
#!/bin/bash

# Set your Google Cloud project ID
PROJECT_ID="lingualflowio"

# Set the region for deployment
REGION="us-central1"

# Service name
SERVICE_NAME="lingualflowio-global-podcasts"

echo "🚀 Deploying LinguaFlowio to Google Cloud Run..."

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs with retry logic
echo "📋 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable containerregistry.googleapis.com --quiet
gcloud services enable artifactregistry.googleapis.com --quiet

# Wait a moment for IAM policies to propagate
echo "⏳ Waiting for IAM policies to propagate..."
sleep 10

# Build and deploy using Cloud Build with retry
echo "🔨 Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml . --timeout=1200s

# Get the service URL
echo "🔍 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)" 2>/dev/null)

if [ -z "$SERVICE_URL" ]; then
    echo "⚠️  Service URL not found, checking deployment status..."
    gcloud run services list --region=$REGION
else
    echo "✅ Deployment complete!"
    echo "🌐 Your app is live at: $SERVICE_URL"
    echo ""
    echo "📋 Next steps:"
    echo "1. Point lingualflowio.com to: $SERVICE_URL"
    echo "2. Google verification will work at: $SERVICE_URL/googlee5340da52b7cbe00.html"
    echo "3. Set up YouTube API with your live domain"
fi

echo ""
echo "🔧 For custom domain setup:"
echo "1. Go to Google Cloud Console > Cloud Run"
echo "2. Select your service: $SERVICE_NAME"
echo "3. Click 'Manage Custom Domains'"
echo "4. Add lingualflowio.com"
