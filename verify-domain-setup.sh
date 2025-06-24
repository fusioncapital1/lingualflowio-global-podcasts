
#!/bin/bash

DOMAIN="podcast.lingualflowio.com"
REGION="europe-west1"

echo "🔍 Checking domain mapping status..."

# Check if domain mapping exists
gcloud run domain-mappings describe $DOMAIN --region=$REGION --format="table(metadata.name,status.conditions[].type,status.conditions[].status)" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Domain mapping exists!"
    echo ""
    echo "🔍 Testing domain resolution..."
    nslookup $DOMAIN
    echo ""
    echo "🌐 Testing HTTPS access..."
    curl -I https://$DOMAIN 2>/dev/null | head -n 1
else
    echo "❌ Domain mapping not found. Run setup-custom-domain.sh first."
fi
