# 🔐 Authorization Guide
## Complete Authentication Support for Raju's API Client

### 🌟 What is Authorization?

**Authorization** in API testing involves sending credentials or tokens with your requests to authenticate with protected endpoints. Raju's API Client supports all major authentication methods used in modern APIs.

---

## 🛡️ Supported Authentication Types

### **🎯 Bearer Token (Most Common)**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Use Cases:**
- JWT tokens
- OAuth 2.0 access tokens
- API access tokens
- Personal access tokens

### **👤 Basic Authentication**
```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```
**Use Cases:**
- Username/password authentication
- Legacy system authentication
- Simple API authentication

### **🔑 API Key Authentication**
```
Header: X-API-Key: abc123def456
Query:  ?api_key=abc123def456
```
**Use Cases:**
- Service-to-service authentication
- Public API access
- Custom authentication schemes

### **⚡ Custom Headers**
```
Header: X-Custom-Auth: custom-token-format
```
**Use Cases:**
- Proprietary authentication schemes
- Multi-header authentication
- Custom token formats

---

## 🚀 How to Use Authorization

### **📍 Access Authorization Tab**
1. **Open Request Panel**
2. **Click "Auth" tab** (with lock icon 🔒)
3. **Select authentication type**
4. **Configure credentials**

### **🎛️ Authorization Tab Features**
- **Type dropdown** - Select authentication method
- **Dynamic forms** - Fields change based on auth type
- **Environment variables** - Use `{{variable}}` syntax
- **Real-time preview** - See exactly what header will be sent
- **Password masking** - Secure credential entry

---

## 🔐 Bearer Token Authentication

### **Setup Steps:**
1. **Select "Bearer Token"** from Type dropdown
2. **Enter your token** in the Bearer Token field
3. **Use variables** for dynamic tokens: `{{access_token}}`

### **Example Bearer Token:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### **Common Bearer Token Sources:**
- **OAuth 2.0 flows** (authorization code, client credentials)
- **JWT tokens** from login endpoints
- **Personal access tokens** from API settings
- **Service account tokens**

### **Environment Variable Example:**
```
Environment: Production
Variable: access_token
Value: live_token_abc123

Bearer Token Field: {{access_token}}
Result: Authorization: Bearer live_token_abc123
```

---

## 👤 Basic Authentication

### **Setup Steps:**
1. **Select "Basic Auth"** from Type dropdown
2. **Enter username** and **password**
3. **Use variables** for credentials: `{{username}}`, `{{password}}`

### **How Basic Auth Works:**
```
Username: admin
Password: secret123
Encoded: base64("admin:secret123") = YWRtaW46c2VjcmV0MTIz
Header: Authorization: Basic YWRtaW46c2VjcmV0MTIz
```

### **Security Features:**
- **Password masking** - Click eye icon to toggle visibility
- **Automatic encoding** - Client handles base64 encoding
- **Environment variables** - Keep credentials secure

### **Common Use Cases:**
- **Legacy API systems**
- **Internal service authentication**
- **Simple authentication requirements**

---

## 🔑 API Key Authentication

### **Header-Based API Keys:**
1. **Select "API Key"** from Type dropdown
2. **Enter Key Name**: `X-API-Key`, `Authorization`, etc.
3. **Enter Key Value**: Your actual API key
4. **Location**: Select "Header"

### **Query Parameter API Keys:**
1. **Same setup** as header-based
2. **Location**: Select "Query Parameter"
3. **Result**: Automatically appends `?key_name=key_value` to URL

### **Common API Key Headers:**
```
X-API-Key: your-api-key-here
X-RapidAPI-Key: your-rapidapi-key
Authorization: Bearer your-api-key
Api-Key: your-key
Authentication: your-key
```

### **Query Parameter Examples:**
```
Original URL: https://api.example.com/users
With API Key: https://api.example.com/users?api_key=abc123

Multiple Params: https://api.example.com/users?filter=active&api_key=abc123
```

