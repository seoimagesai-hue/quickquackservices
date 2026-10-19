"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function BookingsChart({
  data,
}: {
  data: Array<{ date: string; bookings: number }>;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9a9a9a" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9a9a9a" }} />
          <Tooltip
            contentStyle={{
              background: "#0c0c0c",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 0,
            }}
          />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#f2ebe0"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
