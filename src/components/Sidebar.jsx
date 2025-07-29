import React, { useState, useRef } from 'react'
import { X, Clock, Bookmark, Plus, Trash2, Search, FolderOpen, Upload, Download, FileText, ChevronRight, ChevronDown, Folder } from 'lucide-react'
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

  // Flatten collections for search (recursively search through folders)
  const flattenCollections = (items) => {
    const flattened = []
    items.forEach(item => {
      if (item.type === 'folder') {
        flattened.push(item)
        flattened.push(...flattenCollections(item.items))
      } else {
        flattened.push(item)
      }
    })
    return flattened
  }

  const filteredCollections = collections.filter(item => {
    if (item.type === 'folder') {
      // For folders, check folder name or any nested request
      const folderNameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const nestedMatch = flattenCollections(item.items).some(nestedItem => 
        nestedItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nestedItem.request && nestedItem.request.url.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      return folderNameMatch || nestedMatch
    } else {
      // For requests, check name and URL
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.request && item.request.url.toLowerCase().includes(searchTerm.toLowerCase()))
    }
  })

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

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    const toggleInArray = (items) => {
      return items.map(item => {
        if (item.type === 'folder') {
          if (item.id === folderId) {
            return { ...item, isExpanded: !item.isExpanded }
          } else {
            return { ...item, items: toggleInArray(item.items) }
          }
        }
        return item
      })
    }
    
    // We need to update the collections state
    // This assumes onImportCollection can also be used to update collections
    const updatedCollections = toggleInArray(collections)
    onImportCollection(updatedCollections)
  }

  const exportCollections = () => {
    if (collections.length === 0) {
      toast.error('No collections to export')
      return
    }

    // Convert our hierarchical structure back to Postman format
    const convertToPostmanFormat = (items) => {
      return items.map(item => {
        if (item.type === 'folder') {
          return {
            name: item.name,
            id: item.id,
            item: convertToPostmanFormat(item.items)
          }
        } else {
          return {
            name: item.name,
            id: item.id,
            request: {
              method: item.request.method,
              header: item.request.headers
                .filter(h => h.enabled && h.key && h.value)
                .map(h => ({
                  key: h.key,
                  value: h.value,
                  type: "text"
                })),
              body: item.request.body ? {
                mode: item.request.bodyType,
                raw: item.request.body,
                options: {
                  raw: {
                    language: item.request.bodyType === 'json' ? 'json' : 'text'
                  }
                }
              } : undefined,
              url: {
                raw: item.request.url,
                protocol: item.request.url.startsWith('https') ? 'https' : 'http',
                host: item.request.url.split('/')[2]?.split(':')[0]?.split('.') || [],
                path: item.request.url.split('/').slice(3) || []
              }
            },
            response: [],
            createdAt: item.createdAt
          }
        }
      })
    }

    const exportData = {
      info: {
        name: "Raju's Client Collection",
        description: "Exported from Raju's Client",
        version: "2.1.0",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        exportedAt: new Date().toISOString()
      },
      item: convertToPostmanFormat(collections)
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

    // Accept both .json and no extension (some Postman exports)
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.json') && !fileName.includes('postman') && file.type !== 'application/json') {
      toast.error('Please select a valid JSON file (.json)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result)
        console.log('Importing file:', file.name, 'Content:', content)
        
        // Support multiple collection formats
        let importedCollections = []
        
        // Format 1: Postman Collection v2.1 or v2.0
        if (content.info && content.item && Array.isArray(content.item)) {
          console.log('Detected Postman Collection format')
          importedCollections = processPostmanCollection(content)
        }
        // Format 2: Postman Collection v1 (legacy)
        else if (content.requests && Array.isArray(content.requests)) {
          console.log('Detected Postman Collection v1 format')
          importedCollections = content.requests.map((item, index) => ({
            id: item.id || Date.now() + index,
            name: item.name || `Imported Request ${index + 1}`,
            request: {
              method: item.method || 'GET',
              url: item.url || '',
              headers: item.headers ? Object.entries(item.headers).map(([key, value]) => ({
                key,
                value,
                enabled: true
              })) : [{ key: '', value: '', enabled: true }],
              body: item.data || item.rawModeData || '',
              bodyType: item.dataMode === 'raw' ? 'json' : item.dataMode || 'json'
            },
            createdAt: item.time || new Date().toISOString()
          }))
        }
        // Format 3: Our internal format (array of collections)
        else if (Array.isArray(content)) {
          console.log('Detected internal format')
          importedCollections = content
        }
        // Format 4: Single request object
        else if (content.request || content.method) {
          console.log('Detected single request format')
          importedCollections = [{
            id: Date.now(),
            name: content.name || 'Imported Request',
            request: {
              method: content.method || content.request?.method || 'GET',
              url: content.url || content.request?.url?.raw || content.request?.url || '',
              headers: formatHeaders(content.headers || content.request?.header) || [{ key: '', value: '', enabled: true }],
              body: content.body || content.request?.body?.raw || '',
              bodyType: content.bodyType || (content.request?.body?.mode === 'raw' ? 'json' : content.request?.body?.mode) || 'json'
            },
            createdAt: content.createdAt || new Date().toISOString()
          }]
        }
        else {
          throw new Error(`Unsupported file format. Expected Postman collection or request array.\nFile structure: ${Object.keys(content).join(', ')}`)
        }

        if (importedCollections.length === 0) {
          throw new Error('No valid requests found in the imported file')
        }

        // Count total requests (including nested ones)
        const countRequests = (items) => {
          return items.reduce((count, item) => {
            if (item.type === 'folder') {
              return count + countRequests(item.items)
            } else {
              return count + 1
            }
          }, 0)
        }

        const totalRequests = countRequests(importedCollections)
        onImportCollection(importedCollections)
        toast.success(`Successfully imported ${totalRequests} request${totalRequests !== 1 ? 's' : ''} from ${file.name}`)
        
      } catch (error) {
        console.error('Import error:', error)
        toast.error(`Import failed: ${error.message}`)
      }
    }
    
    reader.onerror = () => {
      toast.error('Failed to read file. Please try again.')
    }
    
    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  // Helper function to process Postman collections
  const processPostmanCollection = (content) => {
    const items = []
    
    const processItem = (item) => {
      if (item.item && Array.isArray(item.item)) {
        // This is a folder - create a folder structure
        return {
          id: item.id || Date.now() + Math.random(),
          name: item.name || 'Untitled Folder',
          type: 'folder',
          isExpanded: false, // Default to collapsed
          items: item.item.map(subItem => processItem(subItem)).filter(Boolean),
          createdAt: new Date().toISOString()
        }
      } else if (item.request) {
        // This is a request
        let url = ''
        if (typeof item.request.url === 'string') {
          url = item.request.url
        } else if (item.request.url?.raw) {
          url = item.request.url.raw
        } else if (item.request.url?.protocol && item.request.url?.host) {
          const protocol = Array.isArray(item.request.url.protocol) ? item.request.url.protocol.join('') : item.request.url.protocol
          const host = Array.isArray(item.request.url.host) ? item.request.url.host.join('.') : item.request.url.host
          const path = Array.isArray(item.request.url.path) ? '/' + item.request.url.path.join('/') : item.request.url.path || ''
          url = `${protocol}://${host}${path}`
        }

        return {
          id: item.id || Date.now() + Math.random(),
          name: item.name || `Imported Request`,
          type: 'request',
          request: {
            method: item.request.method || 'GET',
            url: url,
            headers: formatHeaders(item.request.header) || [{ key: '', value: '', enabled: true }],
            body: extractBody(item.request.body),
            bodyType: getBodyType(item.request.body)
          },
          createdAt: item.createdAt || new Date().toISOString()
        }
      }
      return null
    }

    return content.item.map(item => processItem(item)).filter(Boolean)
  }

  // Helper function to format headers
  const formatHeaders = (headers) => {
    if (!headers || !Array.isArray(headers)) return [{ key: '', value: '', enabled: true }]
    
    const formattedHeaders = headers.map(h => ({
      key: h.key || '',
      value: h.value || '',
      enabled: h.disabled !== true
    }))
    
    // Always ensure at least one empty header row
    if (formattedHeaders.length === 0 || !formattedHeaders.some(h => !h.key && !h.value)) {
      formattedHeaders.push({ key: '', value: '', enabled: true })
    }
    
    return formattedHeaders
  }

  // Helper function to extract body content
  const extractBody = (body) => {
    if (!body) return ''
    
    if (typeof body === 'string') return body
    if (body.raw) return body.raw
    if (body.urlencoded) {
      return body.urlencoded.map(item => `${item.key}=${item.value}`).join('&')
    }
    if (body.formdata) {
      return JSON.stringify(body.formdata, null, 2)
    }
    
    return ''
  }

  // Helper function to determine body type
  const getBodyType = (body) => {
    if (!body) return 'json'
    if (body.mode) {
      switch (body.mode) {
        case 'raw':
          if (body.options?.raw?.language === 'json') return 'json'
          if (body.options?.raw?.language === 'xml') return 'xml'
          if (body.options?.raw?.language === 'html') return 'html'
          return 'text'
        case 'urlencoded': return 'form'
        case 'formdata': return 'form'
        default: return 'json'
      }
    }
    return 'json'
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
                    accept=".json,application/json"
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
                      <CollectionItem
                        key={item.id}
                        item={item}
                        onLoadFromCollection={onLoadFromCollection}
                        onDeleteFromCollection={deleteFromCollection}
                        onToggleFolder={toggleFolder}
                        getMethodColor={getMethodColor}
                        formatDate={formatDate}
                        level={0}
                      />
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

// Recursive component to display collection items (folders and requests)
const CollectionItem = ({ 
  item, 
  onLoadFromCollection, 
  onDeleteFromCollection, 
  onToggleFolder, 
  getMethodColor, 
  formatDate, 
  level = 0 
}) => {
  if (item.type === 'folder') {
    return (
      <div className="mb-1">
        {/* Folder Header */}
        <div 
          onClick={() => onToggleFolder(item.id)}
          className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group ${
            level > 0 ? 'ml-4' : ''
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          <div className="flex items-center flex-1">
            {item.isExpanded ? (
              <ChevronDown size={14} className="text-gray-500 mr-2" />
            ) : (
              <ChevronRight size={14} className="text-gray-500 mr-2" />
            )}
            <Folder size={14} className="text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">{item.name}</span>
            <span className="ml-2 text-xs text-gray-500">
              ({item.items.length} item{item.items.length !== 1 ? 's' : ''})
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteFromCollection(item.id)
            }}
            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-50"
            title="Delete folder"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Folder Contents */}
        {item.isExpanded && (
          <div className="ml-2">
            {item.items.map((subItem) => (
              <CollectionItem
                key={subItem.id}
                item={subItem}
                onLoadFromCollection={onLoadFromCollection}
                onDeleteFromCollection={onDeleteFromCollection}
                onToggleFolder={onToggleFolder}
                getMethodColor={getMethodColor}
                formatDate={formatDate}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  } else {
    // Request item
    return (
      <div 
        className={`mb-1 ${level > 0 ? 'ml-4' : ''}`}
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group hover:border-gray-300">
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
                  onDeleteFromCollection(item.id)
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
      </div>
    )
  }
}

export default Sidebar 