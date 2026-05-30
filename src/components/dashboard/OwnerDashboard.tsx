'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

import MapDashboard from './MapDashboard';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tasks, setTasks] = useState([]);

  // Client creation
  const [clientData, setClientData] = useState({
    email: '', password: '', name: '', phone: '', address: ''
  });

  // Serviceman creation
  const [servicemanData, setServicemanData] = useState({
    email: '', password: '', name: '', phone: '', skills: ''
  });

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken()!;
      const response = await api.createClient(clientData, token);
      
      // Set client location if address provided
      if (clientData.address && response.client?.id) {
        await api.setClientLocation(response.client.id, clientData.address, token);
      }
      
      setMessage('Client created successfully with location');
      setClientData({ email: '', password: '', name: '', phone: '', address: '' });
    } catch (err) {
      setMessage('Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const createServiceman = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken()!;
      const skills = servicemanData.skills.split(',').map(s => s.trim()).filter(Boolean);
      await api.createServiceman({ ...servicemanData, skills }, token);
      setMessage('Serviceman created successfully');
      setServicemanData({ email: '', password: '', name: '', phone: '', skills: '' });
    } catch (err) {
      setMessage('Failed to create serviceman');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Company Dashboard</h1>
        
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setActiveTab('map')}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            📍 Map View
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'clients' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            👥 Create Client
          </button>
          <button
            onClick={() => setActiveTab('servicemen')}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'servicemen' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            🔧 Create Serviceman
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            📋 View Tasks
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        {activeTab === 'clients' && (
        <form onSubmit={createClient} className="space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Create New Client</h2>
          <input
            type="email"
            placeholder="Email"
            value={clientData.email}
            onChange={(e) => setClientData({...clientData, email: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={clientData.password}
            onChange={(e) => setClientData({...clientData, password: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={clientData.name}
            onChange={(e) => setClientData({...clientData, name: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={clientData.phone}
            onChange={(e) => setClientData({...clientData, phone: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Address (e.g., 123 Main St, New York, NY)"
            value={clientData.address}
            onChange={(e) => setClientData({...clientData, address: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Client'}
          </button>
        </form>
      )}

      {activeTab === 'servicemen' && (
        <form onSubmit={createServiceman} className="space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Create New Serviceman</h2>
          <input
            type="email"
            placeholder="Email"
            value={servicemanData.email}
            onChange={(e) => setServicemanData({...servicemanData, email: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={servicemanData.password}
            onChange={(e) => setServicemanData({...servicemanData, password: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={servicemanData.name}
            onChange={(e) => setServicemanData({...servicemanData, name: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={servicemanData.phone}
            onChange={(e) => setServicemanData({...servicemanData, phone: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Skills (comma separated)"
            value={servicemanData.skills}
            onChange={(e) => setServicemanData({...servicemanData, skills: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Serviceman'}
          </button>
        </form>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 h-full">
        {activeTab === 'map' && <MapDashboard />}
        {activeTab === 'tasks' && <TasksView />}
      </div>
    </div>
  );
}

function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const token = getToken()!;
      const response = await api.getTasks(token);
      setTasks(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Tasks ({tasks.length})</h2>
        <button
          onClick={loadTasks}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task: any) => (
            <div key={task.id} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{task.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{task.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                Client: {task.client?.user?.profile?.name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Location: {task.location?.addressLine}
              </p>
              <p className="text-xs text-gray-400">
                Created: {new Date(task.createdAt).toLocaleString()}
              </p>
              {task.completedAt && (
                <p className="text-xs text-gray-400">
                  Completed: {new Date(task.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}