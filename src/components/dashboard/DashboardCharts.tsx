'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#0f172a', '#d4a853', '#334155', '#1e293b', '#b8922f', '#64748b', '#059669'];

interface BikeChartItem {
  name: string;
  거치대: number;
  대여가능: number;
  반납가능: number;
}

interface TransportChartItem {
  name: string;
  운영차량: number;
  가용차량: number;
}

interface LibraryChartItem {
  name: string;
  value: number;
}

export function BikeBarChart({ data }: { data: BikeChartItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="거치대" fill="#1e293b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="대여가능" fill="#d4a853" radius={[4, 4, 0, 0]} />
        <Bar dataKey="반납가능" fill="#64748b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TransportBarChart({ data }: { data: TransportChartItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="운영차량" fill="#0f172a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="가용차량" fill="#d4a853" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LibraryPieChart({ data }: { data: LibraryChartItem[] }) {
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="60%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-1.5">
        {data.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs" style={{ color: '#334155' }}>
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="truncate">{item.name}</span>
            <span className="ml-auto font-medium">{item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
