import React, { useState } from 'react';
import Calendar from './components/Calendar/Calendar';

const sampleSchedule = [
  {
    "startTime": "2025-08-27T02:30:00+00:00",
    "endTime": "2025-08-27T06:59:59+00:00"
  },
  {
    "startTime": "2025-08-28T23:00:00+00:00",
    "endTime": "2025-08-29T08:29:59+00:00"
  },
  {
    "startTime": "2025-08-30T22:30:00+00:00",
    "endTime": "2025-08-31T02:29:59+00:00"
  },
  {
    "startTime": "2025-09-01T01:30:00+00:00",
    "endTime": "2025-09-01T04:59:59+00:00"
  },
  {
    "startTime": "2025-09-01T11:00:00+00:00",
    "endTime": "2025-09-01T19:29:59+00:00"
  }
];

const sampleLessons = [
  {
    "id": 52,
    "duration": 90,
    "startTime": "2025-08-27T06:00:00+00:00",
    "endTime": "2025-08-27T07:29:59+00:00",
    "student": "Sarah"
  },
  {
    "id": 53,
    "duration": 90,
    "startTime": "2025-08-30T23:00:00+00:00",
    "endTime": "2025-08-31T00:29:59+00:00",
    "student": "John"
  }
];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date('2025-08-27'));

  const handleSlotSelect = (slot) => {
    if (slot.lesson) {
      alert(`Урок: ${slot.lesson.student}\nВремя: ${slot.startTime.toLocaleTimeString()}\nДлительность: ${slot.lesson.duration} мин`);
    } else {
      alert(`Выбран слот: ${slot.startTime.toLocaleString()} - ${slot.endTime.toLocaleString()}`);
    }
  };

  return (
    <div className="App">
      <Calendar
        view="week"
        startDate={currentDate}
        schedule={sampleSchedule}
        lessons={sampleLessons}
        onSlotSelect={handleSlotSelect}
        onDateChange={setCurrentDate}
      />
    </div>
  );
}

export default App;