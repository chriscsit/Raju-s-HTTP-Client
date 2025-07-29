import React from 'react'
import { Menu, Zap, Github, Globe, Settings } from 'lucide-react'

const Header = ({ onToggleSidebar, activeEnvironment, onOpenEnvironmentManager }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Raju's Client</h1>
              <p className="text-xs text-gray-500">Professional API Testing Tool</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Environment Display */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Globe size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">
                {activeEnvironment ? activeEnvironment.name : 'No Environment'}
              </span>
            </div>
            <button
              onClick={onOpenEnvironmentManager}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Manage Environments"
            >
              <Settings size={16} />
            </button>
          </div>
          
          <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
            <span>Version 1.0.0</span>
          </div>
          
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Github size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 