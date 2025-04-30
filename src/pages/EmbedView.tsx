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
        {/* Cabeçalho */}
        <div className="bg-gray-50 px-4 py-3 flex items-center border-b mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Brazil Stone Shipping</h1>
            <p className="text-xs text-gray-500">Linha do Tempo - Movimentações de Navios</p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            Atualizado em: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        {/* Timeline */}
        <div className="px-2">
          <VesselTimeline 
            vessels={vessels} 
            onEdit={() => {}} 
            onDelete={() => {}}
          />
        </div>
        
        {/* Rodapé */}
        <div className="mt-auto p-2 text-center text-xs text-gray-400">
          <p>VesselView © {new Date().getFullYear()} · Brazil Stone Shipping</p>
        </div>
      </div>
    </div>
  );
};

export default EmbedView;
