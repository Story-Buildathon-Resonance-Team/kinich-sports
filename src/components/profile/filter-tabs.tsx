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
                ? "bg-[rgba(0,71,171,0.1)] border-[rgba(0,71,171,0.3)] text-[#F5F7FA]"
                : "bg-transparent border-[rgba(245,247,250,0.1)] text-[rgba(245,247,250,0.5)] hover:bg-[rgba(0,71,171,0.05)] hover:border-[rgba(0,71,171,0.2)] hover:text-[rgba(245,247,250,0.7)]"
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
