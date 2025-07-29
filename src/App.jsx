import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import RequestPanel from './components/RequestPanel'
import ResponsePanel from './components/ResponsePanel'
import Sidebar from './components/Sidebar'
import EnvironmentManager from './components/EnvironmentManager'

function App() {
  const [request, setRequest] = useState({
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '', enabled: true }],
    body: '',
    bodyType: 'json'
  })
  
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [collections, setCollections] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [environments, setEnvironments] = useState([])
  const [activeEnvironment, setActiveEnvironment] = useState(null)
  const [environmentManagerOpen, setEnvironmentManagerOpen] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('api-client-history')
    const savedCollections = localStorage.getItem('api-client-collections')
    const savedEnvironments = localStorage.getItem('api-client-environments')
    const savedActiveEnvironment = localStorage.getItem('api-client-active-environment')
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections))
    }
    if (savedEnvironments) {
      const envs = JSON.parse(savedEnvironments)
      setEnvironments(envs)
      
      // Restore active environment if it still exists
      if (savedActiveEnvironment) {
        const activeEnvId = JSON.parse(savedActiveEnvironment)
        const activeEnv = envs.find(env => env.id === activeEnvId)
        if (activeEnv) {
          setActiveEnvironment(activeEnv)
        }
      }
    }
  }, [])

  // Save to localStorage when history or collections change
  useEffect(() => {
    localStorage.setItem('api-client-history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('api-client-collections', JSON.stringify(collections))
  }, [collections])

  useEffect(() => {
    localStorage.setItem('api-client-environments', JSON.stringify(environments))
  }, [environments])

  useEffect(() => {
    localStorage.setItem('api-client-active-environment', JSON.stringify(activeEnvironment?.id || null))
  }, [activeEnvironment])

  const updateRequest = (updates) => {
    setRequest(prev => ({ ...prev, ...updates }))
  }

  const addToHistory = (requestData, responseData) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      request: { ...requestData },
      response: responseData ? {
        status: responseData.status,
        statusText: responseData.statusText,
        data: responseData.data,
        headers: responseData.headers,
        duration: responseData.duration
      } : null
    }
    
    setHistory(prev => [historyItem, ...prev.slice(0, 49)]) // Keep last 50 requests
  }

  const saveToCollection = (name, requestData) => {
    const collectionItem = {
      id: Date.now(),
      name,
      request: { ...requestData },
      createdAt: new Date().toISOString()
    }
    
    setCollections(prev => [...prev, collectionItem])
  }

  const loadFromHistory = (historyItem) => {
    setRequest(historyItem.request)
    if (historyItem.response) {
      setResponse(historyItem.response)
    }
  }

  const loadFromCollection = (collectionItem) => {
    setRequest(collectionItem.request)
  }

  const importCollection = (importedCollections) => {
    // Merge imported collections with existing ones, avoiding duplicates
    setCollections(prev => {
      const existing = new Set(prev.map(item => item.id))
      const newCollections = importedCollections.filter(item => !existing.has(item.id))
      return [...prev, ...newCollections]
    })
  }

  const importWorkspace = (workspaceData) => {
    // Replace current workspace data with imported data
    if (workspaceData.collections) {
      setCollections(workspaceData.collections)
    }
    if (workspaceData.environments) {
      setEnvironments(workspaceData.environments)
      // Reset active environment since we're importing new environments
      setActiveEnvironment(null)
    }
    if (workspaceData.history) {
      setHistory(workspaceData.history)
    }
  }

  const deleteFromCollection = (id) => {
    setCollections(prev => prev.filter(item => item.id !== id))
  }

  const saveEnvironment = (environment) => {
    setEnvironments(prev => {
      const existingIndex = prev.findIndex(env => env.id === environment.id)
      if (existingIndex >= 0) {
        // Update existing environment
        const updated = [...prev]
        updated[existingIndex] = environment
        return updated
      } else {
        // Add new environment
        return [...prev, environment]
      }
    })
  }

  const deleteEnvironment = (id) => {
    setEnvironments(prev => prev.filter(env => env.id !== id))
    if (activeEnvironment?.id === id) {
      setActiveEnvironment(null)
    }
  }

  const setActiveEnv = (environment) => {
    setActiveEnvironment(environment)
  }

  // Variable substitution utility
  const substituteVariables = (text, environment) => {
    if (!environment || !text) return text
    
    let result = text
    environment.variables.forEach(variable => {
      if (variable.enabled && variable.key && variable.value) {
        const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'g')
        result = result.replace(regex, variable.value)
      }
    })
    return result
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        history={history}
        collections={collections}
        onLoadFromHistory={loadFromHistory}
        onLoadFromCollection={loadFromCollection}
        onSaveToCollection={saveToCollection}
        onImportCollection={importCollection}
        onDeleteFromCollection={deleteFromCollection}
        currentRequest={request}
        environments={environments}
        onImportWorkspace={importWorkspace}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeEnvironment={activeEnvironment}
          onOpenEnvironmentManager={() => setEnvironmentManagerOpen(true)}
        />
        
        <div className="flex-1 flex">
          {/* Request Panel */}
          <div className="w-1/2 border-r border-gray-200">
            <RequestPanel
              request={request}
              onUpdateRequest={updateRequest}
              response={response}
              setResponse={setResponse}
              loading={loading}
              setLoading={setLoading}
              onAddToHistory={addToHistory}
              activeEnvironment={activeEnvironment}
              onSubstituteVariables={substituteVariables}
            />
          </div>

          {/* Response Panel */}
          <div className="w-1/2">
            <ResponsePanel
              response={response}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Environment Manager */}
      <EnvironmentManager
        isOpen={environmentManagerOpen}
        onClose={() => setEnvironmentManagerOpen(false)}
        environments={environments}
        activeEnvironment={activeEnvironment}
        onSaveEnvironment={saveEnvironment}
        onDeleteEnvironment={deleteEnvironment}
        onSetActiveEnvironment={setActiveEnv}
      />
    </div>
  )
}

export default App 