import React, { useState } from 'react';

const AddStationForm = ({ onAddStation, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: 0,
    longitude: 0,
    total_ports: 1,
    available_ports: 0,
    power_output: 1,
    connector_types: [],
    price_per_kwh: 1
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const connectorTypeOptions = [
    'Type 1 (J1772)',
    'Type 2 (Mennekes)',
    'CHAdeMO',
    'CCS Type 1',
    'CCS Type 2',
    'Tesla Supercharger',
    'GB/T AC',
    'GB/T DC'
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleConnectorTypeChange = (connectorType) => {
    setFormData(prev => ({
      ...prev,
      connector_types: prev.connector_types.includes(connectorType)
        ? prev.connector_types.filter(type => type !== connectorType)
        : [...prev.connector_types, connectorType]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Station name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (formData.total_ports < 1) {
      newErrors.total_ports = 'Total ports must be at least 1';
    }

    if (formData.available_ports < 0) {
      newErrors.available_ports = 'Available ports cannot be negative';
    }

    if (formData.available_ports > formData.total_ports) {
      newErrors.available_ports = 'Available ports cannot exceed total ports';
    }

    if (formData.power_output < 1) {
      newErrors.power_output = 'Power output must be at least 1 kW';
    }

    if (formData.connector_types.length === 0) {
      newErrors.connector_types = 'At least one connector type is required';
    }

    if (formData.price_per_kwh < 0) {
      newErrors.price_per_kwh = 'Price per kWh cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://fastapi-app-121646825275.us-central1.run.app/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newStation = await response.json();
        onAddStation(newStation);
        // Reset form
        setFormData({
          name: '',
          location: '',
          latitude: 0,
          longitude: 0,
          total_ports: 1,
          available_ports: 0,
          power_output: 1,
          connector_types: [],
          price_per_kwh: 1
        });
      } else {
        const errorData = await response.json();
        console.error('Error adding station:', errorData);
        alert('Failed to add station. Please try again.');
      }
    } catch (error) {
      console.error('Error adding station:', error);
      alert('Failed to add station. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Add New Charging Station</h2>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Station Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter station name"
              />
              {errors.name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.name}</span>}
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.location ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter location address"
              />
              {errors.location && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.location}</span>}
            </div>

            {/* Coordinates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Latitude *
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="0.000001"
                  min="-90"
                  max="90"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.latitude ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="0.000000"
                />
                {errors.latitude && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.latitude}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Longitude *
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="0.000001"
                  min="-180"
                  max="180"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.longitude ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="0.000000"
                />
                {errors.longitude && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.longitude}</span>}
              </div>
            </div>

            {/* Ports */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Total Ports *
                </label>
                <input
                  type="number"
                  name="total_ports"
                  value={formData.total_ports}
                  onChange={handleChange}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.total_ports ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.total_ports && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.total_ports}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Available Ports *
                </label>
                <input
                  type="number"
                  name="available_ports"
                  value={formData.available_ports}
                  onChange={handleChange}
                  min="0"
                  max={formData.total_ports}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.available_ports ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.available_ports && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.available_ports}</span>}
              </div>
            </div>

            {/* Power Output and Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Power Output (kW) *
                </label>
                <input
                  type="number"
                  name="power_output"
                  value={formData.power_output}
                  onChange={handleChange}
                  min="1"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.power_output ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.power_output && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.power_output}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Price per kWh *
                </label>
                <input
                  type="number"
                  name="price_per_kwh"
                  value={formData.price_per_kwh}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${errors.price_per_kwh ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.price_per_kwh && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.price_per_kwh}</span>}
              </div>
            </div>

            {/* Connector Types */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Connector Types *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {connectorTypeOptions.map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.connector_types.includes(type)}
                      onChange={() => handleConnectorTypeChange(type)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px' }}>{type}</span>
                  </label>
                ))}
              </div>
              {errors.connector_types && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.connector_types}</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#16a34a',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add Station'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStationForm;