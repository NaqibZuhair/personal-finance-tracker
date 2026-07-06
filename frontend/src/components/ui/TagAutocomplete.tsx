import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../lib/apiClient';

type TagsResponse = {
  data: string[];
};

type TagAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectTag?: (tag: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  excludeTags?: string[];
};

export default function TagAutocomplete({
  value,
  onChange,
  onSelectTag,
  onKeyDown,
  placeholder = 'e.g. food, work...',
  disabled = false,
  className = '',
  excludeTags = [],
}: TagAutocompleteProps) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await apiClient<TagsResponse>('/transactions/meta/tags');
        if (res?.data && Array.isArray(res.data)) {
          setAllTags(res.data);
        }
      } catch (err) {
        console.error('Failed to load tag suggestions:', err);
      }
    }
    fetchTags();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = value.replace(/^#/, '').toLowerCase().trim();
  const filteredTags = allTags.filter(
    (t) =>
      !excludeTags.includes(t.toLowerCase()) &&
      t.toLowerCase().includes(cleanQuery) &&
      (cleanQuery ? true : true) // show all available if query is empty or match if typing
  );

  const showDropdown = isOpen && !disabled && filteredTags.length > 0;

  const handleSelect = (tag: string) => {
    if (onSelectTag) {
      onSelectTag(tag);
    } else {
      onChange(tag);
    }
    setIsOpen(false);
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredTags.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev - 1 < 0 ? filteredTags.length - 1 : prev - 1
        );
        return;
      }
      if (e.key === 'Enter' && filteredTags[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredTags[selectedIndex]);
        return;
      }
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setSelectedIndex(0);
        }}
        onFocus={() => {
          setIsOpen(true);
          setSelectedIndex(0);
        }}
        onKeyDown={handleKeyDownInternal}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />

      {showDropdown && (
        <div className="absolute z-50 mt-1 max-h-[185px] w-full overflow-y-auto rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 transition-all animate-in fade-in zoom-in-95 duration-150 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Suggested Tags ({filteredTags.length})
          </div>
          <ul className="mt-1 space-y-0.5">
            {filteredTags.map((tag, idx) => (
              <li
                key={tag}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(tag);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  idx === selectedIndex
                    ? 'bg-indigo-500 text-white shadow-sm scale-[1.01]'
                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="opacity-70">#</span>
                  {tag}
                </span>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  idx === selectedIndex ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  Select
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
