import React, { useState, useEffect } from 'react';
import AddStationForm from '../AddStationForm';
import ChargingSessionForm from '../ChargingSessionForm';
import api from '../../api'

const EVChargingSimulation = () => {
  const [stations, setStations] = useState([]);
  const [incomingCars, setIncomingCars] = useState([
    { id: 'car-4', color: '#8b5cf6', direction: 'right', position: -100, destination: { stationId: 1, slotId: 1 }, chargeLevel: 15 },
    { id: 'car-5', color: '#f59e0b', direction: 'left', position: 500, destination: { stationId: 2, slotId: 2 }, chargeLevel: 10 }
  ]);
  
  const [departingCars, setDepartingCars] = useState([]);
  const [time, setTime] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/protected/profile');
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Create charging session
  const createChargingSession = async (stationId, slotId, vehicleNumber, initialChargeLevel) => {
    try {
      const sessionData = {
        station_id: stationId,
        slot_id: slotId,
        user_id: userProfile?.id || "689845ec83cbdd84faac3d57", // Fallback to default user
        vehicle_number: vehicleNumber,
        initial_charge_level: initialChargeLevel
      };

      const response = await api.post('/api/sessions', sessionData);
      console.log('Charging session created:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating charging session:', error);
      return null;
    }
  };

  // Complete charging session
  const completeChargingSession = async (sessionId, finalChargeLevel, energyConsumed) => {
    try {
      const response = await api.post(`/api/sessions/${sessionId}/complete?final_charge_level=${finalChargeLevel}&energy_consumed=${energyConsumed}`);
      console.log('Charging session completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completing charging session:', error);
      return null;
    }
  };

  // Calculate energy consumed based on charge level difference and station power
  const calculateEnergyConsumed = (initialCharge, finalCharge, stationPower) => {
    const chargeDifference = finalCharge - initialCharge;
    // Assuming average EV battery capacity of 60kWh for calculation
    const batteryCapacity = 60; // kWh
    return (chargeDifference / 100) * batteryCapacity;
  };

  // Fetch stations from API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/stations');
        const apiStations = response.data;
        
        // Transform API data to match simulation format
        const transformedStations = apiStations.map((station, index) => ({
          id: station.id,
          name: station.name,
          location: station.location,
          latitude: station.latitude,
          longitude: station.longitude,
          power_output: station.power_output,
          connector_types: station.connector_types,
          price_per_kwh: station.price_per_kwh,
          status: station.status,
          slots: Array.from({ length: station.total_ports }, (_, slotIndex) => {
            const slotId = slotIndex + 1;
            const isOccupied = slotIndex < (station.total_ports - station.available_ports);
            
            return {
              id: slotId,
              status: isOccupied ? 'charging' : 'available',
              car: isOccupied ? {
                id: `car-${station.id}-${slotId}`,
                color: ['#3b82f6', '#16a34a', '#ef4444', '#8b5cf6', '#f59e0b'][slotIndex % 5],
                direction: 'right',
                position: 100,
                isPlugged: true,
                chargeLevel: Math.floor(Math.random() * 80) + 20,
                initialChargeLevel: Math.floor(Math.random() * 20) + 5,
                sessionId: null
              } : null,
              chargeLevel: 0
            };
          })
        }));
        
        setStations(transformedStations);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);
  
  // Animation frame
  useEffect(() => {
    if (stations.length === 0) return;
    
    const timer = setTimeout(() => {
      setTime(prevTime => prevTime + 1);
      
      // Animate incoming cars
      setIncomingCars(prevCars => 
        prevCars.map(car => {
          // Calculate new position
          let newPosition = car.position;
          if (car.direction === 'right') {
            newPosition = Math.min(newPosition + 2, 100);
          } else {
            newPosition = Math.max(newPosition - 2, 100);
          }
          
          // Check if car has arrived
          if ((car.direction === 'right' && newPosition >= 100) || 
              (car.direction === 'left' && newPosition <= 100)) {
            // Car has arrived at destination
            return { ...car, position: 100 };
          }
          
          return { ...car, position: newPosition };
        })
      );
      
      // Animate departing cars
      setDepartingCars(prevCars =>
        prevCars.map(car => {
          // Calculate new position
          let newPosition = car.position;
          if (car.direction === 'right') {
            newPosition = newPosition + 2;
          } else {
            newPosition = newPosition - 2;
          }
          
          // Check if car has left the view
          if ((car.direction === 'right' && newPosition > 500) || 
              (car.direction === 'left' && newPosition < -100)) {
            return null; // Remove car from array
          }
          
          return { ...car, position: newPosition };
        }).filter(car => car !== null)
      );
      
      // Update charging cars
      setStations(prevStations => 
        prevStations.map(station => ({
          ...station,
          slots: station.slots.map(slot => {
            if (slot.status === 'charging' && slot.car && slot.car.isPlugged) {
              const newChargeLevel = Math.min(100, slot.car.chargeLevel + 0.2);
              
              // If fully charged, schedule for departure and complete session
              if (newChargeLevel >= 100 && slot.car.chargeLevel < 100 && slot.car.sessionId) {
                // Complete the charging session
                const energyConsumed = calculateEnergyConsumed(
                  slot.car.initialChargeLevel,
                  newChargeLevel,
                  station.power_output
                );
                completeChargingSession(slot.car.sessionId, newChargeLevel, energyConsumed);
              }
              
              if (newChargeLevel >= 100 && Math.random() < 0.01) {
                // Unplug car
                return {
                  ...slot,
                  car: { ...slot.car, isPlugged: false, chargeLevel: newChargeLevel }
                };
              }
              
              return {
                ...slot,
                car: { ...slot.car, chargeLevel: newChargeLevel }
              };
            }
            return slot;
          })
        }))
      );
      
      // Move cars from incoming to stations
      const readyCars = incomingCars.filter(car => 
        (car.direction === 'right' && car.position >= 100) || 
        (car.direction === 'left' && car.position <= 100)
      );
      
      if (readyCars.length > 0) {
        setIncomingCars(prevCars => 
          prevCars.filter(car => 
            !((car.direction === 'right' && car.position >= 100) || 
              (car.direction === 'left' && car.position <= 100))
          )
        );
        
        setStations(prevStations => 
          prevStations.map(station => {
            const stationCars = readyCars.filter(car => car.destination.stationId === station.id);
            if (stationCars.length === 0) return station;
            
            return {
              ...station,
              slots: station.slots.map(slot => {
                const car = stationCars.find(car => car.destination.slotId === slot.id);
                if (car && slot.status === 'available') {
                  return {
                    ...slot,
                    status: 'arriving',
                    car: { 
                      ...car, 
                      position: 0, 
                      isPlugged: false,
                      initialChargeLevel: car.chargeLevel,
                      sessionId: car.sessionId
                    }
                  };
                }
                return slot;
              })
            };
          })
        );
      }
      
      // Handle cars that are ready to depart
      setStations(prevStations => 
        prevStations.map(station => ({
          ...station,
          slots: station.slots.map(slot => {
            // If car is unplugged and fully charged, move it to departing
            if (slot.car && !slot.car.isPlugged && Math.random() < 0.05) {
              setDepartingCars(prev => [...prev, {
                ...slot.car,
                position: 100,
                direction: Math.random() > 0.5 ? 'right' : 'left'
              }]);
              
              return {
                ...slot,
                status: 'available',
                car: null,
                chargeLevel: 0
              };
            }
            
            // If car just arrived, plug it in and create session
            if (slot.status === 'arriving' && slot.car && !slot.car.isPlugged && Math.random() < 0.1) {
              // Create charging session if it doesn't have one
              if (!slot.car.sessionId) {
                createChargingSession(
                  station.id,
                  slot.id,
                  slot.car.id,
                  slot.car.chargeLevel
                ).then(sessionData => {
                  if (sessionData) {
                    setStations(prevStations => 
                      prevStations.map(prevStation => 
                        prevStation.id === station.id ? {
                          ...prevStation,
                          slots: prevStation.slots.map(prevSlot => 
                            prevSlot.id === slot.id && prevSlot.car ? {
                              ...prevSlot,
                              car: { ...prevSlot.car, sessionId: sessionData.id }
                            } : prevSlot
                          )
                        } : prevStation
                      )
                    );
                  }
                });
              }
              
              return {
                ...slot,
                status: 'charging',
                car: { ...slot.car, isPlugged: true }
              };
            }
            
            return slot;
          })
        }))
      );
      
      // Occasionally add new cars
      if (time % 200 === 0 && incomingCars.length < 3 && Math.random() < 0.5) {
        // Find an available slot
        const availableSlots = [];
        
        stations.forEach(station => {
          station.slots.forEach(slot => {
            if (slot.status === 'available') {
              availableSlots.push({ stationId: station.id, slotId: slot.id });
            }
          });
        });
        
        if (availableSlots.length > 0) {
          const destination = availableSlots[Math.floor(Math.random() * availableSlots.length)];
          const direction = Math.random() > 0.5 ? 'right' : 'left';
          const position = direction === 'right' ? -100 : 500;
          const colors = ['#3b82f6', '#16a34a', '#ef4444', '#8b5cf6', '#f59e0b', '#6366f1'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          setIncomingCars(prev => [
            ...prev,
            {
              id: `car-${Math.random().toString(36).substr(2, 9)}`,
              color,
              direction,
              position,
              destination,
              chargeLevel: Math.floor(Math.random() * 20) + 5,
              sessionId: null
            }
          ]);
        }
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [time, stations, incomingCars, userProfile]);
  
  // Add a new car to the simulation
  const addNewCar = () => {
    // Find an available slot
    const availableSlots = [];
    
    stations.forEach(station => {
      station.slots.forEach(slot => {
        if (slot.status === 'available') {
          availableSlots.push({ stationId: station.id, slotId: slot.id });
        }
      });
    });
    
    if (availableSlots.length > 0) {
      const destination = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      const position = direction === 'right' ? -100 : 500;
      const colors = ['#3b82f6', '#16a34a', '#ef4444', '#8b5cf6', '#f59e0b', '#6366f1'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      setIncomingCars(prev => [
        ...prev,
        {
          id: `car-${Math.random().toString(36).substr(2, 9)}`,
          color,
          direction,
          position,
          destination,
          chargeLevel: Math.floor(Math.random() * 20) + 5,
          sessionId: null
        }
      ]);
    }
  };
  
  const handleAddStation = async (newStation) => {
    console.log('New station added:', newStation);
    setShowAddForm(false);
    
    // Refresh stations from API
    try {
      const response = await api.get('/api/stations');
      const apiStations = response.data;
      
      // Transform API data to match simulation format
      const transformedStations = apiStations.map((station, index) => ({
        id: station.id,
        name: station.name,
        location: station.location,
        latitude: station.latitude,
        longitude: station.longitude,
        power_output: station.power_output,
        connector_types: station.connector_types,
        price_per_kwh: station.price_per_kwh,
        status: station.status,
        slots: Array.from({ length: station.total_ports }, (_, slotIndex) => {
          const slotId = slotIndex + 1;
          const isOccupied = slotIndex < (station.total_ports - station.available_ports);
          
          return {
            id: slotId,
            status: isOccupied ? 'charging' : 'available',
            car: isOccupied ? {
              id: `car-${station.id}-${slotId}`,
              color: ['#3b82f6', '#16a34a', '#ef4444', '#8b5cf6', '#f59e0b'][slotIndex % 5],
              direction: 'right',
              position: 100,
              isPlugged: true,
              chargeLevel: Math.floor(Math.random() * 80) + 20,
              initialChargeLevel: Math.floor(Math.random() * 20) + 5,
              sessionId: null
            } : null,
            chargeLevel: 0
          };
        })
      }));
      
      setStations(transformedStations);
    } catch (error) {
      console.error('Error refreshing stations:', error);
    }
  };

  const handleAddSession = async (newSession) => {
    console.log('New charging session started:', newSession);
    setShowSessionForm(false);
    
    // Find the station and slot to update
    const stationId = newSession.station_id;
    const slotId = newSession.slot_id;
    
    // Create the charging session first
    const sessionData = await createChargingSession(
      stationId,
      slotId,
      newSession.vehicle_number,
      newSession.initial_charge_level
    );
    
    if (sessionData) {
      // Add a new incoming car for this session
      const colors = ['#3b82f6', '#16a34a', '#ef4444', '#8b5cf6', '#f59e0b', '#6366f1'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      const position = direction === 'right' ? -100 : 500;
      
      setIncomingCars(prev => [
        ...prev,
        {
          id: newSession.vehicle_number,
          color,
          direction,
          position,
          destination: { stationId, slotId },
          chargeLevel: newSession.initial_charge_level,
          vehicleNumber: newSession.vehicle_number,
          userId: newSession.user_id,
          sessionId: sessionData.id
        }
      ]);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading charging stations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.125rem', color: '#ef4444' }}>Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>EV Charging Station Simulation</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {stations.map(station => (
          <div key={station.id} style={{ position: 'relative' }}>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{station.name}</h3>
              <span style={{
                fontSize: '0.875rem',
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '4px 8px',
                borderRadius: '16px'
              }}>
                {station.slots.filter(slot => slot.status === 'charging').length}/{station.slots.length} Active
              </span>
              <span style={{
                fontSize: '0.875rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '4px 8px',
                borderRadius: '16px'
              }}>
                {station.power_output}kW
              </span>
              <span style={{
                fontSize: '0.875rem',
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                padding: '4px 8px',
                borderRadius: '16px'
              }}>
                ${station.price_per_kwh}/kWh
              </span>
              <span style={{
                fontSize: '0.875rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '4px 8px',
                borderRadius: '16px'
              }}>
                📍 {station.location}
              </span>
            </div>
            
            {/* Connector types */}
            <div style={{ marginBottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {station.connector_types.map(type => (
                <span key={type} style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  {type}
                </span>
              ))}
            </div>
            
            {/* Road */}
            <div style={{
              height: '128px',
              backgroundColor: '#d1d5db',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              {/* Road markings */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '2px',
                borderTop: '2px dashed white'
              }}></div>
              
              {/* Charging stations */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center'
              }}>
                {station.slots.map(slot => (
                  <div key={slot.id} style={{ position: 'relative' }}>
                    {/* Charging pad */}
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      width: '80px',
                      height: '8px',
                      backgroundColor: '#1f2937',
                      borderRadius: '8px 8px 0 0',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}></div>
                    
                    {/* Charging station */}
                    <div style={{
                      position: 'relative',
                      width: '48px',
                      height: '80px',
                      backgroundColor: '#1f2937',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      {/* Charging connector */}
                      {slot.car && (
                        <div style={{
                          position: 'absolute',
                          width: '8px',
                          height: '40px',
                          backgroundColor: '#fbbf24',
                          top: '-40px',
                          left: '50%',
                          transform: `translateX(-50%) scaleY(${slot.car.isPlugged ? 1 : 0})`,
                          transition: 'all 0.3s'
                        }}></div>
                      )}
                      
                      {/* Status indicator */}
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        marginTop: '8px',
                        backgroundColor: slot.status === 'available' ? '#10b981' : 
                                      slot.status === 'charging' ? '#3b82f6' : 
                                      slot.status === 'arriving' ? '#f59e0b' : '#6b7280',
                        animation: slot.status === 'charging' ? 'pulse 2s infinite' : 'none'
                      }}></div>
                      
                      {/* Slot number */}
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        color: 'white',
                        fontWeight: '600'
                      }}>{slot.id}</div>
                      
                      {/* Charge level */}
                      {slot.car && slot.car.isPlugged && (
                        <div style={{
                          position: 'absolute',
                          right: '-64px',
                          top: 0,
                          width: '56px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          padding: '4px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '4px', textAlign: 'center' }}>Charge</div>
                          <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '16px', height: '8px' }}>
                            <div style={{
                              backgroundColor: '#16a34a',
                              height: '8px',
                              borderRadius: '16px',
                              width: `${slot.car.chargeLevel}%`
                            }}></div>
                          </div>
                          <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '4px' }}>{Math.round(slot.car.chargeLevel)}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cars at charging stations */}
              {station.slots.map(slot => slot.car && (
                <div 
                  key={`station-${station.id}-slot-${slot.id}-car`}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${slot.id * (100/(station.slots.length + 1))}%`,
                    transform: 'translateY(-50%) translateX(-50%)',
                    zIndex: 10,
                    transition: 'all 0.3s'
                  }}
                >
                  <Car color={slot.car.color} />
                </div>
              ))}
              
              {/* Incoming cars */}
              {incomingCars
                .filter(car => car.destination.stationId === station.id)
                .map(car => (
                  <div 
                    key={car.id}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: car.direction === 'right' ? `${car.position}%` : `${car.position}%`,
                      transform: `translateY(-50%) scaleX(${car.direction === 'left' ? -1 : 1})`,
                      zIndex: 5,
                      transition: 'all 0.05s'
                    }}
                  >
                    <Car color={car.color} />
                    <div style={{
                      position: 'absolute',
                      top: '-32px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '4px' }}>🔋</span>
                        <span>{car.chargeLevel}%</span>
                      </div>
                    </div>
                  </div>
                ))
              }
              
              {/* Departing cars */}
              {departingCars
                .map(car => (
                  <div 
                    key={car.id}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${car.position}%`,
                      transform: `translateY(-50%) scaleX(${car.direction === 'left' ? -1 : 1})`,
                      zIndex: 5,
                      transition: 'all 0.05s'
                    }}
                  >
                    <Car color={car.color} />
                    <div style={{
                      position: 'absolute',
                      top: '-32px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '4px' }}>🔋</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            
            {/* Station info */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${station.slots.length}, 1fr)`, gap: '16px' }}>
              {station.slots.map(slot => (
                <div 
                  key={`info-${station.id}-${slot.id}`} 
                  style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #f3f4f6'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '500' }}>Slot #{slot.id}</div>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: slot.status === 'available' ? '#10b981' : 
                                    slot.status === 'charging' ? '#3b82f6' : 
                                    slot.status === 'arriving' ? '#f59e0b' : '#6b7280'
                    }}></div>
                  </div>
                  
                  <div style={{ fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#6b7280' }}>Status:</span>
                      <span style={{ textTransform: 'capitalize' }}>{slot.status}</span>
                    </div>
                    
                    {slot.car && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#6b7280' }}>Connected:</span>
                          <span>{slot.car.isPlugged ? 'Yes' : 'No'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Charge:</span>
                          <span>{Math.round(slot.car.chargeLevel)}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <span style={{ marginRight: '8px' }}>🏢</span> Add Station
          </button>
          <button 
            onClick={() => setShowSessionForm(true)}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
          >
            <span style={{ marginRight: '8px' }}>⚡</span> Start Session
          </button>
          <button 
            onClick={addNewCar}
            style={{
              backgroundColor: '#16a34a',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
          >
            <span style={{ marginRight: '8px' }}>🚗</span> Add New Vehicle
          </button>
        </div>
      </div>
      

      
      {showAddForm && (
        <AddStationForm
          onAddStation={handleAddStation}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      
      {showSessionForm && (
        <ChargingSessionForm
          stations={stations}
          onAddSession={handleAddSession}
          onCancel={() => setShowSessionForm(false)}
        />
      )}
    </div>
  );
};

// Car component
const Car = ({ color }) => {
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="30" height="8" rx="2" fill={color} />
      <rect x="2" y="14" width="36" height="4" rx="1" fill={color} />
      <rect x="7" y="6" width="26" height="4" rx="1" fill={color} />
      <rect x="10" y="2" width="20" height="4" rx="1" fill={color} />
      <circle cx="10" cy="18" r="3" fill="black" />
      <circle cx="30" cy="18" r="3" fill="black" />
      <rect x="32" y="8" width="4" height="2" fill="yellow" />
      <rect x="4" y="8" width="4" height="2" fill="red" />
    </svg>
  );
};

export default EVChargingSimulation;