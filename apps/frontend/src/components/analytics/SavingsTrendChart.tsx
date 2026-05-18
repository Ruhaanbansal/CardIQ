'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Cards';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', savings: 1200 },
  { month: 'Feb', savings: 2100 },
  { month: 'Mar', savings: 1800 },
  { month: 'Apr', savings: 2400 },
  { month: 'May', savings: 3200 },
  { month: 'Jun', savings: 3550 },
];

export function SavingsTrendChart() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Optimization Savings Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} tickFormatter={(val) => `₹${val}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <Tooltip 
                formatter={(value: number) => [`₹${value}`, 'Savings']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
