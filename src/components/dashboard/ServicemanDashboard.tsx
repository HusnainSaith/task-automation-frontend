'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getToken, getUser } from '@/lib/auth';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  client: { user: { profile: { name: string } } };
  location: { addressLine: string };
}

export default function ServicemanDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [servicemanId, setServicemanId] = useState<string>('');
  const user = getUser();

  useEffect(() => {
    loadServicemanProfile();
    loadTasks();
  }, []);

  const loadServicemanProfile = async () => {
    try {
      const token = getToken()!;
      const profile = await api.getServicemanProfile(token);
      console.log('Serviceman profile:', profile);
      if (profile.id) {
        setServicemanId(profile.id);
        setIsOnline(profile.isOnline || false);
      }
    } catch (err) {
      console.error('Failed to load serviceman profile:', err);
    }
  };

  const loadTasks = async () => {
    try {
      const token = getToken()!;
      const response = await api.getTasks(token, 'assigned,in_progress');
      setTasks(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Failed to load tasks');
      setTasks([]);
    }
  };

  const completeTask = async (taskId: string) => {
    setLoading(true);
    try {
      const token = getToken()!;
      const response = await api.completeTask(taskId, token);
      setMessage(response.message || `Task ${taskId} completed successfully`);
      loadTasks(); // Reload tasks
    } catch (err) {
      setMessage('Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const setLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken()!;
      console.log('Setting location for current user. Address:', locationAddress);
      const response = await api.setServicemanLocation(locationAddress, token);
      console.log('Location response:', response);
      setMessage('Location updated successfully');
      setLocationAddress('');
      // Reload serviceman profile to get updated location
      loadServicemanProfile();
    } catch (err) {
      console.error('Location update error:', err);
      setMessage('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!servicemanId) {
      setMessage('Serviceman profile not loaded');
      return;
    }
    setLoading(true);
    try {
      const token = getToken()!;
      const newStatus = !isOnline;
      await api.toggleServicemanStatus(servicemanId, newStatus, token);
      setIsOnline(newStatus);
      setMessage(`You are now ${newStatus ? 'online' : 'offline'}`);
    } catch (err) {
      setMessage('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Serviceman Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded text-sm ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={toggleStatus}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:opacity-50`}
          >
            Go {isOnline ? 'Offline' : 'Online'}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}

      {/* Set Location */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="font-semibold mb-2">Set Your Location</h3>
        <form onSubmit={setLocation} className="flex space-x-2">
          <input
            type="text"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            placeholder="Enter your current address"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Update Location
          </button>
        </form>
      </div>

      {/* Active Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Active Tasks ({tasks.length})</h2>
        
        {tasks.length === 0 ? (
          <p className="text-gray-500">No active tasks assigned</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{task.description}</p>
                <p className="text-sm text-gray-500 mb-2">
                  Client: {task.client?.user?.profile?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Location: {task.location?.addressLine}
                </p>
                <button
                  onClick={() => completeTask(task.id)}
                  disabled={loading}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Mark Complete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}