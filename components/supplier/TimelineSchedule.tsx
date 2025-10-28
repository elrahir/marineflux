'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, MessageSquare, Package, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'rfq' | 'quotation' | 'order';
  title: string;
  date: Date;
  description?: string;
  eventType?: string;
  status?: string;
  amount?: number;
}

interface TimelineScheduleProps {
  events: TimelineEvent[];
  locale: string;
}

export function TimelineSchedule({ events, locale }: TimelineScheduleProps) {
  const [currentDayOffset, setCurrentDayOffset] = useState(0);

  // Get 7 days starting from offset
  const getSevenDayRange = (dayOffset: number = 0) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + dayOffset);
    startDate.setHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const sevenDays = getSevenDayRange(currentDayOffset);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventColor = (type: string, status?: string) => {
    if (type === 'rfq') {
      return 'bg-maritime-600 border-maritime-400';
    }
    if (type === 'quotation') {
      return 'bg-amber-700 border-amber-400';
    }
    if (type === 'order') {
      if (status === 'paid' || status === 'payment_awaiting_confirmation') {
        return 'bg-green-700 border-green-400';
      }
      if (status === 'shipped' || status === 'delivered') {
        return 'bg-blue-700 border-blue-400';
      }
      if (status === 'in_progress') {
        return 'bg-purple-700 border-purple-400';
      }
      if (status === 'completed') {
        return 'bg-emerald-700 border-emerald-400';
      }
      if (status === 'cancelled') {
        return 'bg-red-700 border-red-400';
      }
      return 'bg-slate-600 border-slate-400';
    }
    return 'bg-slate-600 border-slate-400';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'rfq':
        return FileText;
      case 'quotation':
        return MessageSquare;
      case 'order':
        return Package;
      default:
        return Calendar;
    }
  };

  const formatDate = (date: Date, locale: string) => {
    const dayNames = locale === 'tr' 
      ? ['Pzts', 'Salı', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const day = dayNames[date.getDay()];
    const dateNum = date.getDate();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    return { day, dateNum, month };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const handlePrevWeek = () => {
    setCurrentDayOffset(currentDayOffset - 1);
  };

  const handleNextWeek = () => {
    setCurrentDayOffset(currentDayOffset + 1);
  };

  const handleToday = () => {
    setCurrentDayOffset(0);
  };

  // Get 90-day range for the minimap
  const get90DayRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 45); // 45 days before today
    startDate.setHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const ninetyDays = get90DayRange();

  // Check if a date has events
  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  // Get event types for a date (for coloring)
  const getEventTypesForDate = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const types = new Set(dayEvents.map(e => e.type));
    return types;
  };

  // Get the primary color for a date based on events
  const getPrimaryColorForDate = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    
    if (dayEvents.length === 0) {
      return 'bg-gray-700';
    }

    // Prioritize: order events with important status > quotation > rfq
    // Check for order events first (highest priority)
    const orderEvents = dayEvents.filter(e => e.type === 'order');
    if (orderEvents.length > 0) {
      const orderEvent = orderEvents[0];
      // Color based on order status
      if (orderEvent.status === 'paid' || orderEvent.status === 'payment_awaiting_confirmation') {
        return 'bg-green-600';
      }
      if (orderEvent.status === 'shipped' || orderEvent.status === 'delivered' || orderEvent.status === 'expected_delivery') {
        return 'bg-blue-600';
      }
      if (orderEvent.status === 'in_progress') {
        return 'bg-purple-600';
      }
      if (orderEvent.status === 'completed') {
        return 'bg-emerald-600';
      }
      if (orderEvent.status === 'confirmed') {
        return 'bg-cyan-600';
      }
      return 'bg-sky-500';
    }

    // Then check quotation events
    const quotationEvents = dayEvents.filter(e => e.type === 'quotation');
    if (quotationEvents.length > 0) {
      const quotEvent = quotationEvents[0];
      if (quotEvent.status === 'accepted') {
        return 'bg-emerald-600';
      }
      if (quotEvent.status === 'rejected') {
        return 'bg-red-600';
      }
      if (quotEvent.status === 'pending') {
        return 'bg-yellow-400';
      }
      return 'bg-amber-600';
    }

    // Finally RFQ events
    return 'bg-maritime-600';
  };

  // Handle minimap day click
  const handleMinimapDayClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);
    
    const diffTime = clickedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setCurrentDayOffset(diffDays);
  };

  // Check if a date is in the current 7-day view
  const isInCurrentView = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    for (let day of sevenDays) {
      const dayDate = new Date(day);
      dayDate.setHours(0, 0, 0, 0);
      if (dayDate.getTime() === checkDate.getTime()) {
        return true;
      }
    }
    return false;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {locale === 'tr' ? '7 Günlük Zaman Çizelgesi' : '7-Day Timeline'}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevWeek}
              className="bg-white text-black border-gray-300 hover:bg-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="bg-white text-black border-gray-300 hover:bg-gray-200"
            >
              {locale === 'tr' ? 'Bugün' : 'Today'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="bg-white text-black border-gray-300 hover:bg-gray-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 90-Day Horizontal Minimap - At the top */}
        <div className="mb-4">
          <style>{`
            .minimap-scroll::-webkit-scrollbar {
              height: 3px;
            }
            .minimap-scroll::-webkit-scrollbar-track {
              background: rgba(100, 116, 139, 0.3);
              border-radius: 3px;
            }
            .minimap-scroll::-webkit-scrollbar-thumb {
              background: rgba(100, 116, 139, 0.7);
              border-radius: 3px;
              transition: background 0.2s;
            }
            .minimap-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(100, 116, 139, 0.9);
            }
            .minimap-scroll {
              scrollbar-color: rgba(100, 116, 139, 0.7) rgba(100, 116, 139, 0.3);
              scrollbar-width: thin;
            }
          `}</style>
          <div className="flex gap-1 overflow-x-auto pb-2 minimap-scroll" style={{
            paddingTop: '8px',
            paddingBottom: '8px'
          }}>
            {ninetyDays.map((date, dayIndex) => {
              const hasEventsOnDate = hasEvents(date);
              const eventTypes = getEventTypesForDate(date);
              const isCurrentView = isInCurrentView(date);
              const isCurrentDay = isToday(date);
              
              // Determine color based on event type and status
              const dotColor = getPrimaryColorForDate(date);
              
              return (
                <button
                  key={`minimap-${dayIndex}`}
                  onClick={() => handleMinimapDayClick(date)}
                  className={`
                    w-3 h-3 rounded-full transition-all cursor-pointer flex-shrink-0
                    ${dotColor}
                    ${isCurrentDay ? 'ring-2 ring-maritime-400 ring-offset-1 ring-offset-slate-900' : ''}
                    ${isCurrentView ? 'ring-1 ring-white' : ''}
                    hover:scale-150 hover:opacity-100 opacity-80
                  `}
                  title={`${date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')} - ${hasEventsOnDate ? `${getEventsForDate(date).length} ${locale === 'tr' ? 'olay' : 'events'}` : locale === 'tr' ? 'olay yok' : 'no events'}`}
                />
              );
            })}
          </div>
        </div>

        {/* 7-Day Timeline */}
        <div className="space-y-4">
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2">
            {sevenDays.map((date, index) => {
              const { day, dateNum, month } = formatDate(date, locale);
              const today = isToday(date);
              const past = isPastDate(date);
              
              return (
                <div
                  key={index}
                  className={`text-center p-3 rounded-lg transition-colors ${
                    today 
                      ? 'bg-maritime-600 border-2 border-maritime-400' 
                      : past
                      ? 'bg-gray-700 opacity-60'
                      : 'bg-gray-800'
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-300">{day}</p>
                  <p className="text-lg font-bold text-white mt-1">{dateNum}.{month}</p>
              </div>
              );
            })}
          </div>

          {/* Events Timeline */}
          <div className="grid grid-cols-7 gap-2 min-h-[200px]">
            {sevenDays.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date);
                const visibleEvents = dayEvents.slice(0, 4);
                const hiddenEventsCount = dayEvents.length - 4;

                return (
                  <div
                  key={dayIndex}
                  className="space-y-1.5"
                >
                  {dayEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-gray-500">
                        {locale === 'tr' ? 'Olay yok' : 'No events'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <style>{`
                        .day-events-scroll::-webkit-scrollbar {
                          width: 4px;
                        }
                        .day-events-scroll::-webkit-scrollbar-track {
                          background: rgba(100, 116, 139, 0.2);
                          border-radius: 2px;
                        }
                        .day-events-scroll::-webkit-scrollbar-thumb {
                          background: rgba(100, 116, 139, 0.5);
                          border-radius: 2px;
                        }
                        .day-events-scroll::-webkit-scrollbar-thumb:hover {
                          background: rgba(100, 116, 139, 0.7);
                        }
                        .day-events-scroll {
                          scrollbar-color: rgba(100, 116, 139, 0.5) rgba(100, 116, 139, 0.2);
                          scrollbar-width: thin;
                        }
                      `}</style>
                      <div 
                        className="space-y-1.5 overflow-y-auto day-events-scroll"
                        style={{
                          maxHeight: dayEvents.length > 4 ? '180px' : 'auto'
                        }}
                      >
                        {dayEvents.map((event) => {
                          const Icon = getEventIcon(event.type);
                          const colorClass = getEventColor(event.type, event.status);
                        
                          // Build detailed tooltip text
                          const tooltipParts = [event.title];
                          if (event.eventType) tooltipParts.push(event.eventType);
                          if (event.amount) tooltipParts.push(`$${event.amount.toLocaleString()}`);
                          const tooltipText = tooltipParts.join(' • ');

                          return (
                            <div
                              key={event.id}
                            className={`${colorClass} rounded px-2 py-1.5 text-xs border-l-2 cursor-pointer hover:opacity-80 transition-opacity group`}
                            title={tooltipText}
                            >
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-start gap-1 flex-1 min-w-0">
                                <Icon className="h-3 w-3 flex-shrink-0 mt-0.5 text-white" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold text-xs leading-tight truncate">
                                    {event.title}
                                  </p>
                                  {event.eventType && (
                                    <p className="text-gray-100 text-xs leading-tight truncate">
                                      {event.eventType}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <AlertCircle className="h-3 w-3 flex-shrink-0 text-white opacity-70 group-hover:opacity-100 mt-0.5" />
                            </div>
                          </div>
                          );
                        })}
                      </div>
                      {hiddenEventsCount > 0 && (
                        <div className="text-xs text-gray-400 text-center py-1">
                          {locale === 'tr' 
                            ? `+${hiddenEventsCount} olay daha` 
                            : `+${hiddenEventsCount} more events`}
                        </div>
                      )}
                    </>
                      )}
                  </div>
                );
              })}
            </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-maritime-600 rounded"></div>
                <span className="text-gray-300">{locale === 'tr' ? 'RFQ' : 'RFQ'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-700 rounded"></div>
                <span className="text-gray-300">{locale === 'tr' ? 'Teklif' : 'Quotation'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-slate-600 rounded"></div>
                <span className="text-gray-300">{locale === 'tr' ? 'Sipariş (Genel)' : 'Order (General)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-700 rounded"></div>
                <span className="text-gray-300">{locale === 'tr' ? 'Ödeme' : 'Payment'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-700 rounded"></div>
                <span className="text-gray-300">{locale === 'tr' ? 'Kargo' : 'Shipping'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
