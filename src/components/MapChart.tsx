import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../lib/utils';

interface MapChartProps {
  data: { city: string; count: number; coordinates: [number, number] }[];
  title: string;
}

export const MapChart: React.FC<MapChartProps> = ({ data, title }) => {
  // Center of Senegal
  const position: [number, number] = [14.4974, -14.4524];

  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-premium border border-slate-800/50 h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-slate-100">{title}</h4>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary/60"></span>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Intensité des offres</span>
        </div>
      </div>
      
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-800/50 shadow-inner relative z-0">
        <MapContainer 
          center={position} 
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          
          {data.filter(city => city.coordinates && Array.isArray(city.coordinates) && city.coordinates.length === 2 && !isNaN(city.coordinates[0]) && !isNaN(city.coordinates[1])).map((city, idx) => (
            <CircleMarker 
              key={`${city.city}-${idx}`}
              center={city.coordinates}
              pathOptions={{ 
                color: '#0a988b', 
                fillColor: '#0a988b', 
                fillOpacity: 0.5,
                weight: 1
              }}
              radius={Math.sqrt(city.count) * 2} // Scale radius based on count
            >
              <Popup>
                <div className="p-1">
                   <h5 className="font-bold text-slate-100 m-0">{city.city}</h5>
                   <p className="text-primary font-bold text-lg m-0">{city.count} <span className="text-xs font-normal text-slate-400">offres</span></p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
