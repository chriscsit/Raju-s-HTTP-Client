#!/bin/bash

echo "🚀 Building Raju's API Client for iOS App Store..."
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf ios/App/App/public/

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm install

# Step 3: Build the React app
print_status "Building React application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React app built successfully"

# Step 4: Sync with Capacitor
print_status "Syncing with Capacitor iOS..."
npx cap sync ios

if [ $? -ne 0 ]; then
    print_error "Capacitor sync failed!"
    exit 1
fi

print_success "Capacitor sync completed"

# Step 5: Update iOS bundle identifier and display name
print_status "Updating iOS configuration..."

# Update bundle identifier in capacitor.config.json
if [ -f "capacitor.config.json" ]; then
    # Create a backup
    cp capacitor.config.json capacitor.config.json.backup
    
    # Update the bundle identifier if not already set
    if ! grep -q "com.rajusapp.apiclient" capacitor.config.json; then
        print_status "Updating bundle identifier to com.rajusapp.apiclient"
        # Note: Manual update required for complex JSON changes
        print_warning "Please manually update capacitor.config.json with bundle ID: com.rajusapp.apiclient"
    fi
fi

# Step 6: Generate app icons and splash screens
print_status "Generating app resources..."
if command -v cordova-res &> /dev/null; then
    cordova-res ios --skip-config --copy
    print_success "App resources generated"
else
    print_warning "cordova-res not found. Install with: npm install -g cordova-res"
fi

# Step 7: Open Xcode
print_status "Opening Xcode project..."
npx cap open ios

echo ""
echo "🎉 iOS Build Preparation Complete!"
echo "=================================="
echo ""
echo "Next steps in Xcode:"
echo "1. 📱 Select 'App' target"
echo "2. ⚙️  Go to 'Signing & Capabilities'"
echo "3. 🆔 Set Bundle Identifier: com.rajusapp.apiclient"
echo "4. 👤 Select your Development Team"
echo "5. ✅ Enable 'Automatically manage signing'"
echo "6. 🏗️  Select 'Any iOS Device (arm64)' as target"
echo "7. 📦 Go to Product > Archive"
echo "8. ⬆️  Upload to App Store Connect"
echo ""
echo "🔗 Useful commands:"
echo "   • Test build: npx cap run ios"
echo "   • Open iOS project: npx cap open ios"
echo "   • Sync changes: npx cap sync ios"
echo ""
print_success "Ready for App Store distribution! 🚀" 