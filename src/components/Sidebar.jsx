import React, { useState, useRef } from 'react'
import { X, Clock, Bookmark, Plus, Trash2, Search, FolderOpen, Upload, Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const Sidebar = ({
  isOpen,
  onClose,
  history,
  collections,
  onLoadFromHistory,
  onLoadFromCollection,
  onSaveToCollection,
  onImportCollection,
  onDeleteFromCollection,
  currentRequest
}) => {
  const [activeTab, setActiveTab] = useState('history')
  const [searchTerm, setSearchTerm] = useState('')
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const fileInputRef = useRef(null)

  const filteredHistory = history.filter(item =>
    item.request.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.request.method.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCollections = collections.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.request.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-green-600 bg-green-100',
      POST: 'text-blue-600 bg-blue-100',
      PUT: 'text-orange-600 bg-orange-100',
      DELETE: 'text-red-600 bg-red-100',
      PATCH: 'text-purple-600 bg-purple-100'
    }
    return colors[method] || 'text-gray-600 bg-gray-100'
  }

  const handleSaveRequest = () => {
    if (!saveName.trim()) {
      toast.error('Please enter a name for the request')
      return
    }

    if (!currentRequest.url.trim()) {
      toast.error('Please configure a request before saving')
      return
    }

    onSaveToCollection(saveName.trim(), currentRequest)
    setSaveName('')
    setSaveModalOpen(false)
    toast.success('Request saved to collection')
  }

  const deleteFromCollection = (id) => {
    onDeleteFromCollection(id)
    toast.success('Request deleted from collection')
  }

  const exportCollections = () => {
    if (collections.length === 0) {
      toast.error('No collections to export')
      return
    }

    const exportData = {
      info: {
        name: "Raju's Client Collection",
        description: "Exported from Raju's Client",
        version: "2.1.0",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        exportedAt: new Date().toISOString()
      },
      item: collections.map(collection => ({
        name: collection.name,
        id: collection.id,
        request: {
          method: collection.request.method,
          header: collection.request.headers
            .filter(h => h.enabled && h.key && h.value)
            .map(h => ({
              key: h.key,
              value: h.value,
              type: "text"
            })),
          body: collection.request.body ? {
            mode: collection.request.bodyType,
            raw: collection.request.body,
            options: {
              raw: {
                language: collection.request.bodyType === 'json' ? 'json' : 'text'
              }
            }
          } : undefined,
          url: {
            raw: collection.request.url,
            protocol: collection.request.url.startsWith('https') ? 'https' : 'http',
            host: collection.request.url.split('/')[2]?.split(':')[0]?.split('.') || [],
            path: collection.request.url.split('/').slice(3) || []
          }
        },
        response: [],
        createdAt: collection.createdAt
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rajus-client-collection-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Collections exported successfully')
  }

  const handleImportFile = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result)
        
        // Support both our format and Postman format
        let importedCollections = []
        
        if (content.item && Array.isArray(content.item)) {
          // Postman format
          importedCollections = content.item.map((item, index) => ({
            id: item.id || Date.now() + index,
            name: item.name || `Imported Request ${index + 1}`,
            request: {
              method: item.request?.method || 'GET',
              url: typeof item.request?.url === 'string' 
                ? item.request.url 
                : item.request?.url?.raw || '',
              headers: item.request?.header?.map(h => ({
                key: h.key || '',
                value: h.value || '',
                enabled: true
              })) || [{ key: '', value: '', enabled: true }],
              body: item.request?.body?.raw || '',
              bodyType: item.request?.body?.mode === 'raw' ? 'json' : item.request?.body?.mode || 'json'
            },
            createdAt: item.createdAt || new Date().toISOString()
          }))
        } else if (Array.isArray(content)) {
          // Our format (array of collections)
          importedCollections = content
        } else {
          throw new Error('Unsupported file format')
        }

        onImportCollection(importedCollections)
        toast.success(`Imported ${importedCollections.length} requests successfully`)
        
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to import collection. Please check the file format.')
      }
    }
    
    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-50 lg:relative lg:z-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Workspace</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Clock size={16} className="inline mr-2" />
                History
              </button>
              <button
                onClick={() => setActiveTab('collections')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === 'collections'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bookmark size={16} className="inline mr-2" />
                Collections
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'history' && (
              <div className="p-4">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No requests in history</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onLoadFromHistory(item)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(item.request.method)}`}>
                            {item.request.method}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 truncate mb-1">
                          {item.request.url}
                        </p>
                        {item.response && (
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className={item.response.status >= 400 ? 'text-red-500' : 'text-green-500'}>
                              {item.response.status}
                            </span>
                            <span>•</span>
                            <span>{item.response.duration}ms</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'collections' && (
              <div className="p-4">
                {/* Collection Actions */}
                <div className="space-y-3 mb-4">
                  <button
                    onClick={() => setSaveModalOpen(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus size={16} className="inline mr-2" />
                    Save Current Request
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                    >
                      <Upload size={14} className="mr-2" />
                      Import
                    </button>
                    <button
                      onClick={exportCollections}
                      disabled={collections.length === 0}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <Download size={14} className="mr-2" />
                      Export
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </div>

                {filteredCollections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">No saved requests</p>
                    <p className="text-xs mt-1">Import a collection or save your first request</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">
                        {filteredCollections.length} request{filteredCollections.length !== 1 ? 's' : ''}
                      </h4>
                      <FileText size={14} className="text-gray-400" />
                    </div>
                    
                    {filteredCollections.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group hover:border-gray-300"
                      >
                        <div 
                          onClick={() => onLoadFromCollection(item)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(item.request.method)}`}>
                                {item.request.method}
                              </span>
                              <div className="text-xs text-gray-500">
                                {formatDate(item.createdAt)}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteFromCollection(item.id)
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-50"
                              title="Delete request"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {item.request.url || 'No URL specified'}
                          </p>
                          
                          {/* Request Details Preview */}
                          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-3">
                            {item.request.headers?.some(h => h.enabled && h.key && h.value) && (
                              <span>
                                {item.request.headers.filter(h => h.enabled && h.key && h.value).length} headers
                              </span>
                            )}
                            {item.request.body && (
                              <span>Body: {item.request.bodyType}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Request</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter request name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={handleSaveRequest}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setSaveModalOpen(false)
                  setSaveName('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar 