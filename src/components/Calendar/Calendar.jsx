import React, { useState, useEffect, useMemo } from 'react';
import './Calendar.css';

const Calendar = ({ 
  view = 'week', 
  startDate, 
  schedule = [], 
  lessons = [], 
  onSlotSelect, 
  onDateChange 
}) => {
  const [currentStartDate, setCurrentStartDate] = useState(startDate);
  const [currentView, setCurrentView] = useState(view);

  const daysInView = useMemo(() => {
    switch (currentView) {
      case 'day': return 1;
      case '3days': return 3;
      case 'week': return 7;
      default: return 7;
    }
  }, [currentView]);

  const displayDates = useMemo(() => {
    return Array.from({ length: daysInView }, (_, i) => {
      const date = new Date(currentStartDate);
      date.setDate(currentStartDate.getDate() + i);
      return date;
    });
  }, [currentStartDate, daysInView]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ hour, minute, timeString });
      }
    }
    return slots;
  }, []);

  const isSlotInSchedule = (date, hour, minute) => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + 30);

    return schedule.some(period => {
      const periodStart = new Date(period.startTime);
      const periodEnd = new Date(period.endTime);
      return slotStart >= periodStart && slotEnd <= periodEnd;
    });
  };

  const getLessonsForDate = (date) => {
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.startTime);
      return lessonDate.toDateString() === date.toDateString();
    });
  };

  const getLessonForSlot = (date, hour, minute) => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    
    return lessons.find(lesson => {
      const lessonStart = new Date(lesson.startTime);
      return lessonStart.getTime() === slotStart.getTime();
    });
  };

  const getLessonSpan = (lesson) => {
    if (!lesson) return 1;
    const lessonStart = new Date(lesson.startTime);
    const lessonEnd = new Date(lesson.endTime);
    const durationMinutes = (lessonEnd - lessonStart) / (1000 * 60);
    return Math.max(1, Math.ceil(durationMinutes / 30));
  };

  const handleSlotClick = (date, hour, minute, lesson) => {
    const startTime = new Date(date);
    startTime.setHours(hour, minute, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + 30);

    if (lesson && onSlotSelect) {
      onSlotSelect({ startTime, endTime, lesson });
    } else if (!lesson && onSlotSelect) {
      onSlotSelect({ startTime, endTime });
    }
  };

  const handleNavigation = (direction) => {
    const newDate = new Date(currentStartDate);
    const offset = daysInView * direction;
    newDate.setDate(newDate.getDate() + offset);
    setCurrentStartDate(newDate);
    onDateChange?.(newDate);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setCurrentView('day');
      } else if (window.innerWidth < 768) {
        setCurrentView('3days');
      } else {
        setCurrentView('week');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDateHeader = (date) => {
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatLessonTime = (lesson) => {
    const start = new Date(lesson.startTime);
    const end = new Date(lesson.endTime);
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')} (${lesson.duration} min)`;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-button"
          onClick={() => handleNavigation(-1)}
        >
          ←
        </button>
        
        <div className="calendar-title">
          {displayDates[0].toLocaleDateString('ru-RU')} -{' '}
          {displayDates[displayDates.length - 1].toLocaleDateString('ru-RU')}
        </div>
        
        <button 
          className="nav-button"
          onClick={() => handleNavigation(1)}
        >
          →
        </button>
      </div>

      <div 
        className="calendar-grid"
        style={{
          gridTemplateColumns: `80px repeat(${daysInView}, 1fr)`,
          gridTemplateRows: `40px repeat(${timeSlots.length}, 30px)`
        }}
      >
        <div className="time-header">Time</div>
        
        {displayDates.map((date, index) => (
          <div key={index} className="day-header">
            {formatDateHeader(date)}
          </div>
        ))}

        {timeSlots.map(({ hour, minute, timeString }, rowIndex) => (
          <React.Fragment key={timeString}>

            <div className="time-slot">
              {timeString}
            </div>

            {displayDates.map((date, colIndex) => {
              const lesson = getLessonForSlot(date, hour, minute);
              const isAvailable = isSlotInSchedule(date, hour, minute);
              const lessonSpan = getLessonSpan(lesson);
              const row = rowIndex + 2;
              const column = colIndex + 2;

              if (lesson && lessonSpan > 1 && minute !== 0) {
                return null;
              }

              if (lesson) {
                return (
                  <div
                    key={`${colIndex}-${timeString}`}
                    className="schedule-cell booked"
                    style={{
                      gridRow: `${row} / span ${lessonSpan}`,
                      gridColumn: column
                    }}
                    onClick={() => handleSlotClick(date, hour, minute, lesson)}
                  >
                    <div className="lesson-block">
                      <div className="lesson-student">{lesson.student}</div>
                      <div className="lesson-time">{formatLessonTime(lesson)}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`${colIndex}-${timeString}`}
                  className={`schedule-cell ${isAvailable ? 'available' : 'blocked'}`}
                  style={{
                    gridRow: row,
                    gridColumn: column
                  }}
                  onClick={() => isAvailable && handleSlotClick(date, hour, minute)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
// д
export default Calendar;