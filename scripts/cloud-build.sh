#!/bin/bash

echo "☁️ Ionic Appflow Cloud Build - Raju's API Client"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Ionic CLI is installed
if ! command -v ionic &> /dev/null; then
    print_error "Ionic CLI not found. Install with: npm install -g @ionic/cli"
    exit 1
fi

# Step 1: Login to Ionic (if not already logged in)
print_status "Checking Ionic authentication..."
if ! ionic auth info &> /dev/null; then
    print_status "Logging into Ionic Appflow..."
    ionic login
fi

# Step 2: Link project to Appflow (if not already linked)
print_status "Linking project to Ionic Appflow..."
if [ ! -f ".ionic/ionic.project" ]; then
    print_status "Creating new Appflow project..."
    ionic link --create --name "rajus-api-client"
else
    print_status "Project already linked to Appflow"
fi

# Step 3: Commit latest changes
print_status "Preparing code for cloud build..."

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_status "Committing latest changes..."
    git add .
    
    # Get current timestamp for commit message
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    git commit -m "Cloud build: iOS release - $TIMESTAMP"
    
    print_success "Changes committed"
else
    print_status "No uncommitted changes found"
fi

# Step 4: Push to repository
print_status "Pushing to repository..."
git push origin main

if [ $? -ne 0 ]; then
    print_error "Failed to push to repository"
    exit 1
fi

print_success "Code pushed to repository"

# Step 5: Check if certificates are uploaded
print_status "Checking certificate status..."
echo ""
print_warning "IMPORTANT: Ensure you have uploaded the following to Appflow:"
echo "  • iOS Distribution Certificate (.p12 file)"
echo "  • Distribution Provisioning Profile (.mobileprovision)"
echo "  • Certificate password (if applicable)"
echo ""
echo "Upload at: https://dashboard.ionicframework.com/apps"
echo ""

read -p "Have you uploaded your iOS certificates to Appflow? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Please upload certificates first, then run this script again"
    echo ""
    echo "Certificate upload steps:"
    echo "1. Go to https://dashboard.ionicframework.com/"
    echo "2. Select your app: rajus-api-client"
    echo "3. Go to Build > Certificates"
    echo "4. Upload iOS Distribution Certificate"
    echo "5. Upload Distribution Provisioning Profile"
    exit 1
fi

# Step 6: Trigger cloud build
print_status "Triggering iOS cloud build..."

# Check if package builds are available (requires paid plan)
if ionic package list &> /dev/null; then
    print_status "Starting cloud build for iOS..."
    ionic package build ios --release --prod
    
    if [ $? -eq 0 ]; then
        print_success "Cloud build triggered successfully!"
        echo ""
        echo "🎉 Build Status:"
        echo "==============="
        echo "• Monitor progress at: https://dashboard.ionicframework.com/"
        echo "• Build logs will be available in the dashboard"
        echo "• Download signed IPA when build completes"
        echo ""
        echo "📱 Next steps:"
        echo "1. Wait for build completion (usually 5-15 minutes)"
        echo "2. Download the signed IPA file"
        echo "3. Upload to App Store Connect"
        echo "4. Submit for TestFlight or App Store review"
        echo ""
        
        # Show recent builds
        print_status "Recent builds:"
        ionic package list
    else
        print_error "Failed to trigger cloud build"
        exit 1
    fi
else
    print_warning "Package builds not available"
    echo ""
    echo "This feature requires an Ionic Appflow paid plan."
    echo "Alternative options:"
    echo ""
    echo "1. 🆓 Use local Xcode builds:"
    echo "   ./scripts/create-ios-build.sh"
    echo ""
    echo "2. 💰 Upgrade to Appflow paid plan:"
    echo "   https://ionicframework.com/pricing"
    echo ""
    echo "3. 🔗 Link to existing Appflow app:"
    echo "   ionic link"
fi

print_success "Cloud build process completed! ☁️" 