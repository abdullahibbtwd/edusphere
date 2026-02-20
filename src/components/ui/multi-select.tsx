"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type Option = {
    label: string;
    value: string;
};

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
    disabled = false,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Handle click outside to close
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const filteredOptions = React.useMemo(() => {
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const handleSelect = (value: string) => {
        if (disabled) return;
        const newSelected = selected.includes(value)
            ? selected.filter((s) => s !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const handleUnselect = (e: React.MouseEvent, value: string) => {
        e.stopPropagation();
        if (disabled) return;
        onChange(selected.filter((s) => s !== value));
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger Container */}
            <div
                onClick={() => !disabled && setOpen(!open)}
                className={cn(
                    "flex min-h-[40px] w-full items-center justify-between rounded-lg border border-input bg-bg px-3 py-2 text-sm transition-all duration-200",
                    !disabled && "cursor-pointer hover:border-primary/50",
                    disabled && "opacity-50 cursor-not-allowed bg-muted/20",
                    open && "ring-2 ring-primary/20 border-primary",
                    className
                )}
            >
                <div className="flex flex-wrap gap-1.5 flex-1">
                    {selected.length === 0 ? (
                        <span className="text-muted-foreground select-none">
                            {placeholder}
                        </span>
                    ) : (
                        selected.map((val) => {
                            const option = options.find((o) => o.value === val);
                            return (
                                <Badge
                                    key={val}
                                    variant="secondary"
                                    className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                    {option?.label || val}
                                    <button
                                        onClick={(e) => handleUnselect(e, val)}
                                        className={cn(
                                            "rounded-full p-0.5 transition-colors",
                                            !disabled && "hover:bg-primary/20",
                                            disabled && "cursor-not-allowed opacity-50"
                                        )}
                                        disabled={disabled}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })
                    )}
                </div>
                <div className="flex items-center ml-2 border-l border-border pl-2 gap-1 text-muted-foreground">
                    {selected.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!disabled) onChange([]);
                            }}
                            className={cn(
                                "rounded p-0.5 transition-colors",
                                !disabled && "hover:text-danger hover:bg-danger/10",
                                disabled && "cursor-not-allowed opacity-50"
                            )}
                            disabled={disabled}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <ChevronsUpDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open && "rotate-180")} />
                </div>
            </div>

            {/* Dropdown Content */}
            {open && (
                <div className="absolute z-50 mt-2 w-full min-w-[200px] overflow-hidden rounded-xl border border-border bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center border-b border-border bg-muted/30 px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                        <input
                            autoFocus
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground italic">
                                No results found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-0.5">
                                {filteredOptions.map((option) => {
                                    const isSelected = selected.includes(option.value);
                                    return (
                                        <div
                                            key={option.value}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(option.value);
                                            }}
                                            className={cn(
                                                "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none transition-all duration-150",
                                                isSelected
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "hover:bg-muted text-foreground"
                                            )}
                                        >
                                            <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                                                {isSelected && <Check className="h-4 w-4" />}
                                            </span>
                                            {option.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {selected.length > 0 && (
                        <div className="border-t border-border bg-muted/10 p-2 flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase px-1">
                                {selected.length} selected
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange([]);
                                }}
                                className="text-[10px] h-6 px-2 text-muted-foreground hover:text-danger hover:bg-danger/10 font-bold rounded-md transition-all uppercase"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
