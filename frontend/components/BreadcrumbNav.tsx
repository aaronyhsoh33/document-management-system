'use client';

import { Item } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbNavProps {
  trail: Item[];
  onNavigate: (item: Item | null) => void;
}

export function BreadcrumbNav({ trail, onNavigate }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-600 mb-4">
      <button
        onClick={() => onNavigate(null)}
        className="hover:text-blue-600 font-medium transition-colors"
      >
        Root
      </button>
      {trail.map((item) => (
        <span key={item.id} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => onNavigate(item)}
            className="hover:text-blue-600 transition-colors"
          >
            {item.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
