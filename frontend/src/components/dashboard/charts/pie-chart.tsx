"use client";

import { Cell, Legend, Pie, PieChart as RPieChart, ResponsiveContainer, Tooltip } from "recharts";

export type PieDatum = { name: string; value: number; color: string };

export function PieChartWidget({ data, height = 240 }: { data: PieDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RPieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "hsl(var(--popover-foreground))",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RPieChart>
    </ResponsiveContainer>
  );
}
