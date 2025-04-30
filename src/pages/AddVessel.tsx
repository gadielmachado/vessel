
import React from 'react';
import { useNavigate } from 'react-router-dom';
import VesselForm from '@/components/VesselForm';
import Layout from '@/components/Layout';
import { VesselFormData } from '@/types/vessel';
import { addVessel } from '@/services/vesselService';
import { useToast } from '@/hooks/use-toast';

const AddVessel: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleAddVessel = async (data: VesselFormData) => {
    const newVessel = await addVessel(data);
    
    if (newVessel) {
      toast({
        title: "Navio adicionado",
        description: "O navio foi adicionado com sucesso.",
      });
      navigate('/');
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o navio.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-4xl">
        <VesselForm onSubmit={handleAddVessel} />
      </div>
    </Layout>
  );
};

export default AddVessel;
