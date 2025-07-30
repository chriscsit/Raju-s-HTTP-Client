import React, { useState } from 'react'
import { Send, Plus, Trash2, Save, Copy, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Editor from '@monaco-editor/react'

const RequestPanel = ({
  request,
  onUpdateRequest,
  setResponse,
  loading,
  setLoading,
  onAddToHistory,
  activeEnvironment,
  onSubstituteVariables
}) => {
  const [activeTab, setActiveTab] = useState('headers')
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
  const bodyTypes = ['json', 'form-data', 'raw', 'none']

  const handleMethodChange = (method) => {
    onUpdateRequest({ method })
  }

  const handleUrlChange = (url) => {
    onUpdateRequest({ url })
  }

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...request.headers]
    newHeaders[index] = { ...newHeaders[index], [field]: value }
    onUpdateRequest({ headers: newHeaders })
  }

  const addHeader = () => {
    onUpdateRequest({
      headers: [...request.headers, { key: '', value: '', enabled: true }]
    })
  }

  const removeHeader = (index) => {
    const newHeaders = request.headers.filter((_, i) => i !== index)
    onUpdateRequest({ headers: newHeaders })
  }

  const handleBodyChange = (value) => {
    onUpdateRequest({ body: value })
  }

  const handleAuthChange = (authUpdates) => {
    onUpdateRequest({ 
      auth: { ...request.auth, ...authUpdates }
    })
  }

  // Generate authorization header from auth settings
  const generateAuthHeader = (auth, activeEnvironment, onSubstituteVariables) => {
    if (!auth || auth.type === 'none') return null

    switch (auth.type) {
      case 'bearer':
        if (auth.bearer) {
          const token = onSubstituteVariables ? onSubstituteVariables(auth.bearer, activeEnvironment) : auth.bearer
          return { key: 'Authorization', value: `Bearer ${token}`, enabled: true }
        }
        break
      case 'basic':
        if (auth.basic.username && auth.basic.password) {
          const username = onSubstituteVariables ? onSubstituteVariables(auth.basic.username, activeEnvironment) : auth.basic.username
          const password = onSubstituteVariables ? onSubstituteVariables(auth.basic.password, activeEnvironment) : auth.basic.password
          const credentials = btoa(`${username}:${password}`)
          return { key: 'Authorization', value: `Basic ${credentials}`, enabled: true }
        }
        break
      case 'apikey':
        if (auth.apikey.key && auth.apikey.value && auth.apikey.location === 'header') {
          const key = onSubstituteVariables ? onSubstituteVariables(auth.apikey.key, activeEnvironment) : auth.apikey.key
          const value = onSubstituteVariables ? onSubstituteVariables(auth.apikey.value, activeEnvironment) : auth.apikey.value
          return { key, value, enabled: true }
        }
        break
      case 'custom':
        if (auth.custom.header && auth.custom.value) {
          const header = onSubstituteVariables ? onSubstituteVariables(auth.custom.header, activeEnvironment) : auth.custom.header
          const value = onSubstituteVariables ? onSubstituteVariables(auth.custom.value, activeEnvironment) : auth.custom.value
          return { key: header, value, enabled: true }
        }
        break
    }
    return null
  }

  const handleBodyTypeChange = (type) => {
    onUpdateRequest({ bodyType: type })
  }

  const sendRequest = async () => {
    if (!request.url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      // Apply environment variable substitution to URL
      let substitutedUrl = onSubstituteVariables(request.url, activeEnvironment)
      
      // Add API key as query parameter if configured
      if (request.auth.type === 'apikey' && request.auth.apikey.location === 'query' && 
          request.auth.apikey.key && request.auth.apikey.value) {
        const keyName = onSubstituteVariables(request.auth.apikey.key, activeEnvironment)
        const keyValue = onSubstituteVariables(request.auth.apikey.value, activeEnvironment)
        
        const separator = substitutedUrl.includes('?') ? '&' : '?'
        substitutedUrl += `${separator}${encodeURIComponent(keyName)}=${encodeURIComponent(keyValue)}`
      }
      
      // Prepare headers with variable substitution
      const headers = {}
      
      // Add auth header if configured
      const authHeader = generateAuthHeader(request.auth, activeEnvironment, onSubstituteVariables)
      if (authHeader) {
        headers[authHeader.key] = authHeader.value
      }
      
      // Add manual headers
      request.headers.forEach(header => {
        if (header.enabled && header.key.trim() && header.value.trim()) {
          const substitutedKey = onSubstituteVariables(header.key.trim(), activeEnvironment)
          const substitutedValue = onSubstituteVariables(header.value.trim(), activeEnvironment)
          headers[substitutedKey] = substitutedValue
        }
      })

      // Prepare request config
      const config = {
        method: request.method.toLowerCase(),
        url: substitutedUrl,
        headers,
        timeout: 30000
      }

      // Add body for methods that support it
      if (['post', 'put', 'patch'].includes(config.method) && request.body.trim()) {
        const substitutedBody = onSubstituteVariables(request.body, activeEnvironment)
        
        if (request.bodyType === 'json') {
          try {
            config.data = JSON.parse(substitutedBody)
            headers['Content-Type'] = 'application/json'
          } catch (e) {
            toast.error('Invalid JSON in request body')
            setLoading(false)
            return
          }
        } else {
          config.data = substitutedBody
        }
      }

      const response = await axios(config)
      const duration = Date.now() - startTime

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        duration
      }

      setResponse(responseData)
      onAddToHistory(request, responseData)
      toast.success(`Request completed in ${duration}ms`)

    } catch (error) {
      const duration = Date.now() - startTime
      const errorResponse = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || error.message,
        data: error.response?.data || { error: error.message },
        headers: error.response?.headers || {},
        duration
      }

      setResponse(errorResponse)
      onAddToHistory(request, errorResponse)
      toast.error(`Request failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(request.url)
    toast.success('URL copied to clipboard')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* URL Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2">
          <select
            value={request.method}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {methods.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>

          <div className="flex-1 relative">
            <input
              type="text"
              value={request.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Enter request URL (e.g., https://api.example.com/users)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={copyUrl}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              title="Copy URL"
            >
              <Copy size={16} />
            </button>
          </div>

          <button
            onClick={sendRequest}
            disabled={loading || !request.url.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
          >
            <Send size={16} />
            <span>{loading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {['auth', 'headers', 'body'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm flex items-center space-x-1 ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'auth' && <Lock size={14} />}
              <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'auth' && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Lock size={16} className="mr-2" />
                Authorization
              </h3>
            </div>

            {/* Auth Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={request.auth.type}
                onChange={(e) => handleAuthChange({ type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">No Authentication</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="apikey">API Key</option>
                <option value="custom">Custom Header</option>
              </select>
            </div>

            {/* Bearer Token */}
            {request.auth.type === 'bearer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bearer Token
                  </label>
                  <input
                    type="text"
                    value={request.auth.bearer}
                    onChange={(e) => handleAuthChange({ bearer: e.target.value })}
                    placeholder="Enter bearer token or {{variable}}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will be sent as: <code className="bg-gray-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</code>
                  </p>
                </div>
              </div>
            )}

            {/* Basic Auth */}
            {request.auth.type === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={request.auth.basic.username}
                    onChange={(e) => handleAuthChange({ 
                      basic: { ...request.auth.basic, username: e.target.value }
                    })}
                    placeholder="Enter username or {{variable}}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={request.auth.basic.password}
                      onChange={(e) => handleAuthChange({ 
                        basic: { ...request.auth.basic, password: e.target.value }
                      })}
                      placeholder="Enter password or {{variable}}"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Will be sent as: <code className="bg-gray-100 px-1 rounded">Authorization: Basic &lt;base64(username:password)&gt;</code>
                  </p>
                </div>
              </div>
            )}

            {/* API Key */}
            {request.auth.type === 'apikey' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={request.auth.apikey.key}
                    onChange={(e) => handleAuthChange({ 
                      apikey: { ...request.auth.apikey, key: e.target.value }
                    })}
                    placeholder="e.g., X-API-Key, api_key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Value
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={request.auth.apikey.value}
                      onChange={(e) => handleAuthChange({ 
                        apikey: { ...request.auth.apikey, value: e.target.value }
                      })}
                      placeholder="Enter API key or {{variable}}"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={request.auth.apikey.location}
                    onChange={(e) => handleAuthChange({ 
                      apikey: { ...request.auth.apikey, location: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="header">Header</option>
                    <option value="query">Query Parameter</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {request.auth.apikey.location === 'header' 
                      ? `Will be sent as header: ${request.auth.apikey.key || 'Key-Name'}: ${request.auth.apikey.value || 'value'}`
                      : `Will be sent as query parameter: ?${request.auth.apikey.key || 'key'}=${request.auth.apikey.value || 'value'}`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Custom Header */}
            {request.auth.type === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Name
                  </label>
                  <input
                    type="text"
                    value={request.auth.custom.header}
                    onChange={(e) => handleAuthChange({ 
                      custom: { ...request.auth.custom, header: e.target.value }
                    })}
                    placeholder="e.g., X-Custom-Auth, Authorization"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Value
                  </label>
                  <input
                    type="text"
                    value={request.auth.custom.value}
                    onChange={(e) => handleAuthChange({ 
                      custom: { ...request.auth.custom, value: e.target.value }
                    })}
                    placeholder="Enter custom header value or {{variable}}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will be sent as: <code className="bg-gray-100 px-1 rounded">{request.auth.custom.header || 'Header-Name'}: {request.auth.custom.value || 'value'}</code>
                  </p>
                </div>
              </div>
            )}

            {/* Auth Preview */}
            {request.auth.type !== 'none' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Authorization Preview</h4>
                <div className="text-sm text-blue-800 font-mono">
                  {(() => {
                    const authHeader = generateAuthHeader(request.auth, activeEnvironment, onSubstituteVariables)
                    if (authHeader) {
                      return `${authHeader.key}: ${authHeader.value}`
                    }
                    return "No authorization header will be generated (missing required fields)"
                  })()}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  💡 This header will be automatically added to your request
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Headers</h3>
              <button
                onClick={addHeader}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={14} />
                <span>Add Header</span>
              </button>
            </div>

            <div className="space-y-2">
              {request.headers.map((header, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) => handleHeaderChange(index, 'enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    placeholder="Header name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    placeholder="Header value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeHeader(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'body' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">Body Type:</span>
                {bodyTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="bodyType"
                      value={type}
                      checked={request.bodyType === type}
                      onChange={(e) => handleBodyTypeChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {type === 'form-data' ? 'Form Data' : type.toUpperCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {request.bodyType !== 'none' && (
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage={request.bodyType === 'json' ? 'json' : 'text'}
                  value={request.body}
                  onChange={handleBodyChange}
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    theme: 'vs-light'
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestPanel 