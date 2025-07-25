import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { taxHarvestingService } from '@/services/api/taxHarvestingService';
import { format, isAfter, isBefore, addDays } from 'date-fns';

export default function TaxCalendar({ isExpanded = false, onToggle }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (isExpanded) {
      loadTaxCalendar();
    }
  }, [isExpanded]);

  const loadTaxCalendar = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await taxHarvestingService.getTaxCalendar();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load tax calendar');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'deadline': return 'Calendar';
      case 'document': return 'FileText';
      case 'planning': return 'Target';
      default: return 'Info';
    }
  };

  const getEventColor = (importance, isPast) => {
    if (isPast) return 'text-gray-400 bg-gray-50 border-gray-200';
    
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const nextMonth = addDays(today, 30);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isAfter(eventDate, today) && isBefore(eventDate, nextMonth);
    }).slice(0, 3);
  };

  const groupEventsByQuarter = () => {
    const quarters = {
      'Q1 2024': [],
      'Q2 2024': [],
      'Q3 2024': [],
      'Q4 2024': []
    };

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const month = eventDate.getMonth() + 1;
      
      if (month <= 3) quarters['Q1 2024'].push(event);
      else if (month <= 6) quarters['Q2 2024'].push(event);
      else if (month <= 9) quarters['Q3 2024'].push(event);
      else quarters['Q4 2024'].push(event);
    });

    return quarters;
  };

  const isEventPast = (date) => {
    return isBefore(new Date(date), new Date());
  };

  const isEventUpcoming = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const daysDiff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 30;
  };

  if (!isExpanded) {
    const upcomingEvents = getUpcomingEvents();
    
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onToggle}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Calendar" size={20} />
              <span>Tax Calendar</span>
            </div>
            <ApperIcon name="ChevronDown" size={16} className="text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.Id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                  <ApperIcon 
                    name={getEventIcon(event.type)} 
                    size={16} 
                    className={`${event.importance === 'high' ? 'text-red-600' : 'text-blue-600'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming tax events</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Calendar" size={20} />
            <span>Tax Calendar 2024</span>
          </div>
          <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="ChevronUp" size={16} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loading />
        ) : error ? (
          <Error message={error} />
        ) : (
          <div className="space-y-6">
            {/* Upcoming Events Alert */}
            {getUpcomingEvents().length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ApperIcon name="AlertCircle" size={20} className="text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Upcoming Deadlines</h4>
                </div>
                <div className="space-y-2">
                  {getUpcomingEvents().map(event => (
                    <div key={event.Id} className="flex justify-between items-center">
                      <span className="text-sm text-yellow-700">{event.title}</span>
                      <span className="text-xs text-yellow-600 font-medium">
                        {format(new Date(event.date), 'MMM d')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quarterly View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupEventsByQuarter()).map(([quarter, quarterEvents]) => (
                <div key={quarter} className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">{quarter}</h4>
                  <div className="space-y-2">
                    {quarterEvents.length > 0 ? (
                      quarterEvents.map(event => (
                        <div
                          key={event.Id}
                          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getEventColor(event.importance, isEventPast(event.date))}`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start space-x-3">
                            <ApperIcon 
                              name={getEventIcon(event.type)} 
                              size={16} 
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="text-sm font-medium truncate">{event.title}</h5>
                                {isEventUpcoming(event.date) && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full ml-2">
                                    Soon
                                  </span>
                                )}
                              </div>
                              <p className="text-xs opacity-75 mb-1">
                                {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                              </p>
                              <p className="text-xs opacity-75 line-clamp-2">{event.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No events this quarter</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <ApperIcon 
                          name={getEventIcon(selectedEvent.type)} 
                          size={24} 
                          className={selectedEvent.importance === 'high' ? 'text-red-600' : 'text-blue-600'}
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ApperIcon name="X" size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date</p>
                        <p className="text-sm text-gray-900">{format(new Date(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Type</p>
                        <p className="text-sm text-gray-900 capitalize">{selectedEvent.type}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Importance</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedEvent.importance === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : selectedEvent.importance === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedEvent.importance}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                        <p className="text-sm text-gray-900">{selectedEvent.description}</p>
                      </div>
                      
                      {isEventUpcoming(selectedEvent.date) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <ApperIcon name="Clock" size={16} className="text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                              Deadline approaching - plan ahead!
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}