import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const HabitTracker = () => {
  const [habits, setHabits] = useState([
    { id: 1, name: '', enabled: true },
    { id: 2, name: '', enabled: true },
    { id: 3, name: '', enabled: true },
    { id: 4, name: '', enabled: true },
    { id: 5, name: '', enabled: true },
    { id: 6, name: '', enabled: true },
    { id: 7, name: '', enabled: true },
    { id: 8, name: '', enabled: true },
    { id: 9, name: '', enabled: true },
    { id: 10, name: '', enabled: true }
  ]);

  const daysInMonth = 30;
  const [checkedDays, setCheckedDays] = useState(() => {
    const initial = {};
    habits.forEach(habit => {
      initial[habit.id] = {};
      for (let day = 1; day <= daysInMonth; day++) {
        initial[habit.id][day] = false;
      }
    });
    return initial;
  });

  const getDayName = (day) => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const startDay = 5;
    return days[(startDay + day - 1) % 7];
  };

  const getWeekForDay = (day) => {
    return Math.ceil(day / 7);
  };

  const toggleDay = (habitId, day) => {
    setCheckedDays(prev => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        [day]: !prev[habitId][day]
      }
    }));
  };

  const updateHabitName = (habitId, name) => {
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, name } : h));
  };

  const activeHabits = habits.filter(h => h.name.trim() !== '');

  const calculations = useMemo(() => {
    const habitStats = habits
      .filter(h => h.name.trim() !== '')
      .map(habit => {
        const actual = Object.values(checkedDays[habit.id] || {}).filter(Boolean).length;
        const goal = daysInMonth;
        const percentage = (actual / goal) * 100;
        
        // Calculate streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
          if (checkedDays[habit.id]?.[day]) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
        
        // Current streak (from end)
        for (let day = daysInMonth; day >= 1; day--) {
          if (checkedDays[habit.id]?.[day]) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        return { ...habit, actual, goal, percentage, currentStreak, longestStreak };
      });

    const dailyStats = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const completed = activeHabits.filter(habit => checkedDays[habit.id]?.[day]).length;
      const percentage = activeHabits.length > 0 ? (completed / activeHabits.length) * 100 : 0;
      dailyStats.push({ day, completed, percentage, total: activeHabits.length });
    }

    const weeklyStats = [1, 2, 3, 4].map(week => {
      const startDay = (week - 1) * 7 + 1;
      const endDay = Math.min(week * 7, daysInMonth);
      const daysInWeek = endDay - startDay + 1;
      
      let totalCompleted = 0;
      for (let day = startDay; day <= endDay; day++) {
        totalCompleted += activeHabits.filter(habit => checkedDays[habit.id]?.[day]).length;
      }
      
      const totalPossible = daysInWeek * activeHabits.length;
      const percentage = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
      
      return { week: `Week ${week}`, percentage, completed: totalCompleted, possible: totalPossible };
    });

    const totalChecked = habitStats.reduce((sum, h) => sum + h.actual, 0);
    const totalPossible = activeHabits.length * daysInMonth;
    const overallPercentage = totalPossible > 0 ? (totalChecked / totalPossible) * 100 : 0;

    // Best and worst days
    const bestDay = dailyStats.reduce((max, day) => day.completed > max.completed ? day : max, dailyStats[0] || { day: 0, completed: 0 });
    const worstDay = dailyStats.reduce((min, day) => day.completed < min.completed ? day : min, dailyStats[0] || { day: 0, completed: 0 });

    return { habitStats, dailyStats, weeklyStats, overallPercentage, bestDay, worstDay };
  }, [checkedDays, habits, daysInMonth, activeHabits]);

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 md:p-8">
      <div className="max-w-full mx-auto">
        <div className="bg-white border-2 border-black p-3 sm:p-6 md:p-8" style={{
          boxShadow: '8px 8px 0px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div className="mb-6 border-b-2 border-black pb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-1 tracking-tight">
              NOVEMBER HABIT TRACKER
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
              Discipline is a habit • Track your progress daily
            </p>
          </div>

          {/* Overall Progress */}
          <div className="border-2 border-black p-3 sm:p-4 md:p-6 mb-6 relative" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)'
          }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-black uppercase tracking-wide mb-2">Overall Progress</p>
                <div className="relative border-2 border-black h-8 sm:h-10 bg-white">
                  <div 
                    className="bg-black h-full transition-all duration-500 relative"
                    style={{ width: `${calculations.overallPercentage}%` }}
                  >
                    <div className="absolute inset-0" style={{
                      background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)'
                    }}></div>
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold mix-blend-difference text-white">
                    {calculations.overallPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-black tracking-tighter">
                  {calculations.overallPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Grid */}
          <div className="border-2 border-black mb-6">
            <div className="bg-white p-2 sm:p-4 overflow-x-auto">
              <div className="min-w-max">
                {/* Week Headers - Properly aligned with 7 days each */}
                <div className="flex mb-2 border-b border-black pb-1">
                  <div className="w-32 flex-shrink-0"></div>
                  {[1, 2, 3, 4].map(week => (
                    <div key={week} className="text-center" style={{ width: week === 4 ? '96px' : '168px' }}>
                      <span className="text-xs font-bold text-black">WEEK {week}</span>
                    </div>
                  ))}
                  <div className="w-2"></div>
                </div>

                {/* Day Headers - Aligned with weeks */}
                <div className="flex mb-2">
                  <div className="w-32 flex-shrink-0 text-xs font-bold text-black">HABITS</div>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <div key={day} className="w-6 text-center flex-shrink-0">
                      <div className="text-xs font-bold text-black">{day}</div>
                      <div className="text-[10px] text-gray-500">{getDayName(day)}</div>
                    </div>
                  ))}
                  <div className="w-2"></div>
                </div>

                {/* Habit Rows with Input Fields */}
                {habits.map((habit, idx) => (
                  <div key={habit.id} className={`flex items-center mb-1 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <div className="w-32 flex-shrink-0 pr-2">
                      <input
                        type="text"
                        value={habit.name}
                        onChange={(e) => updateHabitName(habit.id, e.target.value)}
                        placeholder={`Habit ${idx + 1}`}
                        className="w-full text-xs font-bold text-black uppercase bg-transparent border-b border-gray-300 focus:border-black outline-none px-1 py-1"
                      />
                    </div>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <div key={day} className="w-6 flex-shrink-0 flex justify-center">
                        <button
                          onClick={() => toggleDay(habit.id, day)}
                          disabled={!habit.name.trim()}
                          className={`w-5 h-5 border-2 border-black transition-all ${
                            habit.name.trim() ? 'hover:scale-110 cursor-pointer' : 'opacity-30 cursor-not-allowed'
                          } ${
                            checkedDays[habit.id]?.[day]
                              ? 'bg-black'
                              : 'bg-white'
                          }`}
                        >
                          {checkedDays[habit.id]?.[day] && (
                            <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                    <div className="w-2"></div>
                  </div>
                ))}

                {/* Daily Stats Row */}
                <div className="mt-4 pt-4 border-t-2 border-black">
                  <div className="flex items-center mb-1">
                    <div className="w-32 flex-shrink-0 text-xs font-bold text-black uppercase">Daily %</div>
                    {calculations.dailyStats.map(stat => (
                      <div key={stat.day} className="w-6 flex-shrink-0 text-center text-[10px] font-bold text-black">
                        {stat.percentage.toFixed(0)}
                      </div>
                    ))}
                    <div className="w-2"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 flex-shrink-0 text-xs font-bold text-black uppercase">Count</div>
                    {calculations.dailyStats.map(stat => (
                      <div key={stat.day} className="w-6 flex-shrink-0 text-center text-[10px] font-bold text-gray-600">
                        {stat.completed}/{stat.total}
                      </div>
                    ))}
                    <div className="w-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Trend Chart */}
            <div className="border-2 border-black p-4 bg-white">
              <h3 className="text-sm font-bold text-black mb-4 border-b-2 border-black pb-2 uppercase tracking-wide">
                Daily Completion Trend
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={calculations.dailyStats}>
                  <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={1} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#000"
                    strokeWidth={2}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }}
                    axisLine={{ strokeWidth: 2 }}
                  />
                  <YAxis 
                    stroke="#000"
                    strokeWidth={2}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }}
                    domain={[0, 100]}
                    axisLine={{ strokeWidth: 2 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #000',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Line 
                    type="linear" 
                    dataKey="percentage" 
                    stroke="#000" 
                    strokeWidth={3}
                    dot={{ fill: '#000', r: 3, strokeWidth: 2, stroke: '#000' }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#000' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Comparison Chart */}
            <div className="border-2 border-black p-4 bg-white">
              <h3 className="text-sm font-bold text-black mb-4 border-b-2 border-black pb-2 uppercase tracking-wide">
                Weekly Comparison
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={calculations.weeklyStats}>
                  <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={1} />
                  <XAxis 
                    dataKey="week" 
                    stroke="#000"
                    strokeWidth={2}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }}
                    axisLine={{ strokeWidth: 2 }}
                  />
                  <YAxis 
                    stroke="#000"
                    strokeWidth={2}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }}
                    domain={[0, 100]}
                    axisLine={{ strokeWidth: 2 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #000',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Bar dataKey="percentage" fill="#000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analysis and Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Habit Performance */}
            <div className="lg:col-span-2 border-2 border-black p-4 bg-white">
              <h3 className="text-sm font-bold text-black mb-4 border-b-2 border-black pb-2 uppercase tracking-wide">
                Habit Performance Analysis
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2 text-[10px] font-bold text-black uppercase border-b border-black pb-2">
                  <div className="col-span-2">Habit</div>
                  <div className="text-center">Progress</div>
                  <div className="text-center">Done</div>
                  <div className="text-center">Current</div>
                  <div className="text-center">Best</div>
                </div>
                {calculations.habitStats.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-4 text-center">Add habits above to see analysis</p>
                ) : (
                  calculations.habitStats.map((stat, idx) => (
                    <div key={stat.id} className={`grid grid-cols-6 gap-2 items-center py-2 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <div className="col-span-2 text-xs font-bold text-black truncate uppercase">{stat.name}</div>
                      <div className="relative">
                        <div className="w-full border-2 border-black h-4 bg-white overflow-hidden">
                          <div 
                            className="bg-black h-full transition-all duration-500"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs font-bold text-black text-center">{stat.actual}/{stat.goal}</div>
                      <div className="text-xs font-bold text-black text-center">{stat.currentStreak}d</div>
                      <div className="text-xs font-bold text-black text-center">{stat.longestStreak}d</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Key Insights */}
            <div className="border-2 border-black p-4 bg-white">
              <h3 className="text-sm font-bold text-black mb-4 border-b-2 border-black pb-2 uppercase tracking-wide">
                Key Insights
              </h3>
              <div className="space-y-4">
                <div className="border-b border-black pb-3">
                  <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Best Day</p>
                  <p className="text-2xl font-bold text-black">Day {calculations.bestDay.day}</p>
                  <p className="text-xs font-bold text-gray-600">{calculations.bestDay.completed} habits completed</p>
                </div>
                <div className="border-b border-black pb-3">
                  <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Needs Focus</p>
                  <p className="text-2xl font-bold text-black">Day {calculations.worstDay.day}</p>
                  <p className="text-xs font-bold text-gray-600">{calculations.worstDay.completed} habits completed</p>
                </div>
                <div className="border-b border-black pb-3">
                  <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Active Habits</p>
                  <p className="text-2xl font-bold text-black">{activeHabits.length}</p>
                  <p className="text-xs font-bold text-gray-600">Currently tracking</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Total Completions</p>
                  <p className="text-2xl font-bold text-black">
                    {calculations.habitStats.reduce((sum, h) => sum + h.actual, 0)}
                  </p>
                  <p className="text-xs font-bold text-gray-600">This month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consistency Score */}
          <div className="border-2 border-black p-4 bg-white">
            <h3 className="text-sm font-bold text-black mb-4 border-b-2 border-black pb-2 uppercase tracking-wide">
              Consistency Score (Last 7 Days)
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {calculations.dailyStats.slice(-7).map(stat => (
                <div key={stat.day} className="text-center">
                  <div className="text-xs font-bold text-black mb-2">Day {stat.day}</div>
                  <div 
                    className="border-2 border-black mx-auto transition-all"
                    style={{ 
                      width: '40px',
                      height: `${Math.max(40, (stat.percentage / 100) * 120)}px`,
                      backgroundColor: stat.percentage >= 80 ? '#000' : stat.percentage >= 50 ? '#666' : '#ccc'
                    }}
                  ></div>
                  <div className="text-xs font-bold text-black mt-2">{stat.percentage.toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;