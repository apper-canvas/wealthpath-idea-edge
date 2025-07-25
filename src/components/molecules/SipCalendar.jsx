import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { formatCurrency } from "@/utils/formatters";

const SipCalendar = ({ sips, goals, onCreateSip, onEditSip, onToggleStatus }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get SIP investments for a specific date
  const getSipsForDate = (date) => {
    return sips.filter(sip => {
      if (sip.status !== 'active') return false;
      
      const sipDate = new Date(sip.nextInvestmentDate);
      return isSameDay(date, sipDate);
    });
  };

  // Get goal info by ID
  const getGoalById = (goalId) => {
    return goals.find(goal => goal.Id === goalId);
  };

  // Calculate total amount for a date
  const getTotalForDate = (date) => {
    const dateSips = getSipsForDate(date);
    return dateSips.reduce((total, sip) => total + sip.amount, 0);
  };

  const selectedDateSips = selectedDate ? getSipsForDate(selectedDate) : [];

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
    setSelectedDate(null);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ApperIcon name="Calendar" size={20} />
                  SIP Investment Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ApperIcon name="ChevronLeft" size={16} />
                  </Button>
                  <span className="text-sm font-medium min-w-[120px] text-center">
                    {format(currentDate, 'MMMM yyyy')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ApperIcon name="ChevronRight" size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                  const dayNumber = format(day, 'd');
                  const dateSips = getSipsForDate(day);
                  const totalAmount = getTotalForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative p-2 h-16 border border-slate-200 rounded-lg transition-all
                        hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500
                        ${isSelected ? 'bg-primary-50 border-primary-300' : ''}
                        ${isTodayDate ? 'bg-primary-100 border-primary-400 font-medium' : ''}
                        ${!isSameMonth(day, currentDate) ? 'text-slate-400' : ''}
                      `}
                    >
                      <div className="text-sm">{dayNumber}</div>
                      {dateSips.length > 0 && (
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="bg-primary-500 text-white text-xs rounded px-1 py-0.5 truncate">
                            {formatCurrency(totalAmount)}
                          </div>
                          {dateSips.length > 1 && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {dateSips.length} SIPs
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-100 border border-primary-400 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-500 rounded"></div>
                  <span>SIP Investment</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          {selectedDate ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateSips.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <div className="text-sm text-slate-600">Total Investment</div>
                      <div className="text-2xl font-bold text-primary-600">
                        {formatCurrency(getTotalForDate(selectedDate))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedDateSips.map(sip => {
                        const goal = getGoalById(sip.goalId);
                        return (
                          <div key={sip.Id} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-slate-900">
                                {goal?.name || 'Unknown Goal'}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onEditSip(sip)}
                                  className="p-1 text-slate-500 hover:text-primary-600"
                                >
                                  <ApperIcon name="Edit2" size={14} />
                                </button>
                                <button
                                  onClick={() => onToggleStatus(sip.Id)}
                                  className={`p-1 ${
                                    sip.status === 'active' 
                                      ? 'text-slate-500 hover:text-warning-600' 
                                      : 'text-slate-500 hover:text-success-600'
                                  }`}
                                >
                                  <ApperIcon name={sip.status === 'active' ? 'Pause' : 'Play'} size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-slate-600">
                              Amount: {formatCurrency(sip.amount)}
                            </div>
                            <div className="text-sm text-slate-600">
                              Frequency: {sip.frequency}
                            </div>
                            <div className={`text-xs mt-1 ${
                              sip.status === 'active' ? 'text-success-600' : 'text-warning-600'
                            }`}>
                              {sip.status === 'active' ? 'Active' : 'Paused'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <ApperIcon name="Calendar" size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>No SIP investments scheduled for this date</p>
                    <Button
                      onClick={onCreateSip}
                      className="mt-4"
                      size="sm"
                    >
                      Setup SIP
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-slate-500">
                <ApperIcon name="MousePointer2" size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Click on a date to view SIP investments</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={onCreateSip}
                className="w-full flex items-center gap-2"
              >
                <ApperIcon name="Plus" size={16} />
                Setup New SIP
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
                className="w-full flex items-center gap-2"
              >
                <ApperIcon name="Calendar" size={16} />
                Go to Today
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SipCalendar;