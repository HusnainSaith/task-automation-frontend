'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface User {
  id: string;
  user: {
    email: string;
    profile: { name: string; phone: string };
  };
  homeBaseLocation?: {
    lat: number;
    lng: number;
    addressLine: string;
  };
  defaultLocation?: {
    lat: number;
    lng: number;
    addressLine: string;
  };
}

export default function MapDashboard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [servicemen, setServicemen] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = getToken()!;
      const [servicemanData, clientData, tasksData] = await Promise.all([
        api.getServicemen(token),
        api.getClients(token),
        api.getAllTasks(token)
      ]);
      console.log('Loaded tasks data:', tasksData);
      console.log('Loaded servicemen for map:', servicemanData?.map(s => ({
        id: s.id,
        name: s.user?.profile?.name,
        homeBaseLocationId: s.homeBaseLocationId,
        hasLocation: !!s.homeBaseLocation,
        location: s.homeBaseLocation
      })));
      console.log('Loaded clients for map:', clientData?.map(c => ({
        id: c.id,
        name: c.user?.profile?.name,
        defaultLocationId: c.defaultLocationId,
        hasLocation: !!c.defaultLocation,
        location: c.defaultLocation
      })));
      setServicemen(servicemanData || []);
      setClients(clientData || []);
      setUserTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      console.error('Failed to load data');
    }
  };

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 12,
      });
      
      const directionsServiceInstance = new window.google.maps.DirectionsService();
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
      
      directionsRendererInstance.setMap(mapInstance);
      
      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
    };

    if (!window.google) {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        // Wait for existing script to load
        const checkGoogle = () => {
          if (window.google) {
            initMap();
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
      }
    } else {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasMarkers = false;

    console.log('Creating markers for servicemen:', servicemen.length);
    console.log('Creating markers for clients:', clients.length);

    // Add serviceman markers (blue)
    servicemen.forEach((serviceman, index) => {
      console.log(`Serviceman ${index}:`, {
        id: serviceman.id,
        name: serviceman.user?.profile?.name,
        hasHomeBaseLocation: !!serviceman.homeBaseLocation,
        location: serviceman.homeBaseLocation
      });
      
      if (serviceman.homeBaseLocation && serviceman.homeBaseLocation.lat != null && serviceman.homeBaseLocation.lng != null) {
        const lat = Number(serviceman.homeBaseLocation.lat);
        const lng = Number(serviceman.homeBaseLocation.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const position = { lat, lng };
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: `Serviceman: ${serviceman.user?.profile?.name || 'Unknown'}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
          });

          marker.addListener('click', () => {
            setSelectedUser(serviceman);
          });
          
          newMarkers.push(marker);
          bounds.extend(position);
          hasMarkers = true;
          console.log(`Added blue marker for serviceman: ${serviceman.user?.profile?.name}`);
        }
      }
    });

    // Add client markers (orange)
    clients.forEach((client, index) => {
      console.log(`Client ${index}:`, {
        id: client.id,
        name: client.user?.profile?.name,
        hasDefaultLocation: !!client.defaultLocation,
        location: client.defaultLocation
      });
      
      if (client.defaultLocation && client.defaultLocation.lat != null && client.defaultLocation.lng != null) {
        const lat = Number(client.defaultLocation.lat);
        const lng = Number(client.defaultLocation.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const position = { lat, lng };
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: `Client: ${client.user?.profile?.name || 'Unknown'}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: '#F97316',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
          });

          marker.addListener('click', () => {
            setSelectedUser(client);
          });
          
          newMarkers.push(marker);
          bounds.extend(position);
          hasMarkers = true;
          console.log(`Added orange marker for client: ${client.user?.profile?.name}`);
        }
      }
    });

    // Add task markers (red for incomplete, green for completed)
    userTasks.forEach((task, index) => {
      console.log(`Task ${index}:`, {
        id: task.id,
        title: task.title,
        status: task.status,
        hasLocation: !!task.location,
        location: task.location
      });
      
      if (task.location && task.location.lat != null && task.location.lng != null) {
        const lat = Number(task.location.lat);
        const lng = Number(task.location.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const position = { lat, lng };
          const isCompleted = task.status === 'completed';
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: `Task: ${task.title} (${task.status})`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: isCompleted ? '#10B981' : '#EF4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          marker.addListener('click', () => {
            // Show route from assigned serviceman to task
            showRouteToTask(task);
            
            // Show task details in popup
            setSelectedUser({
              id: task.id,
              user: {
                email: task.client?.user?.email || 'Unknown',
                profile: {
                  name: `Task: ${task.title}`,
                  phone: task.status
                }
              },
              taskDetails: task
            } as any);
          });
          
          newMarkers.push(marker);
          bounds.extend(position);
          hasMarkers = true;
          console.log(`Added ${isCompleted ? 'green' : 'red'} marker for task: ${task.title}`);
        }
      }
    });

    setMarkers(newMarkers);
    console.log(`Total markers created: ${newMarkers.length}`);

    // Fit map to show all markers
    if (hasMarkers) {
      map.fitBounds(bounds);
    }
  }, [map, servicemen, clients, userTasks]);

  const showRouteToTask = (task: any) => {
    if (!directionsService || !directionsRenderer || !map) return;
    
    // Find the assigned serviceman for this task
    const assignedServiceman = servicemen.find(serviceman => 
      task.assignments?.some((assignment: any) => assignment.servicemanId === serviceman.id)
    );
    
    if (!assignedServiceman?.homeBaseLocation || !task.location) {
      console.log('Cannot show route: missing serviceman location or task location');
      return;
    }
    
    const origin = {
      lat: Number(assignedServiceman.homeBaseLocation.lat),
      lng: Number(assignedServiceman.homeBaseLocation.lng)
    };
    
    const destination = {
      lat: Number(task.location.lat),
      lng: Number(task.location.lng)
    };
    
    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    };
    
    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
        
        // Recenter map to show the route
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(destination);
        map.fitBounds(bounds);
        
        console.log('Route displayed from serviceman to task');
      } else {
        console.error('Directions request failed:', status);
      }
    });
  };
  
  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any);
    }
  };

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 space-x-2">
        <button
          onClick={loadData}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Refresh Map
        </button>
        <button
          onClick={clearRoute}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Clear Route
        </button>
      </div>
      <div ref={mapRef} className="w-full h-full min-h-[500px]" />
      
      {selectedUser && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md z-10 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">User Profile</h3>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            <p><strong>Name:</strong> {selectedUser.user.profile.name}</p>
            <p><strong>Email:</strong> {selectedUser.user.email}</p>
            <p><strong>Phone:</strong> {selectedUser.user.profile.phone}</p>
            <p><strong>Type:</strong> {selectedUser.homeBaseLocation ? 'Serviceman' : 'Client'}</p>
            {selectedUser.homeBaseLocation && (
              <p><strong>Location:</strong> {selectedUser.homeBaseLocation.addressLine}</p>
            )}
            {selectedUser.defaultLocation && (
              <p><strong>Location:</strong> {selectedUser.defaultLocation.addressLine}</p>
            )}
            
            {/* Show assigned tasks for servicemen */}
            {selectedUser.homeBaseLocation && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Assigned Tasks:</h4>
                {(() => {
                  console.log('Selected serviceman ID:', selectedUser.id);
                  console.log('All tasks:', userTasks);
                  console.log('Tasks with assignments:', userTasks.filter(task => task.assignments && task.assignments.length > 0));
                  
                  const assignedTasks = userTasks.filter(task => {
                    if (!task.assignments || task.assignments.length === 0) {
                      return false;
                    }
                    return task.assignments.some((assignment: any) => {
                      console.log('Checking assignment:', assignment.servicemanId, 'vs', selectedUser.id);
                      return assignment.servicemanId === selectedUser.id;
                    });
                  });
                  
                  console.log('Filtered assigned tasks:', assignedTasks);
                  
                  if (assignedTasks.length === 0) {
                    return (
                      <div>
                        <p className="text-gray-500 text-sm">No active tasks</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Debug: Found {userTasks.length} total tasks, {userTasks.filter(t => t.assignments?.length > 0).length} with assignments
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-2">
                      {assignedTasks.map((task: any) => (
                        <div key={task.id} className="bg-gray-50 p-2 rounded text-sm">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-gray-600">{task.description}</p>
                          <p className="text-xs text-gray-500">Status: {task.status}</p>
                          <p className="text-xs text-gray-500">Location: {task.location?.addressLine}</p>
                          <button
                            onClick={() => showRouteToTask(task)}
                            className="mt-1 bg-blue-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Show Route
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}