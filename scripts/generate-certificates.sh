#!/bin/bash

echo "🔐 iOS Certificate Generation Helper"
echo "===================================="

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

APP_NAME="Raju's API Client"
BUNDLE_ID="com.rajusapp.apiclient"

echo "App Name: $APP_NAME"
echo "Bundle ID: $BUNDLE_ID"
echo ""

print_warning "PREREQUISITES CHECKLIST:"
echo "========================"
echo "☐ Apple Developer Account ($99/year)"
echo "☐ Xcode installed (latest version)"
echo "☐ Keychain Access available"
echo ""

read -p "Do you have an active Apple Developer Account? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Apple Developer Account required"
    echo "Sign up at: https://developer.apple.com/programs/"
    exit 1
fi

print_success "Prerequisites confirmed"
echo ""

# Step 1: Generate Certificate Signing Request
print_status "Step 1: Generate Certificate Signing Request (CSR)"
echo "=================================================="
echo ""
echo "Manual steps in Keychain Access:"
echo "1. Open Keychain Access (Applications > Utilities)"
echo "2. Go to: Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority"
echo "3. Enter your email address (same as Apple Developer Account)"
echo "4. Enter your name"
echo "5. Select: 'Saved to disk'"
echo "6. Select: 'Let me specify key pair information'"
echo "7. Save as: RajusAPIClient.certSigningRequest"
echo "8. Key Size: 2048 bits"
echo "9. Algorithm: RSA"
echo ""

read -p "Press Enter when you have created the CSR file..."

# Check if CSR file was created
if [ -f "$HOME/Desktop/RajusAPIClient.certSigningRequest" ]; then
    print_success "CSR file found on Desktop"
else
    print_warning "CSR file not found on Desktop. Make sure you saved it correctly."
fi

echo ""

# Step 2: Apple Developer Portal Setup
print_status "Step 2: Apple Developer Portal Configuration"
echo "============================================"
echo ""
echo "🌐 Opening Apple Developer Portal..."

# Open required pages
open "https://developer.apple.com/account/resources/identifiers/list"

echo ""
echo "CREATE APP IDENTIFIER:"
echo "====================="
echo "1. Click the '+' button to add new identifier"
echo "2. Select 'App IDs' → 'App'"
echo "3. Description: $APP_NAME"
echo "4. Bundle ID: $BUNDLE_ID"
echo "5. Select required capabilities:"
echo "   ☐ Associated Domains (if using deep links)"
echo "   ☐ App Groups (if using app extensions)"
echo "   ☐ Network Extensions (if using VPN/proxy features)"
echo "6. Click 'Continue' and 'Register'"
echo ""

read -p "Press Enter when App ID is created..."

# Step 3: Certificate Creation
print_status "Step 3: Create iOS Distribution Certificate"
echo "=========================================="
echo ""

open "https://developer.apple.com/account/resources/certificates/list"

echo "CREATE DISTRIBUTION CERTIFICATE:"
echo "==============================="
echo "1. Click the '+' button to add new certificate"
echo "2. Select 'iOS Distribution (App Store and Ad Hoc)'"
echo "3. Click 'Continue'"
echo "4. Upload your CSR file: RajusAPIClient.certSigningRequest"
echo "5. Click 'Continue'"
echo "6. Download the certificate (.cer file)"
echo "7. Double-click the downloaded certificate to install in Keychain"
echo ""

read -p "Press Enter when certificate is installed..."

# Step 4: Provisioning Profiles
print_status "Step 4: Create Provisioning Profiles"
echo "===================================="
echo ""

open "https://developer.apple.com/account/resources/profiles/list"

echo "CREATE DEVELOPMENT PROFILE:"
echo "=========================="
echo "1. Click '+' to add new provisioning profile"
echo "2. Select 'iOS App Development'"
echo "3. Select App ID: $BUNDLE_ID"
echo "4. Select your development certificate"
echo "5. Select test devices (add iPhone/iPad UDIDs)"
echo "6. Profile Name: '$APP_NAME Development'"
echo "7. Download and install"
echo ""
echo "CREATE DISTRIBUTION PROFILE:"
echo "==========================="
echo "1. Click '+' to add new provisioning profile"
echo "2. Select 'App Store'"
echo "3. Select App ID: $BUNDLE_ID"
echo "4. Select your distribution certificate"
echo "5. Profile Name: '$APP_NAME Distribution'"
echo "6. Download and install"
echo ""

read -p "Press Enter when provisioning profiles are created..."

# Step 5: Export Certificate for Appflow
print_status "Step 5: Export Certificate for Ionic Appflow"
echo "==========================================="
echo ""
echo "EXPORT P12 CERTIFICATE:"
echo "======================"
echo "1. Open Keychain Access"
echo "2. Find your iOS Distribution certificate"
echo "3. Expand the certificate to show the private key"
echo "4. Select BOTH the certificate AND private key"
echo "5. Right-click → Export 2 items..."
echo "6. Format: Personal Information Exchange (.p12)"
echo "7. Save as: RajusAPIClient.p12"
echo "8. Enter a password (remember this for Appflow)"
echo ""

read -p "Press Enter when P12 certificate is exported..."

# Step 6: Verification
print_status "Step 6: Verification"
echo "=================="
echo ""

# Check for certificate files
CERT_FOUND=false
P12_FOUND=false

if ls ~/Desktop/*.cer 1> /dev/null 2>&1; then
    CERT_FOUND=true
    print_success "Distribution certificate (.cer) found"
fi

if ls ~/Desktop/*.p12 1> /dev/null 2>&1; then
    P12_FOUND=true
    print_success "P12 certificate found"
fi

if ls ~/Desktop/*.mobileprovision 1> /dev/null 2>&1; then
    print_success "Provisioning profiles found"
fi

# Step 7: Next Steps
echo ""
print_status "🎉 Certificate Generation Complete!"
echo "=================================="
echo ""
echo "📁 Files you should have:"
echo "• RajusAPIClient.certSigningRequest (used for certificate request)"
echo "• iOS Distribution Certificate (.cer file) - installed in Keychain"
echo "• Development Provisioning Profile (.mobileprovision)"
echo "• Distribution Provisioning Profile (.mobileprovision)"
echo "• P12 Certificate (RajusAPIClient.p12) - for Appflow uploads"
echo ""
echo "🔄 Next steps:"
echo "1. 🏗️  Run local iOS build: ./scripts/create-ios-build.sh"
echo "2. ☁️  Setup cloud builds: ./scripts/cloud-build.sh"
echo "3. 📱 Configure Xcode signing (automated in build script)"
echo "4. 🚀 Submit to App Store"
echo ""
echo "🔗 Useful links:"
echo "• App Store Connect: https://appstoreconnect.apple.com"
echo "• Ionic Appflow: https://dashboard.ionicframework.com"
echo "• iOS Deployment Guide: IOS_SIGNING_GUIDE.md"
echo ""

if [ "$CERT_FOUND" = true ] && [ "$P12_FOUND" = true ]; then
    print_success "✅ All certificates generated successfully!"
    echo ""
    echo "Ready to build and deploy your iOS app! 🚀"
else
    print_warning "⚠️  Some certificate files may be missing"
    echo "Please verify all steps were completed correctly"
fi 