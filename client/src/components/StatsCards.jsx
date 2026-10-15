import React from 'react';
import { Layers, Send, Calendar, CheckCircle2, XCircle } from 'lucide-react';

const StatsCards = ({ stats, selectedStatus, onSelectStatus }) => {
  const cards = [
    {
      key: 'all',
      status: null,
      label: 'Total Applications',
      count: stats?.total ?? 0,
      icon: Layers,
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-700',
      border: 'border-indigo-100',
      activeBorder: 'ring-2 ring-indigo-500'
    },
    {
      key: 'Applied',
      status: 'Applied',
      label: 'Applied',
      count: stats?.Applied ?? 0,
      icon: Send,
      bg: 'bg-blue-50/70',
      text: 'text-blue-700',
      border: 'border-blue-100',
      activeBorder: 'ring-2 ring-blue-500'
    },
    {
      key: 'Interview',
      status: 'Interview',
      label: 'Interviews',
      count: stats?.Interview ?? 0,
      icon: Calendar,
      bg: 'bg-amber-50/70',
      text: 'text-amber-700',
      border: 'border-amber-100',
      activeBorder: 'ring-2 ring-amber-500'
    },
    {
      key: 'Offer',
      status: 'Offer',
      label: 'Offers',
      count: stats?.Offer ?? 0,
      icon: CheckCircle2,
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      activeBorder: 'ring-2 ring-emerald-500'
    },
    {
      key: 'Rejected',
      status: 'Rejected',
      label: 'Rejected',
      count: stats?.Rejected ?? 0,
      icon: XCircle,
      bg: 'bg-rose-50/70',
      text: 'text-rose-700',
      border: 'border-rose-100',
      activeBorder: 'ring-2 ring-rose-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.status;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectStatus(card.status)}
            className={`text-left p-4 rounded-xl bg-white border ${card.border} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
              isSelected ? `${card.activeBorder} shadow-indigo-100` : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bg} ${card.text}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {card.count}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatsCards;