### **Security Features:**
- **Key masking** - Click eye icon to toggle visibility
- **URL encoding** - Automatically handles special characters
- **Environment variables** - Use `{{api_key}}` for security

---

## ⚡ Custom Headers

### **Setup Steps:**
1. **Select "Custom Header"** from Type dropdown
2. **Enter Header Name**: `X-Custom-Auth`, `Token`, etc.
3. **Enter Header Value**: Your authentication value
4. **Use variables**: `{{custom_token}}`

### **Use Cases:**
- **Proprietary authentication** schemes
- **Multiple authentication headers**
- **Custom token formats**
- **Legacy system requirements**

### **Examples:**
```
Header: X-Session-Token
Value: session_abc123def456

Header: X-User-Auth  
Value: user:{{user_id}}:token:{{user_token}}

Header: Custom-Auth
Value: Bearer {{jwt_token}}, ApiKey {{api_key}}
```

---

## 🌍 Environment Variables in Auth

### **Why Use Environment Variables?**
- **Security** - Keep credentials out of request configurations
- **Flexibility** - Switch between environments easily
- **Team Collaboration** - Share configurations without exposing secrets

### **Environment Variable Syntax:**
```
{{variable_name}}
```

### **Common Environment Variables:**
```
🏢 Production Environment:
- access_token: prod_token_xyz789
- api_key: prod_key_abc123
- username: prod_user
- password: prod_password

🧪 Development Environment:  
- access_token: dev_token_123abc
- api_key: dev_key_456def
- username: dev_user
- password: dev_password
```

### **Mixed Variable Usage:**
```
Bearer Token: {{env_prefix}}_{{access_token}}
Result: Bearer prod_xyz789_access_token

API Key Value: {{service}}-{{environment}}-{{key}}
Result: payments-production-abc123
```

---

## 👁️ Authorization Preview

### **Real-Time Preview Feature:**
- **See exactly** what header will be sent
- **Variable substitution** applied in preview
- **Error detection** for missing values
- **Format validation** for authentication schemes

### **Preview Examples:**
```
✅ Bearer Token Preview:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

✅ Basic Auth Preview:  
Authorization: Basic YWRtaW46cGFzc3dvcmQ=

✅ API Key Preview:
X-API-Key: abc123def456

❌ Error Preview:
No authorization header will be generated (missing required fields)
```

---

## 🔄 Auth with Collections & Workspaces

### **Auto-Save Features:**
- **Auth data preserved** in collections
- **Auto-save includes** authentication configuration
- **Workspace export** includes all auth settings
- **Team sharing** with authentication configs

### **Collection Behavior:**
```
Save Request to Collection:
✅ Method, URL, Headers, Body
✅ Authentication Configuration  
✅ Environment Variable References
✅ Auth Type and All Settings
```

### **Import/Export:**
- **Postman collections** with auth supported
- **Workspace files** include complete auth data
- **Team collaboration** with shared auth configs

---

## 🔒 Security Best Practices

### **Credential Management:**
- **Use environment variables** for all sensitive data
- **Never hardcode** API keys or passwords
- **Use different credentials** for different environments
- **Regularly rotate** API keys and tokens

### **Environment Strategy:**
```
🏢 Production Environment:
- Real API credentials
- Production endpoints
- Live authentication tokens

🧪 Development Environment:
- Test API credentials  
- Sandbox endpoints
- Development tokens

🎭 Staging Environment:
- Staging credentials
- Pre-production testing
- Realistic but non-live data
```

### **Team Collaboration:**
- **Share configurations** without credentials
- **Use workspace export** for project setup
- **Document environment variables** needed
- **Create setup instructions** for new team members

---

## 🚨 Troubleshooting

