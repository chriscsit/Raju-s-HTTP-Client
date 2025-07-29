import React, { useState } from 'react'
import { Copy, Download, Eye, Code, FileText } from 'lucide-react'
import Editor from '@monaco-editor/react'
import toast from 'react-hot-toast'

const ResponsePanel = ({ response, loading }) => {
  const [activeTab, setActiveTab] = useState('body')
  const [viewMode, setViewMode] = useState('pretty')

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50'
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-50'
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-50'
    if (status >= 500) return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2))
    toast.success('Copied to clipboard')
  }

  const downloadResponse = () => {
    const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Response downloaded')
  }

  const getResponseSize = () => {
    if (!response) return 0
    return new Blob([JSON.stringify(response.data)]).size
  }

  const formatResponseData = () => {
    if (!response?.data) return ''
    
    if (typeof response.data === 'string') {
      try {
        return JSON.stringify(JSON.parse(response.data), null, 2)
      } catch {
        return response.data
      }
    }
    
    return JSON.stringify(response.data, null, 2)
  }

  const getLanguage = () => {
    if (!response?.data) return 'text'
    
    try {
      if (typeof response.data === 'object' || JSON.parse(JSON.stringify(response.data))) {
        return 'json'
      }
    } catch {
      return 'text'
    }
    
    return 'json'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Sending request...</p>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center text-gray-500">
          <Eye size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No Response</p>
          <p className="text-sm">Send a request to see the response here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Response Status Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(response.status)}`}>
              {response.status} {response.statusText}
            </span>
            <span className="text-sm text-gray-600">
              {response.duration}ms
            </span>
            <span className="text-sm text-gray-600">
              {formatBytes(getResponseSize())}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(response.data)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy Response"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={downloadResponse}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download Response"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {['body', 'headers'].map(tab => (
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
        {activeTab === 'body' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">View:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('pretty')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      viewMode === 'pretty'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Code size={14} className="inline mr-1" />
                    Pretty
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      viewMode === 'raw'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FileText size={14} className="inline mr-1" />
                    Raw
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                language={getLanguage()}
                value={viewMode === 'pretty' ? formatResponseData() : JSON.stringify(response.data)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  theme: 'vs-light',
                  automaticLayout: true
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="p-4 h-full overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">Response Headers</h3>
            <div className="space-y-2">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm text-gray-700 min-w-0 flex-1">
                    {key}
                  </div>
                  <div className="text-sm text-gray-600 min-w-0 flex-1 break-all">
                    {Array.isArray(value) ? value.join(', ') : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponsePanel 