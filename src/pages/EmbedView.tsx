import React, { useState, useEffect } from 'react';
import VesselTimeline from '@/components/VesselTimeline';
import { getAllVessels } from '@/services/vesselService';
import { Vessel } from '@/types/vessel';

const EmbedView: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadVessels = async () => {
      setLoading(true);
      const data = await getAllVessels();
      setVessels(data);
      setLoading(false);
    };
    
    loadVessels();
  }, []);
  
  if (loading) {
    return (
      <div className="p-4 h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-0 pb-2 h-screen bg-white">
      <div className="max-w-full mx-auto">
        {/* Timeline */}
        <div className="px-2">
          <VesselTimeline 
            vessels={vessels} 
            onEdit={() => {}} 
            onDelete={() => {}}
            isEmbedded={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EmbedView;
