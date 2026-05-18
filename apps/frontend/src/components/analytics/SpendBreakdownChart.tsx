'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Cards';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Shopping', value: 45000, color: '#10b981' }, // fintech-cashback
  { name: 'Travel', value: 30000, color: '#0ea5e9' }, // fintech-miles
  { name: 'Dining', value: 15000, color: '#f59e0b' }, // warning
  { name: 'Utilities', value: 10000, color: '#6366f1' }, // fintech-points
];

export function SpendBreakdownChart() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Spend by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₹${value}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
