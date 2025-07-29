import React, { useState } from 'react'
import { Send, Plus, Trash2, Save, Copy } from 'lucide-react'
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
      // Apply environment variable substitution
      const substitutedUrl = onSubstituteVariables(request.url, activeEnvironment)
      
      // Prepare headers with variable substitution
      const headers = {}
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
          {['headers', 'body'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
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