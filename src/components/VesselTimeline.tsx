import React, { useState, useMemo } from 'react';
import { format, parseISO, eachDayOfInterval, differenceInDays, addDays, isBefore, startOfMonth, endOfMonth, isWithinInterval, eachMonthOfInterval, isAfter, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Vessel } from '@/types/vessel';
import { MapPin, Ship, Calendar, Trash2, Pencil, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface VesselTimelineProps {
  vessels: Vessel[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isEmbedded?: boolean;
}

const VesselTimeline: React.FC<VesselTimelineProps> = ({ vessels, onEdit, onDelete, isEmbedded = false }) => {
  const { toast } = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  
  // Calculate the date range for the timeline
  const dateRange = useMemo(() => {
    if (!vessels.length) return { startDate: new Date(), endDate: addDays(new Date(), 60), days: 60 };
    
    // Encontrar a data exata do primeiro e último navio
    let minDate = new Date(8640000000000000);
    let maxDate = new Date(-8640000000000000);
    
    vessels.forEach(vessel => {
      const loadingEta = parseISO(vessel.loadingPort.eta);
      const dischargeEtd = parseISO(vessel.dischargePort.etd);
      
      if (loadingEta < minDate) minDate = loadingEta;
      if (dischargeEtd > maxDate) maxDate = dischargeEtd;
    });
    
    // Se a diferença em dias for muito pequena, estender um pouco para melhor visualização
    const initialDays = differenceInDays(maxDate, minDate) + 1;
    if (initialDays < 10) {
      maxDate = addDays(maxDate, 10 - initialDays);
    }
    
    const days = differenceInDays(maxDate, minDate) + 1;
    
    return {
      startDate: minDate,
      endDate: maxDate,
      days
    };
  }, [vessels]);
  
  // Generate array of dates for the timeline header
  const timelineDates = useMemo(() => {
    return eachDayOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate
    });
  }, [dateRange]);
  
  // Determinar quais datas são significativas para mostrar no calendário
  const optimizedDates = useMemo(() => {
    // Se não houver navios, retornar uma lista vazia
    if (!vessels.length) return [];
    
    // Array para armazenar as datas que serão exibidas
    const datesToShow: Date[] = [];
    
    // Adicionar a data inicial (primeiro dia)
    datesToShow.push(dateRange.startDate);
    
    // Calcular datas de 5 em 5 dias a partir da data inicial
    let currentDate = addDays(dateRange.startDate, 5);
    while (currentDate <= dateRange.endDate) {
      datesToShow.push(currentDate);
      currentDate = addDays(currentDate, 5);
    }
    
    // Garantir que a data final também esteja incluída
    if (differenceInDays(dateRange.endDate, datesToShow[datesToShow.length - 1]) > 0) {
      datesToShow.push(dateRange.endDate);
    }
    
    return datesToShow;
  }, [dateRange, vessels]);
  
  // Meses para exibir no calendário
  const monthsToShow = useMemo(() => {
    // Se não houver navios, retornar uma lista vazia
    if (!vessels.length) return [];
    
    // Coletar apenas os meses onde temos navios programados
    const relevantMonths: { [key: string]: boolean } = {};
    
    vessels.forEach(vessel => {
      const loadingEta = parseISO(vessel.loadingPort.eta);
      const dischargeEtd = parseISO(vessel.dischargePort.etd);
      
      // Encontrar todos os meses entre a data de partida e chegada
      const monthsInJourney = eachMonthOfInterval({
        start: loadingEta,
        end: dischargeEtd
      });
      
      // Adicionar cada mês relevante ao conjunto
      monthsInJourney.forEach(date => {
      const monthKey = format(date, 'yyyy-MM');
        relevantMonths[monthKey] = true;
      });
    });
    
    // Converter para array de objetos com nome do mês e posição
    return Object.keys(relevantMonths)
      .sort() // Garantir ordem cronológica
      .map(monthKey => {
        const date = new Date(`${monthKey}-01`);
        const monthName = format(date, 'MMM', { locale: ptBR });
        
        // Calcular posição relativa e largura para o mês
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);
        
        // Verificar se este mês realmente contém algum navio ativo
        let hasActiveVessels = false;
        vessels.forEach(vessel => {
          const loadingEta = parseISO(vessel.loadingPort.eta);
          const dischargeEtd = parseISO(vessel.dischargePort.etd);
          
          // Verificar se o período do navio se sobrepõe a este mês
          if (
            (loadingEta <= endDate && dischargeEtd >= startDate) ||
            (isSameMonth(loadingEta, startDate)) ||
            (isSameMonth(dischargeEtd, startDate))
          ) {
            hasActiveVessels = true;
          }
        });
        
        // Ignorar meses sem navios ativos
        if (!hasActiveVessels) return null;
        
        // Calcular posição relativa em porcentagem
        const totalRange = differenceInDays(dateRange.endDate, dateRange.startDate);
        const startOffset = Math.max(0, differenceInDays(startDate, dateRange.startDate));
        const monthWidth = Math.min(
          differenceInDays(endDate, startDate) + 1,
          differenceInDays(
            isBefore(endDate, dateRange.endDate) ? endDate : dateRange.endDate,
            isAfter(startDate, dateRange.startDate) ? startDate : dateRange.startDate
          ) + 1
        );
      
      return {
          key: monthKey,
          name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          startPosition: startOffset / totalRange,
          width: monthWidth / totalRange
        };
      })
      .filter(month => month !== null); // Remover meses nulos (sem navios ativos)
  }, [dateRange, vessels]);
  
  // Function to calculate the position and width of vessel segments
  const calculatePosition = (startDate: Date, endDate: Date) => {
    const totalDays = dateRange.days;
    const startDiff = differenceInDays(startDate, dateRange.startDate);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    const startPercent = (startDiff / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;
    
    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`
    };
  };

  // Function to calculate position for specific date
  const calculateDatePosition = (date: Date) => {
    const totalDays = dateRange.days;
    const dateDiff = differenceInDays(date, dateRange.startDate);
    return `${(dateDiff / totalDays) * 100}%`;
  };
  
  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };
  
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    
    onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
  };
  
  const formatDateForDisplay = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  // Calculate current position of ship based on dates
  const calculateShipPosition = (loadingStart: Date, loadingEnd: Date, dischargeStart: Date, dischargeEnd: Date) => {
    const now = new Date();
    
    // If still before loading starts
    if (isBefore(now, loadingStart)) {
      return calculateDatePosition(loadingStart);
    }
    
    // After voyage ends
    if (!isBefore(now, dischargeEnd)) {
      return calculateDatePosition(dischargeEnd);
    }
    
    // During loading at first port
    if (!isBefore(now, loadingStart) && isBefore(now, loadingEnd)) {
      // Navio está no porto de carregamento, mas já iniciou o processo
      const totalLoadingDays = differenceInDays(loadingEnd, loadingStart);
      const daysAtLoading = differenceInDays(now, loadingStart);
      const loadingProgress = Math.min(1, daysAtLoading / totalLoadingDays);
      
      // Calcular a posição entre o início e fim da carga
      const loadingStartPos = parseFloat(calculateDatePosition(loadingStart).replace('%', ''));
      const loadingEndPos = parseFloat(calculateDatePosition(loadingEnd).replace('%', ''));
      const position = loadingStartPos + (loadingProgress * (loadingEndPos - loadingStartPos));
      
      return `${position}%`;
    }
    
    // During transit
    if (!isBefore(now, loadingEnd) && isBefore(now, dischargeStart)) {
      const totalTransitDays = differenceInDays(dischargeStart, loadingEnd);
      const daysInTransit = differenceInDays(now, loadingEnd);
      const transitProgress = Math.min(1, daysInTransit / totalTransitDays);
      
      const loadingEndPos = parseFloat(calculateDatePosition(loadingEnd).replace('%', ''));
      const dischargeStartPos = parseFloat(calculateDatePosition(dischargeStart).replace('%', ''));
      const position = loadingEndPos + (transitProgress * (dischargeStartPos - loadingEndPos));
      
      return `${position}%`;
    }
    
    // During discharge at destination port
    if (!isBefore(now, dischargeStart) && isBefore(now, dischargeEnd)) {
      const totalDischargeDays = differenceInDays(dischargeEnd, dischargeStart);
      const daysInDischarge = differenceInDays(now, dischargeStart);
      const dischargeProgress = Math.min(1, daysInDischarge / totalDischargeDays);
      
      const dischargeStartPos = parseFloat(calculateDatePosition(dischargeStart).replace('%', ''));
      const dischargeEndPos = parseFloat(calculateDatePosition(dischargeEnd).replace('%', ''));
      const position = dischargeStartPos + (dischargeProgress * (dischargeEndPos - dischargeStartPos));
      
      return `${position}%`;
    }
    
    // Fallback (shouldn't reach here)
    return calculateDatePosition(loadingStart);
  };

  // Calculate the progress of the voyage (how much of the line should be colored)
  const calculateVoyageProgress = (loadingStart: Date, loadingEnd: Date, dischargeStart: Date, dischargeEnd: Date) => {
    const now = new Date();
    
    // Before voyage starts
    if (isBefore(now, loadingStart)) {
      return "0%";
    }
    
    // After voyage ends
    if (!isBefore(now, dischargeEnd)) {
      return "100%";
    }
    
    // During loading at first port
    if (!isBefore(now, loadingStart) && isBefore(now, loadingEnd)) {
      const totalLoadingDays = differenceInDays(loadingEnd, loadingStart);
      const daysAtLoading = differenceInDays(now, loadingStart);
      const loadingProgress = Math.min(100, (daysAtLoading / totalLoadingDays) * 100);
      
      // Calculate what percentage of the total journey the loading period represents
      const totalJourneyDays = differenceInDays(dischargeEnd, loadingStart);
      const loadingPeriodPercentage = (totalLoadingDays / totalJourneyDays) * 100;
      
      // Adjust the loading progress to be relative to the total journey
      return `${(loadingProgress / 100) * loadingPeriodPercentage}%`;
    }
    
    // During transit
    if (!isBefore(now, loadingEnd) && isBefore(now, dischargeStart)) {
      const loadingDays = differenceInDays(loadingEnd, loadingStart);
      const transitDays = differenceInDays(dischargeStart, loadingEnd);
      const dischargeDays = differenceInDays(dischargeEnd, dischargeStart);
      
      const totalDays = loadingDays + transitDays + dischargeDays;
    const daysElapsed = differenceInDays(now, loadingStart);
      
      const progress = Math.min(100, (daysElapsed / totalDays) * 100);
      return `${progress}%`;
    }
    
    // During unloading at final port
    if (!isBefore(now, dischargeStart) && isBefore(now, dischargeEnd)) {
      const dischargePeriodDays = differenceInDays(dischargeEnd, dischargeStart);
      const daysInDischarge = differenceInDays(now, dischargeStart);
      const dischargeProgress = Math.min(100, (daysInDischarge / dischargePeriodDays) * 100);
      
      // Calculate what percentage of the journey has been completed before discharge
      const totalJourneyDays = differenceInDays(dischargeEnd, loadingStart);
      const preDischargePercentage = ((totalJourneyDays - dischargePeriodDays) / totalJourneyDays) * 100;
      
      // Add the discharge progress to pre-discharge percentage
      return `${preDischargePercentage + ((dischargeProgress / 100) * (100 - preDischargePercentage))}%`;
    }
    
    return "0%";
  };
  
  if (vessels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Ship size={64} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Nenhum navio cadastrado</h2>
        <p className="text-muted-foreground mb-6">Adicione navios para visualizar o timeline.</p>
        <Button asChild>
          <a href="/add">Adicionar Navio</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow animate-fade-in">
      {!isEmbedded && (
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Vessels Fresh Movements</h2>
        </div>
      )}
      
      <div className="w-full">
        <div className="relative w-full px-4 py-2">
          {/* Vessel rows */}
          <div className="mt-8">
            {vessels.map((vessel) => {
              const loadingStart = parseISO(vessel.loadingPort.eta);
              const loadingEnd = parseISO(vessel.loadingPort.etd);
              const dischargeStart = parseISO(vessel.dischargePort.eta);
              const dischargeEnd = parseISO(vessel.dischargePort.etd);
              
              const loadingPosition = calculatePosition(loadingStart, loadingEnd);
              const dischargePosition = calculatePosition(dischargeStart, dischargeEnd);
              const routePosition = {
                left: loadingPosition.left,
                width: `calc(${parseFloat(dischargePosition.left) + parseFloat(dischargePosition.width) - parseFloat(loadingPosition.left)}%)`
              };
              
              const progressWidth = calculateVoyageProgress(loadingStart, loadingEnd, dischargeStart, dischargeEnd);
              // Recalcula a posição do navio para estar sempre no final da linha amarela de progresso
              let shipPosition;
              
              if (progressWidth === "0%") {
                // Se não há progresso, o navio fica no início
                shipPosition = loadingPosition.left;
              } else {
                // Calcula a posição para o navio ficar no final da linha de progresso
                const progressWidthValue = parseFloat(progressWidth);
                const routeStartPosition = parseFloat(routePosition.left);
                shipPosition = `${routeStartPosition + progressWidthValue}%`;
              }
              
              return (
                <div key={vessel.id} className="mb-6 relative h-12 flex">
                  {/* Vessel name - displayed at the left before the line */}
                  <div className="w-[150px] flex-shrink-0 h-full flex items-center">
                    <div className="font-medium text-sm truncate uppercase text-gray-700">
                      {vessel.name}
                    </div>
                  </div>
                  
                  {/* Timeline area */}
                  <div className="flex-grow relative h-full">
                    {/* Complete journey line - blue background */}
                    <div 
                      className="absolute h-8 top-[10px] bg-blue-100 rounded-[12px] w-full"
                      style={routePosition}
                    ></div>
                    
                    {/* Progress line - yellow background */}
                    <div 
                      className="absolute h-8 top-[10px] bg-[#3E4EFF] rounded-l-[12px]"
                      style={{
                        left: routePosition.left,
                        width: progressWidth
                      }}
                    ></div>
                    
                    {/* Loading port text - inside the line */}
                    <div
                      className="absolute top-[12px] h-6 flex items-center justify-start z-10"
                      style={{
                        left: routePosition.left,
                        minWidth: '100px',
                        maxWidth: '160px'
                      }}
                    >
                      <span className="text-xs font-medium truncate ml-2 text-black">
                        {vessel.loadingPort.name.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Discharge port marker and text - inside the line */}
                    <div
                      className="absolute top-[12px] h-6 flex items-center justify-end z-10"
                      style={{
                        right: `calc(100% - ${parseFloat(dischargePosition.left) + parseFloat(dischargePosition.width)}%)`,
                        minWidth: '100px',
                        maxWidth: '160px'
                      }}
                    >
                      <span className="text-xs font-medium truncate mr-2 text-blue-800">
                        {vessel.dischargePort.name.toUpperCase()}
                      </span>
                      <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                    </div>
   
                    {/* Ship position marker - centered on the end of progress line */}
                    <div
                      className="absolute top-[8px] z-30"
                      style={{
                        left: shipPosition,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="bg-white rounded-full h-[40px] w-[40px] flex items-center justify-center border-2 border-[#3E4EFF] shadow">
                        <Ship className="h-6 w-6 text-[#3E4EFF]" />
                      </div>
                    </div>

                    {/* Action buttons - aligned with end of the vessel timeline */}
                    {!isEmbedded && (
                      <div 
                        className="absolute flex items-center space-x-1 z-20 h-8 pl-2" 
                        style={{
                          left: `calc(${parseFloat(dischargePosition.left) + parseFloat(dischargePosition.width)}% + 10px)`,
                          top: "10px"
                        }}
                      >
                        <Button 
                          size="icon" 
                          variant="outline"
                          className="h-6 w-6 bg-white"
                          onClick={() => onEdit(vessel.id)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 bg-white text-destructive"
                          onClick={() => handleDeleteClick(vessel.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Month labels - com cada mês separado */}
          <div className="h-8 flex mt-8 border-t border-b relative">
            {monthsToShow.map((month, index) => (
              <div
                key={month.key}
                className="absolute top-0 h-full flex items-center justify-center text-sm font-medium border-r text-muted-foreground"
                  style={{
                    left: `${month.startPosition * 100}%`,
                    width: `${month.width * 100}%`
                  }}
                >
                  {month.name}
                </div>
              ))}
            </div>
            
          {/* Day indicators */}
          <div className="h-8 flex relative">
            {optimizedDates.map((date, index) => (
              <div
                key={index}
                className="absolute top-0 h-full flex flex-col items-center justify-center text-xs"
                  style={{
                  left: calculateDatePosition(date),
                  transform: 'translateX(-50%)'
                  }}
                >
                <span className="font-medium">{date.getDate()}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
      
      {/* Details dialog */}
        <Dialog open={!!selectedVessel} onOpenChange={(open) => !open && setSelectedVessel(null)}>
          <DialogContent>
            <DialogHeader>
            <DialogTitle>Detalhes do Navio</DialogTitle>
            </DialogHeader>
            
          {selectedVessel && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Nome do Navio</h3>
                <p>{selectedVessel.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Porto de Carregamento
                </h3>
                <p>{selectedVessel.loadingPort.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-xs text-muted-foreground">ETA</span>
                    <p className="text-sm">{formatDateForDisplay(selectedVessel.loadingPort.eta)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">ETD</span>
                    <p className="text-sm">{formatDateForDisplay(selectedVessel.loadingPort.etd)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Porto de Descarga
                </h3>
                <p>{selectedVessel.dischargePort.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-xs text-muted-foreground">ETA</span>
                    <p className="text-sm">{formatDateForDisplay(selectedVessel.dischargePort.eta)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">ETD</span>
                    <p className="text-sm">{formatDateForDisplay(selectedVessel.dischargePort.etd)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedVessel(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  onEdit(selectedVessel.id);
                  setSelectedVessel(null);
                }}>
                  Editar
                </Button>
              </div>
            </div>
          )}
          </DialogContent>
        </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir este navio? Esta ação não poderá ser desfeita.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VesselTimeline;
