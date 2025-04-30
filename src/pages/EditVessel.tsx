
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VesselForm from '@/components/VesselForm';
import Layout from '@/components/Layout';
import { VesselFormData } from '@/types/vessel';
import { getVesselById, updateVessel } from '@/services/vesselService';
import { useToast } from '@/hooks/use-toast';

const EditVessel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialValues, setInitialValues] = useState<VesselFormData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      loadVessel(id);
    }
  }, [id]);
  
  const loadVessel = async (vesselId: string) => {
    const vessel = await getVesselById(vesselId);
    
    if (vessel) {
      setInitialValues({
        name: vessel.name,
        loadingPortName: vessel.loadingPort.name,
        loadingPortEta: vessel.loadingPort.eta,
        loadingPortEtd: vessel.loadingPort.etd,
        dischargePortName: vessel.dischargePort.name,
        dischargePortEta: vessel.dischargePort.eta,
        dischargePortEtd: vessel.dischargePort.etd,
      });
    } else {
      toast({
        title: "Erro",
        description: "Navio não encontrado",
        variant: "destructive",
      });
      navigate('/');
    }
    
    setLoading(false);
  };
  
  const handleUpdateVessel = async (data: VesselFormData) => {
    if (id) {
      const updated = await updateVessel(id, data);
      if (updated) {
        toast({
          title: "Navio atualizado",
          description: "O navio foi atualizado com sucesso.",
        });
        navigate('/');
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o navio.",
          variant: "destructive",
        });
      }
    }
  };
  
  if (loading || !initialValues) {
    return (
      <Layout>
        <div className="container max-w-4xl flex items-center justify-center h-[50vh]">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-4xl">
        <VesselForm 
          initialValues={initialValues}
          onSubmit={handleUpdateVessel}
          isEditing
        />
      </div>
    </Layout>
  );
};

export default EditVessel;
