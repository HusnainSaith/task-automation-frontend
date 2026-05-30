'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getToken, getUser } from '@/lib/auth';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('problem');
  
  useEffect(() => {
    loadClientProfile();
  }, []);

  const loadClientProfile = async () => {
    try {
      const token = getToken()!;
      const user = getUser()!;
      const clients = await api.getClients(token);
      const currentClient = clients.find((c: any) => c.userId === user.id);
      if (currentClient) {
        setClientId(currentClient.id);
      }
    } catch (err) {
      console.error('Failed to load client profile:', err);
    }
  };
  const [problemData, setProblemData] = useState({
    title: '', description: '', address: ''
  });
  const [taskData, setTaskData] = useState({
    title: '', description: '', address: ''
  });
  const [locationAddress, setLocationAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [clientId, setClientId] = useState<string>('');

  const reportProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = getToken()!;
      const response = await api.reportProblem(problemData, token);
      
      if (response.message) {
        setMessage(response.message);
      } else {
        setMessage('Problem reported successfully. A serviceman will be assigned shortly.');
      }
      
      setProblemData({ title: '', description: '', address: '' });
    } catch (err) {
      setMessage('Failed to report problem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = getToken()!;
      const user = getUser()!;
      const response = await api.createTask({
        ...taskData,
        clientId: user.id
      }, token);
      
      setMessage('Task created successfully. A serviceman will be assigned shortly.');
      setTaskData({ title: '', description: '', address: '' });
    } catch (err) {
      setMessage('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setMessage('Client profile not loaded');
      return;
    }
    setLoading(true);
    try {
      const token = getToken()!;
      const response = await api.setClientLocation(clientId, locationAddress, token);
      setMessage('Location updated successfully');
      setLocationAddress('');
    } catch (err) {
      setMessage('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Dashboard</h1>
          <p className="text-gray-600">Manage your service requests and account settings</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('problem')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'problem' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🚨 Report Problem
            </button>
            <button
              onClick={() => setActiveTab('task')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'task' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📋 Create Task
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'location' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📍 Update Location
            </button>
          </div>
        </div>
      
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('Failed') || message.includes('not free') 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.includes('Failed') || message.includes('not free') ? '❌' : '✅'}
              </span>
              {message}
            </div>
          </div>
        )}

        {activeTab === 'problem' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={reportProblem} className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report a Problem</h2>
              <p className="text-gray-600">Describe the issue you're experiencing and we'll assign a technician</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Title</label>
              <input
                type="text"
                value={problemData.title}
                onChange={(e) => setProblemData({...problemData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="e.g., Washing machine not working"
                required
              />
            </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={problemData.description}
            onChange={(e) => setProblemData({...problemData, description: e.target.value})}
            className="w-full p-2 border rounded h-24"
            placeholder="Describe the problem in detail..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={problemData.address}
            onChange={(e) => setProblemData({...problemData, address: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="123 Main St, New York, NY 10001"
            required
          />
        </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Reporting Problem...
                </div>
              ) : (
                '🚨 Report Problem'
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'task' && (
        <form onSubmit={createTask} className="space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Create Task</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Task Title</label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="e.g., Install new equipment"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              className="w-full p-2 border rounded h-24"
              placeholder="Describe the task details..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={taskData.address}
              onChange={(e) => setTaskData({...taskData, address: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="123 Main St, New York, NY 10001"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating Task...' : 'Create Task'}
          </button>
        </form>
      )}

      {activeTab === 'location' && (
        <form onSubmit={updateLocation} className="space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Update Your Location</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="123 Main St, New York, NY 10001"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Updating Location...' : 'Update Location'}
          </button>
        </form>
        )}

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-bold text-blue-900 text-lg mb-3">📋 How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-center"><span className="mr-2">✓</span> Report problems or create tasks with location details</li>
            <li className="flex items-center"><span className="mr-2">✓</span> System automatically finds the nearest available serviceman</li>
            <li className="flex items-center"><span className="mr-2">✓</span> If all servicemen are busy (2 tasks each), you'll be queued</li>
            <li className="flex items-center"><span className="mr-2">✓</span> You'll be notified when a serviceman is assigned</li>
          </ul>
        </div>
      </div>
    </div>
  );
}