
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ship, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VesselFormData } from '@/types/vessel';

// Create schema for form validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome do navio precisa ter pelo menos 2 caracteres',
  }),
  loadingPortName: z.string().min(2, {
    message: 'O nome do porto de carregamento precisa ter pelo menos 2 caracteres',
  }),
  loadingPortEta: z.string().min(1, {
    message: 'Data de ETA obrigatória',
  }),
  loadingPortEtd: z.string().min(1, {
    message: 'Data de ETD obrigatória',
  }),
  dischargePortName: z.string().min(2, {
    message: 'O nome do porto de descarga precisa ter pelo menos 2 caracteres',
  }),
  dischargePortEta: z.string().min(1, {
    message: 'Data de ETA obrigatória',
  }),
  dischargePortEtd: z.string().min(1, {
    message: 'Data de ETD obrigatória',
  }),
}).refine((data) => new Date(data.loadingPortEtd) >= new Date(data.loadingPortEta), {
  message: "ETD do porto de carregamento deve ser igual ou posterior ao ETA",
  path: ["loadingPortEtd"],
}).refine((data) => new Date(data.dischargePortEtd) >= new Date(data.dischargePortEta), {
  message: "ETD do porto de descarga deve ser igual ou posterior ao ETA",
  path: ["dischargePortEtd"],
}).refine((data) => new Date(data.dischargePortEta) >= new Date(data.loadingPortEtd), {
  message: "ETA do porto de descarga deve ser igual ou posterior ao ETD do porto de carregamento",
  path: ["dischargePortEta"],
});

interface VesselFormProps {
  initialValues?: VesselFormData;
  onSubmit: (data: VesselFormData) => void;
  isEditing?: boolean;
}

const VesselForm: React.FC<VesselFormProps> = ({ 
  initialValues, 
  onSubmit, 
  isEditing = false 
}) => {
  const { toast } = useToast();

  // Define default values for the form
  const defaultValues: VesselFormData = initialValues || {
    name: '',
    loadingPortName: '',
    loadingPortEta: '',
    loadingPortEtd: '',
    dischargePortName: '',
    dischargePortEta: '',
    dischargePortEtd: '',
  };

  // Initialize the form
  const form = useForm<VesselFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle form submission
  const handleSubmit = (data: VesselFormData) => {
    onSubmit(data);
    
    if (!isEditing) {
      form.reset(defaultValues);
      toast({
        title: "Navio adicionado",
        description: `O navio ${data.name} foi adicionado com sucesso.`,
      });
    } else {
      toast({
        title: "Navio atualizado",
        description: `O navio ${data.name} foi atualizado com sucesso.`,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-6 w-6" />
          <span>{isEditing ? 'Editar' : 'Adicionar'} Navio</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Vessel Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Navio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: MP GOLD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Port of Loading Section */}
            <div className="bg-loading-light p-4 rounded-md space-y-4 border border-loading">
              <h3 className="text-loading-foreground font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Porto de Carregamento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="loadingPortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Porto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: KAKINADA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="loadingPortEta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ETA</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="loadingPortEtd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ETD</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Port of Discharge Section */}
            <div className="bg-discharge-light p-4 rounded-md space-y-4 border border-discharge">
              <h3 className="text-discharge-foreground font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Porto de Descarga
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dischargePortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Porto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: XIAMEN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dischargePortEta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ETA</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dischargePortEtd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ETD</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              {isEditing ? 'Atualizar' : 'Adicionar'} Navio
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VesselForm;
