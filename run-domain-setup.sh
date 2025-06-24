
#!/bin/bash

# Make the setup script executable and run it
chmod +x setup-custom-domain.sh
./setup-custom-domain.sh

echo ""
echo "🎯 SUMMARY FOR YOU:"
echo "================================"
echo "✅ Domain mapping created for: podcast.lingualflowio.com"
echo "🔧 Next step: Add DNS records to your Google Workspace domain"
echo ""
echo "📋 Go to your Google Workspace Admin Console:"
echo "1. Sign in to admin.google.com"
echo "2. Go to Domains"
echo "3. Click on lingualflowio.com"
echo "4. Add DNS records (the script above shows exactly what to add)"
echo ""
echo "⏰ Wait 1-24 hours for DNS to propagate"
echo "🌐 Then visit: https://podcast.lingualflowio.com"
