import React, { useState } from 'react'
import { X, Plus, Trash2, Settings, Globe, Eye, EyeOff, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const EnvironmentManager = ({ 
  isOpen, 
  onClose, 
  environments, 
  activeEnvironment,
  onSaveEnvironment,
  onDeleteEnvironment,
  onSetActiveEnvironment
}) => {
  const [newEnvName, setNewEnvName] = useState('')
  const [editingEnv, setEditingEnv] = useState(null)
  const [showValues, setShowValues] = useState(false)

  const createNewEnvironment = () => {
    if (!newEnvName.trim()) {
      toast.error('Please enter an environment name')
      return
    }

    const newEnv = {
      id: Date.now(),
      name: newEnvName.trim(),
      variables: [
        { key: '', value: '', enabled: true }
      ]
    }

    setEditingEnv(newEnv)
    setNewEnvName('')
  }

  const saveEnvironment = () => {
    if (!editingEnv) return

    if (!editingEnv.name.trim()) {
      toast.error('Environment name is required')
      return
    }

    onSaveEnvironment(editingEnv)
    setEditingEnv(null)
    toast.success('Environment saved successfully')
  }

  const addVariable = () => {
    if (!editingEnv) return

    setEditingEnv({
      ...editingEnv,
      variables: [...editingEnv.variables, { key: '', value: '', enabled: true }]
    })
  }

  const updateVariable = (index, field, value) => {
    if (!editingEnv) return

    const newVariables = [...editingEnv.variables]
    newVariables[index] = { ...newVariables[index], [field]: value }
    setEditingEnv({ ...editingEnv, variables: newVariables })
  }

  const removeVariable = (index) => {
    if (!editingEnv) return

    const newVariables = editingEnv.variables.filter((_, i) => i !== index)
    setEditingEnv({ ...editingEnv, variables: newVariables })
  }

  const startEditing = (env) => {
    setEditingEnv({ ...env })
  }

  const cancelEditing = () => {
    setEditingEnv(null)
    setNewEnvName('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-4/5 max-w-4xl h-4/5 max-h-[800px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Environment Manager</h2>
              <p className="text-sm text-gray-600">Manage environment variables for your requests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex">
          {/* Environment List */}
          <div className="w-1/3 border-r border-gray-200 p-4">
            <div className="mb-4">
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  placeholder="New environment name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && createNewEnvironment()}
                />
                <button
                  onClick={createNewEnvironment}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Environments</div>
              
              {/* No Environment Option */}
              <div
                onClick={() => onSetActiveEnvironment(null)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                  !activeEnvironment 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm">No Environment</div>
                <div className="text-xs text-gray-500 mt-1">No variables</div>
              </div>

              {environments.map((env) => (
                <div
                  key={env.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border group ${
                    activeEnvironment?.id === env.id 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div 
                    onClick={() => onSetActiveEnvironment(env)}
                    className="flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{env.name}</div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(env)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 rounded"
                          title="Edit environment"
                        >
                          <Settings size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteEnvironment(env.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                          title="Delete environment"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {env.variables.filter(v => v.key && v.enabled).length} variables
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Editor */}
          <div className="flex-1 p-4">
            {editingEnv ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <input
                      type="text"
                      value={editingEnv.name}
                      onChange={(e) => setEditingEnv({ ...editingEnv, name: e.target.value })}
                      className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                      placeholder="Environment name"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Define variables that can be used in your requests using {'{'}{'{'}<span className="font-mono">variable_name</span>{'}}'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowValues(!showValues)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      {showValues ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{showValues ? 'Hide' : 'Show'} Values</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700 pb-2 border-b border-gray-200">
                      <div className="col-span-1"></div>
                      <div className="col-span-5">Variable</div>
                      <div className="col-span-5">Value</div>
                      <div className="col-span-1"></div>
                    </div>

                    {editingEnv.variables.map((variable, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={variable.enabled}
                            onChange={(e) => updateVariable(index, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={variable.key}
                            onChange={(e) => updateVariable(index, 'key', e.target.value)}
                            placeholder="Variable name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="col-span-5">
                          <input
                            type={showValues ? "text" : "password"}
                            value={variable.value}
                            onChange={(e) => updateVariable(index, 'value', e.target.value)}
                            placeholder="Variable value"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removeVariable(index)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            disabled={editingEnv.variables.length === 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addVariable}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors mt-4"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Add Variable
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEnvironment}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save Environment</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                <div>
                  <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select an Environment</p>
                  <p className="text-sm">Choose an environment to edit or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentManager 