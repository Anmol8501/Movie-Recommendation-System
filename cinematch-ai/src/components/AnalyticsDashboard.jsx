import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart, 
  Area
} from 'recharts';

const STATS = [
  { value: '847K', label: 'Movies Analyzed' },
  { value: '2.4M', label: 'Recommendations Made' },
  { value: '94%', label: 'User Satisfaction' },
  { value: '18', label: 'Active Genres' }
];

const GENRE_TRENDS = [
  { name: 'Sci-Fi', Popularity: 87 },
  { name: 'Thriller', Popularity: 74 },
  { name: 'Drama', Popularity: 69 },
  { name: 'Action', Popularity: 63 },
  { name: 'Horror', Popularity: 51 },
  { name: 'Comedy', Popularity: 48 },
  { name: 'Romance', Popularity: 35 },
  { name: 'Mystery', Popularity: 28 }
];

const PERFORMANCE_TIMELINE = [
  { month: 'Jan', Recommendations: 240, Searches: 180 },
  { month: 'Feb', Recommendations: 310, Searches: 210 },
  { month: 'Mar', Recommendations: 450, Searches: 290 },
  { month: 'Apr', Recommendations: 590, Searches: 380 },
  { month: 'May', Recommendations: 780, Searches: 520 },
  { month: 'Jun', Recommendations: 940, Searches: 680 }
];

/**
 * Platform analytics dashboard visualizing movie recommendations metadata.
 */
export const AnalyticsDashboard = () => {
  return (
    <section 
      id="analytics" 
      className="w-full px-6 sm:px-12 py-16 bg-dark border-t border-white/5 scroll-mt-16 select-none"
    >
      <div className="space-y-1 mb-8">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#999999]">
          INSIGHTS
        </span>
        <h2 className="font-title text-2xl sm:text-3xl text-white tracking-wide">
          Platform Analytics
        </h2>
      </div>

      {/* 2x2 on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-card border border-white/[0.04] hover:border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors duration-300"
          >
            <span className="font-title text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-red to-purple bg-clip-text text-transparent tracking-wide">
              {stat.value}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-muted tracking-widest uppercase mt-2">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Genre Popularity Chart */}
        <div className="bg-card border border-white/[0.04] rounded-2xl p-5 sm:p-6 flex flex-col">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-purple uppercase tracking-widest">
              POPULAR DEMAND
            </span>
            <h3 className="text-sm sm:text-base font-body font-bold text-white mt-0.5">
              Genre Popularity Trends
            </h3>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="yaml"
                data={GENRE_TRENDS}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E50914" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#f0f0f0', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: '#f0f0f0',
                    fontSize: '12px',
                    fontFamily: 'DM Sans'
                  }}
                  formatter={(value) => [`${value}%`, 'Popularity']}
                />
                <Bar 
                  dataKey="Popularity" 
                  fill="url(#barGradient)" 
                  radius={[0, 4, 4, 0]} 
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Area Chart (Hidden on Mobile) */}
        <div className="hidden lg:flex bg-card border border-white/[0.04] rounded-2xl p-5 sm:p-6 flex-col">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-red uppercase tracking-widest">
              GROWTH METRICS
            </span>
            <h3 className="text-sm sm:text-base font-body font-bold text-white mt-0.5">
              Platform Scaling (Last 6 Months)
            </h3>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={PERFORMANCE_TIMELINE}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E50914" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E50914" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#999999', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#999999', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: '#f0f0f0',
                    fontSize: '12px',
                    fontFamily: 'DM Sans'
                  }}
                  formatter={(value) => [`${value}K`, undefined]}
                />
                <Area 
                  type="monotone" 
                  dataKey="Recommendations" 
                  stroke="#E50914" 
                  fillOpacity={1} 
                  fill="url(#recGrad)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="Searches" 
                  stroke="#7C3AED" 
                  fillOpacity={1} 
                  fill="url(#searchGrad)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AnalyticsDashboard;
