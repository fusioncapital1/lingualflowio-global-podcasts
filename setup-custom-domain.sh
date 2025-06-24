
#!/bin/bash

# Set your variables
PROJECT_ID="lingualflowio"
SERVICE_NAME="lingualflowio-global-podcasts"
REGION="europe-west1"
DOMAIN="podcast.lingualflowio.com"

echo "🌐 Setting up custom domain: $DOMAIN"
echo "📍 For service: $SERVICE_NAME in region: $REGION"

# Set the project
gcloud config set project $PROJECT_ID

# Enable the necessary APIs
echo "📋 Enabling Domain Mapping API..."
gcloud services enable domains.googleapis.com --quiet

# Create the domain mapping
echo "🔗 Creating domain mapping..."
gcloud run domain-mappings create \
  --service=$SERVICE_NAME \
  --domain=$DOMAIN \
  --region=$REGION \
  --platform=managed

# Get the DNS records that need to be configured
echo "📋 Getting DNS configuration..."
gcloud run domain-mappings describe $DOMAIN --region=$REGION --format="value(status.resourceRecords[].name,status.resourceRecords[].rrdata)" > dns-records.txt

echo "✅ Domain mapping created!"
echo ""
echo "📋 Next steps:"
echo "1. Add these DNS records to your domain (lingualflowio.com) in Google Workspace:"
echo ""
echo "🔍 DNS Records needed:"
gcloud run domain-mappings describe $DOMAIN --region=$REGION --format="table(status.resourceRecords[].name,status.resourceRecords[].type,status.resourceRecords[].rrdata)"

echo ""
echo "💡 In Google Workspace Admin Console:"
echo "1. Go to Apps > Google Workspace > Gmail > Routing"
echo "2. Or go to Domains section and add DNS records"
echo "3. Add a CNAME record: podcast -> ghs.googlehosted.com"
echo ""
echo "⏳ DNS propagation can take up to 24 hours"
echo "🌐 Once ready, your app will be available at: https://$DOMAIN"
