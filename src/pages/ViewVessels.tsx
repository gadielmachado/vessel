
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import VesselTimeline from '@/components/VesselTimeline';
import { getAllVessels, deleteVessel } from '@/services/vesselService';
import { Vessel } from '@/types/vessel';
import { useToast } from '@/hooks/use-toast';

const ViewVessels: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    loadVessels();
  }, []);
  
  const loadVessels = async () => {
    setLoading(true);
    const data = await getAllVessels();
    setVessels(data);
    setLoading(false);
  };
  
  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };
  
  const handleDelete = async (id: string) => {
    const success = await deleteVessel(id);
    if (success) {
      toast({
        title: "Navio removido",
        description: "O navio foi removido com sucesso.",
      });
      loadVessels();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover o navio.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center h-[50vh]">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container">
        <VesselTimeline 
          vessels={vessels} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>
    </Layout>
  );
};

export default ViewVessels;