### **Authentication Fails**
```
❌ Problem: 401 Unauthorized response
✅ Solutions:
  1. Check token/credentials are correct
  2. Verify environment variables are set
  3. Check if token has expired
  4. Confirm authentication type matches API requirements
  5. Check authorization preview for formatting issues
```

### **Variables Not Substituting**
```
❌ Problem: Literal {{variable}} sent instead of value
✅ Solutions:
  1. Ensure environment is selected in header
  2. Check variable name spelling
  3. Verify variable exists in active environment
  4. Check environment variable is enabled
```

### **API Key in Wrong Location**
```
❌ Problem: API key not working
✅ Solutions:
  1. Check if API expects header vs query parameter
  2. Verify key name matches API documentation
  3. Try different location (header ↔ query)
  4. Check API documentation for exact requirements
```

### **Bearer Token Format Issues**
```
❌ Problem: Token rejected by API
✅ Solutions:
  1. Ensure "Bearer " prefix is not duplicated
  2. Check token hasn't expired
  3. Verify token format (JWT, opaque, etc.)
  4. Check for extra spaces or characters
```

---

## 🎯 Common API Authentication Patterns

### **OAuth 2.0 APIs**
```
Authentication: Bearer Token
Token Source: OAuth flow or client credentials
Example: GitHub API, Google APIs, Microsoft Graph
```

### **REST APIs with API Keys**
```
Authentication: API Key (Header)
Common Headers: X-API-Key, Authorization
Example: OpenWeatherMap, Stripe, SendGrid
```

### **Traditional Web APIs**
```
Authentication: Basic Auth
Credentials: Username/Password
Example: Legacy systems, internal APIs
```

### **Custom Enterprise APIs**
```
Authentication: Custom Header
Format: Proprietary token schemes
Example: Enterprise systems, custom authentication
```

---

## 💡 Pro Tips

### **Bearer Token Tips:**
- **Copy from browser** DevTools after login
- **Use JWT debugger** to inspect token contents
- **Check expiration** if authentication suddenly fails
- **Store in environment** variables for security

### **API Key Tips:**
- **Read API documentation** carefully for exact header name
- **Try both header and query** parameter locations
- **Use descriptive environment** variable names
- **Test with simple requests** first

### **Basic Auth Tips:**
- **URL encode** special characters in username/password
- **Use environment variables** to avoid hardcoding
- **Test credentials** with simple tools first
- **Check for rate limiting** on failed attempts

### **Environment Management:**
- **Create separate environments** for each stage
- **Use descriptive variable names**: `prod_api_key`, `dev_token`
- **Document required variables** for team members
- **Export workspace** configurations for easy setup

---

## 🎉 Success Stories

### **OAuth Integration**
> *"Setting up OAuth bearer tokens was seamless. The environment variables made switching between dev and prod tokens effortless!"*

### **API Key Management**
> *"The automatic query parameter handling saved me hours of URL manipulation. Just set it to 'Query' and it works!"*

### **Team Collaboration**
> *"Shared our workspace with environment variables. New team members can import and just add their own credentials."*

### **Enterprise Authentication**
> *"Custom header support handled our proprietary auth scheme perfectly. The preview feature caught formatting issues immediately."*

---

## 📋 Quick Reference

### **Bearer Token**
```
Type: Bearer Token
Field: Bearer Token
Result: Authorization: Bearer <token>
```

### **Basic Auth**
```
Type: Basic Auth
Fields: Username, Password  
Result: Authorization: Basic <base64(username:password)>
```

### **API Key (Header)**
```
Type: API Key
Location: Header
Result: <Key-Name>: <key-value>
```

### **API Key (Query)**
```
Type: API Key
Location: Query Parameter
Result: ?<key-name>=<key-value>
```

### **Custom Header**
```
Type: Custom Header
Fields: Header Name, Header Value
Result: <Header-Name>: <header-value>
```

---

**🔐 Your API authentication is now completely covered!**

**Professional-grade authentication for all your API testing needs! ✨** 