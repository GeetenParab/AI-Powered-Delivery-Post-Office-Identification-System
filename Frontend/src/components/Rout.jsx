import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Rout = () => {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routePoints, setRoutePoints] = useState([]);
  const [distances, setDistances] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        // Get addressId from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const addressId = urlParams.get('addressId');
        
        if (!addressId) {
          throw new Error('No address ID provided');
        }
        
        setLoading(true);
        const response = await axios.post(`http://localhost:5000/api/validate-pin/route/${addressId}`);
        setRouteData(response.data);
        
        // Process the route data
        processRouteData(response.data);
      } catch (err) {
        console.error('Error fetching route data:', err);
        setError(err.message || 'Failed to fetch route data');
      } finally {
        setLoading(false);
      }
    };

    fetchRouteData();

    // Load OpenLayers script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/openlayers/4.6.5/ol.js';
    script.async = true;
    script.onload = () => {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/openlayers/4.6.5/ol.css';
      document.head.appendChild(link);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Calculate distance between two geographical points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const processRouteData = (data) => {
    if (!data) return;
    
    const points = [];
    const distanceArray = [];
    
    // Add sender post office
    if (data.senderPostOffice && data.senderPostOffice.Latitude && data.senderPostOffice.Longitude) {
      const lat = parseFloat(data.senderPostOffice.Latitude);
      const lng = parseFloat(data.senderPostOffice.Longitude);
      points.push({
        type: 'sender',
        name: data.senderPostOffice.OfficeName,
        position: [lng, lat], // OpenLayers uses [lon, lat] order
        details: data.senderPostOffice
      });
    }
    
    // Add RMS1 if exists
    if (data.rms1 && data.rms1.Latitude && data.rms1.Longitude) {
      const lat = parseFloat(data.rms1.Latitude);
      const lng = parseFloat(data.rms1.Longitude);
      points.push({
        type: 'rms1',
        name: data.rms1.OfficeName,
        position: [lng, lat],
        details: data.rms1
      });
    }
    
    // Add RMS2 if exists
    if (data.rms2 && data.rms2.Latitude && data.rms2.Longitude) {
      const lat = parseFloat(data.rms2.Latitude);
      const lng = parseFloat(data.rms2.Longitude);
      points.push({
        type: 'rms2',
        name: data.rms2.OfficeName,
        position: [lng, lat],
        details: data.rms2
      });
    }
    
    // Add destination post office
    if (data.destinationPostOffice && data.destinationPostOffice.Latitude && data.destinationPostOffice.Longitude) {
      const lat = parseFloat(data.destinationPostOffice.Latitude);
      const lng = parseFloat(data.destinationPostOffice.Longitude);
      points.push({
        type: 'destination',
        name: data.destinationPostOffice.OfficeName,
        position: [lng, lat],
        details: data.destinationPostOffice
      });
    }
    
    // Calculate distances between consecutive points
    let totalDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i+1];
      const distance = calculateDistance(
        p1.position[1], p1.position[0], // lat1, lon1
        p2.position[1], p2.position[0]  // lat2, lon2
      );
      distanceArray.push({
        from: p1.name,
        to: p2.name,
        distance: distance
      });
      totalDist += distance;
    }
    
    setRoutePoints(points);
    setDistances(distanceArray);
    setTotalDistance(Math.round(totalDist * 10) / 10);
    
    // Initialize map after data is processed
    if (window.ol && points.length > 0) {
      initMap(points);
    }
  };

  const initMap = (points) => {
    if (!mapRef.current || !window.ol) return;
    
    // Create vector source and features for points
    const features = points.map(point => {
      const feature = new window.ol.Feature({
        geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat(point.position)),
        name: point.name,
        type: point.type,
        details: point.details
      });
      
      // Set style based on point type
      let iconStyle;
      if (point.type === 'sender') {
        iconStyle = new window.ol.style.Style({
          image: new window.ol.style.Circle({
            radius: 8,
            fill: new window.ol.style.Fill({ color: '#4CAF50' }),
            stroke: new window.ol.style.Stroke({ color: 'white', width: 2 })
          })
        });
      } else if (point.type === 'destination') {
        iconStyle = new window.ol.style.Style({
          image: new window.ol.style.Circle({
            radius: 8,
            fill: new window.ol.style.Fill({ color: '#F44336' }),
            stroke: new window.ol.style.Stroke({ color: 'white', width: 2 })
          })
        });
      } else {
        // RMS points
        iconStyle = new window.ol.style.Style({
          image: new window.ol.style.Circle({
            radius: 7,
            fill: new window.ol.style.Fill({ color: '#2196F3' }),
            stroke: new window.ol.style.Stroke({ color: 'white', width: 2 })
          })
        });
      }
      
      feature.setStyle(iconStyle);
      return feature;
    });
    
    const vectorSource = new window.ol.source.Vector({
      features: features
    });
    
    // Create a vector layer for points
    const vectorLayer = new window.ol.layer.Vector({
      source: vectorSource
    });
    
    // Create line features connecting the points
    const lineCoordinates = points.map(point => 
      window.ol.proj.fromLonLat(point.position)
    );
    
    const lineFeature = new window.ol.Feature({
      geometry: new window.ol.geom.LineString(lineCoordinates)
    });
    
    lineFeature.setStyle(new window.ol.style.Style({
      stroke: new window.ol.style.Stroke({
        color: '#673AB7',
        width: 3,
        lineDash: [5, 8]
      })
    }));
    
    const lineSource = new window.ol.source.Vector({
      features: [lineFeature]
    });
    
    const lineLayer = new window.ol.layer.Vector({
      source: lineSource
    });
    
    // Create and initialize map
    const map = new window.ol.Map({
      target: mapRef.current,
      layers: [
        new window.ol.layer.Tile({
          source: new window.ol.source.OSM()
        }),
        lineLayer,
        vectorLayer
      ],
      view: new window.ol.View({
        center: window.ol.proj.fromLonLat(points[0].position),
        zoom: 5
      })
    });
    
    // Fit view to show all points
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, { 
      padding: [100, 100, 100, 100],
      maxZoom: 12
    });
    
    // Add popup overlay
    const container = document.getElementById('popup');
    const overlay = new window.ol.Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    map.addOverlay(overlay);
    
    // Handle click events for popups
    map.on('click', function(evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
      });
      
      if (feature && feature.get('details')) {
        const coordinates = feature.getGeometry().getCoordinates();
        const details = feature.get('details');
        const type = feature.get('type');
        
        let content = `
          <h3 class="font-bold mb-2">${getPointTypeLabel(type)}: ${details.OfficeName}</h3>
          <div class="text-sm">
            <p>Type: ${details.OfficeType}</p>
            <p>Pincode: ${details.Pincode}</p>
            <p>District: ${details.District}</p>
            <p>State: ${details.StateName}</p>
            <p>Division: ${details.DivisionName}</p>
        `;
        
        // Add distance info if applicable
        if (type !== 'sender') {
          const index = type === 'rms1' ? 0 : type === 'rms2' ? 1 : distances.length - 1;
          if (distances[index]) {
            content += `<p class="font-semibold mt-2">Distance: ${distances[index].distance} km</p>`;
          }
        }
        
        content += `</div>`;
        
        document.getElementById('popup-content').innerHTML = content;
        overlay.setPosition(coordinates);
      } else {
        overlay.setPosition(undefined);
      }
    });
    
    // Close popup when clicking the closer button
    document.getElementById('popup-closer').onclick = function() {
      overlay.setPosition(undefined);
      return false;
    };
    
    mapInstance.current = map;
  };
  
  const getPointTypeLabel = (type) => {
    switch(type) {
      case 'sender': return 'Origin';
      case 'rms1': return 'RMS 1';
      case 'rms2': return 'RMS 2';
      case 'destination': return 'Destination';
      default: return 'Point';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading route data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mt-4">Error Loading Route</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={() => window.close()} 
            className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Mail Routing Map</h1>
          {routeData && (
            <div className="flex flex-wrap items-center mt-2 text-sm">
              <div className="mr-6">
                <span className="font-semibold">From:</span> {routeData.senderPostOffice?.OfficeName}, {routeData.senderPostOffice?.District}
              </div>
              <div className="mr-6">
                <span className="font-semibold">To:</span> {routeData.destinationPostOffice?.OfficeName}, {routeData.destinationPostOffice?.District}
              </div>
              <div className="mr-6">
                <span className="font-semibold">Type:</span> {routeData.label}
              </div>
              <div>
                <span className="font-semibold">Total Distance:</span> {totalDistance} km
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-grow relative">
        <div ref={mapRef} className="w-full h-full"></div>
        
        {/* Popup Overlay */}
        <div id="popup" className="ol-popup absolute bg-white p-4 rounded shadow-lg max-w-xs">
          <a href="#" id="popup-closer" className="ol-popup-closer absolute top-2 right-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </a>
          <div id="popup-content"></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Origin</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm">RMS (Sorting Center)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm">Destination</span>
              </div>
            </div>
            
            {/* Route Summary */}
            {distances.length > 0 && (
              <div className="mt-2 lg:mt-0">
                <button 
                  onClick={() => window.close()} 
                  className="px-4 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rout;