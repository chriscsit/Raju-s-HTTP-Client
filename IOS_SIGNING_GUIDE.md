# 🔐 iOS Signing Certificates & Deployment Guide
## Raju's API Client - Professional iOS Distribution

### 📋 Prerequisites

1. **Apple Developer Account** ($99/year)
   - Individual or Organization account
   - Sign up at [developer.apple.com](https://developer.apple.com)

2. **Xcode** (Latest version)
   - Download from Mac App Store
   - Command Line Tools installed

3. **Ionic CLI & Tools** ✅ (Already installed)

---

## 🎯 Step 1: Apple Developer Account Setup

### 1.1 Create App Identifier
```bash
# Open Apple Developer Console
open https://developer.apple.com/account/resources/identifiers/list
```

**Create New App ID:**
- Description: `Raju's API Client`
- Bundle ID: `com.rajusapp.apiclient` (must be unique)
- Capabilities: 
  - App Groups (if needed)
  - Associated Domains (if needed)
  - Network Extensions (if needed)

### 1.2 Generate iOS Distribution Certificate

```bash
# Generate Certificate Signing Request (CSR)
# This will be done through Keychain Access on macOS
```

**Manual Steps:**
1. Open **Keychain Access** on macOS
2. Go to **Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority**
3. Enter your email address and name
4. Select **Saved to disk** and **Let me specify key pair information**
5. Save as `RajusAPIClient.certSigningRequest`
6. Key Size: `2048 bits`, Algorithm: `RSA`

**Upload CSR to Apple:**
1. Go to [Apple Developer Certificates](https://developer.apple.com/account/resources/certificates/list)
2. Click **+** to create new certificate
3. Select **iOS Distribution (App Store and Ad Hoc)**
4. Upload your `.certSigningRequest` file
5. Download the generated certificate
6. Double-click to install in Keychain

---

## 🎯 Step 2: Create Provisioning Profiles

### 2.1 Development Provisioning Profile
```bash
# Create for testing on physical devices
```

1. Go to [Provisioning Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Create **iOS App Development** profile
3. Select your App ID: `com.rajusapp.apiclient`
4. Select Development Certificate
5. Select test devices (add your iPhone/iPad UDID)
6. Download and install

### 2.2 Distribution Provisioning Profile
```bash
# Create for App Store distribution
```

1. Create **App Store** provisioning profile
2. Select your App ID: `com.rajusapp.apiclient`
3. Select Distribution Certificate
4. Download and install

---

## 🎯 Step 3: Configure Xcode Project

### 3.1 Update Bundle Identifier
```bash
# Open iOS project in Xcode
open ios/App/App.xcworkspace
```

**In Xcode:**
1. Select **App** target
2. Go to **Signing & Capabilities**
3. Update **Bundle Identifier**: `com.rajusapp.apiclient`
4. Enable **Automatically manage signing** (recommended)
5. Select your **Team** (Apple Developer Account)

### 3.2 Update App Information
```bash
# Update app display name and version
```

**In `ios/App/App/Info.plist`:**
- `CFBundleDisplayName`: `Raju's Client`
- `CFBundleName`: `Raju's Client`
- `CFBundleVersion`: `1.0.0`
- `CFBundleShortVersionString`: `1.0.0`

---

## 🎯 Step 4: Ionic Appflow Setup (Cloud Builds)

### 4.1 Create Ionic Appflow Account
```bash
# Sign up for Ionic Appflow
ionic signup
ionic login
```

### 4.2 Link Project to Appflow
```bash
# Connect your project to Ionic Appflow
ionic link

# Create a new app in Appflow
ionic link --create
```

### 4.3 Upload Certificates to Appflow
```bash
# Upload your certificates and provisioning profiles
ionic package build ios --release --prod
```

**Manual Upload (Recommended):**
1. Go to [Ionic Appflow Dashboard](https://dashboard.ionicframework.com/)
2. Select your app
3. Go to **Build > Certificates**
4. Upload:
   - **iOS Distribution Certificate** (.p12 file)
   - **Distribution Provisioning Profile** (.mobileprovision)

---

## 🎯 Step 5: Build & Deploy Commands

### 5.1 Local Development Build
```bash
# Build for iOS development
npm run build
npx cap sync ios
npx cap open ios

# In Xcode: Product > Build (⌘B)
# Test on simulator or connected device
```

### 5.2 App Store Build (Local)
```bash
# Build production version
npm run build
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select "Any iOS Device (arm64)" as target
# 2. Product > Archive
# 3. Upload to App Store Connect
```

### 5.3 Cloud Build with Ionic Appflow
```bash
# Trigger cloud build
ionic package build ios --release --prod

# Check build status
ionic package list

# Download signed IPA
ionic package download <build-id>
```

---

## 🎯 Step 6: App Store Connect Setup

### 6.1 Create App in App Store Connect
```bash
# Open App Store Connect
open https://appstoreconnect.apple.com
```

**Create New App:**
- **Name**: `Raju's API Client`
- **Bundle ID**: `com.rajusapp.apiclient`
- **SKU**: `rajus-api-client-001`
- **Primary Language**: English

### 6.2 Upload Build
```bash
# After Xcode Archive or Appflow build
# Build will appear in App Store Connect > TestFlight
```

### 6.3 App Information
- **App Icon**: 1024x1024 PNG (already created in resources/)
- **Screenshots**: Required for all device sizes
- **Description**: Professional API testing tool
- **Keywords**: API, testing, development, REST, HTTP
- **Category**: Developer Tools

---

## 🎯 Step 7: Automated Signing Scripts

### 7.1 Local Build Script
```bash
#!/bin/bash
# create-ios-build.sh

echo "🚀 Building Raju's API Client for iOS..."

# Clean and build
npm run build
npx cap sync ios

# Open Xcode for manual archive
npx cap open ios

echo "✅ Ready for Xcode archive!"
echo "Next steps:"
echo "1. In Xcode: Product > Archive"
echo "2. Upload to App Store Connect"
echo "3. Submit for review"
```

### 7.2 Appflow Build Script
```bash
#!/bin/bash
# cloud-build.sh

echo "☁️ Triggering Ionic Appflow build..."

# Login to Ionic
ionic login

# Sync latest code
git add .
git commit -m "Build: iOS App Store release"
git push origin main

# Trigger cloud build
ionic package build ios --release --prod

echo "✅ Cloud build triggered!"
echo "Check status at: https://dashboard.ionicframework.com/"
```

---

## 🔧 Troubleshooting

### Common Certificate Issues

1. **"No matching provisioning profiles found"**
   ```bash
   # Solution: Update bundle identifier in Xcode
   # Ensure it matches your App ID
   ```

2. **"Certificate expired"**
   ```bash
   # Renew certificate in Apple Developer Portal
   # Download and install new certificate
   ```

3. **"Code signing failed"**
   ```bash
   # Clean build folder: Product > Clean Build Folder
   # Restart Xcode
   # Check certificate validity in Keychain
   ```

### Ionic Appflow Issues

1. **Build fails with certificate error**
   ```bash
   # Re-upload certificates to Appflow
   # Ensure .p12 password is correct
   ```

2. **Provisioning profile mismatch**
   ```bash
   # Download latest profile from Apple
   # Upload to Appflow dashboard
   ```

---

## 📱 Testing & Distribution

### TestFlight (Beta Testing)
1. Upload build to App Store Connect
2. Add external testers (up to 10,000)
3. Distribute beta versions for testing

### App Store Release
1. Submit for review (1-7 days)
2. Respond to any feedback
3. Release to App Store

---

## 🎉 Success Checklist

- [ ] Apple Developer Account active
- [ ] iOS Distribution Certificate generated
- [ ] App ID created (`com.rajusapp.apiclient`)
- [ ] Provisioning profiles configured
- [ ] Xcode project properly signed
- [ ] Ionic Appflow account set up
- [ ] Certificates uploaded to Appflow
- [ ] App Store Connect app created
- [ ] Successful build generated
- [ ] TestFlight beta testing completed
- [ ] App Store submission approved

---

## 🔗 Useful Links

- [Apple Developer Portal](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Ionic Appflow](https://dashboard.ionicframework.com/)
- [iOS Deployment Guide](https://capacitorjs.com/docs/ios/deploying-to-app-store)
- [Certificate Troubleshooting](https://developer.apple.com/support/certificates/)

---

**🎯 Your app is now ready for professional iOS distribution!** 