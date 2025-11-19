"use client";

import { useState } from "react";

type FilterOption = "all" | "video" | "audio";

interface FilterTabsProps {
  defaultFilter?: FilterOption;
  onFilterChange?: (filter: FilterOption) => void;
}

export function FilterTabs({
  defaultFilter = "all",
  onFilterChange,
}: FilterTabsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>(defaultFilter);

  const filters: { value: FilterOption; label: string }[] = [
    { value: "all", label: "All" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
  ];

  const handleFilterClick = (filter: FilterOption) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div className='flex gap-3'>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilterClick(filter.value)}
          className={`
            px-5 py-2
            rounded-lg
            text-[14px] font-medium
            border
            transition-all duration-300
            ${
              activeFilter === filter.value
                ? "bg-cobalt/10 border-cobalt/30 text-ice"
                : "bg-transparent border-ice/10 text-ice/50 hover:bg-cobalt/5 hover:border-cobalt/20 hover:text-ice/70"
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
