"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PinIcon,
  PinOffIcon,
  ChevronUp,
  ChevronDown,
  Trash2,
  X,
  Edit2,
  Check,
} from "lucide-react";
import { vocabularyApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCategoryButtonClass, getCategoryBgClass, CATEGORY_BG_COLORS } from "@/lib/colors";
import type { VocabularyItem } from "@/types/vocabulary.types";

export function GlobalPinnedVocab() {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const { data: pins = [], isLoading } = useQuery({
    queryKey: ["pinned-vocabulary"],
    queryFn: () => vocabularyApi.getPins().then((res) => res.data.data as any[]),
    enabled: isAuthenticated,
  });

  const groupedPins = React.useMemo(() => {
    const groups: Record<string, { category: any; pins: any[] }> = {
      uncategorized: { category: { id: null, name: "Pinned Vocab", color: "amber" }, pins: [] },
    };
    for (const pin of pins) {
      if (pin.category) {
        if (!groups[pin.category.id]) {
          groups[pin.category.id] = { category: pin.category, pins: [] };
        }
        groups[pin.category.id].pins.push(pin);
      } else {
        groups.uncategorized.pins.push(pin);
      }
    }
    if (groups.uncategorized.pins.length === 0) delete groups.uncategorized;
    return Object.values(groups);
  }, [pins]);

  if (!isAuthenticated || (pins.length === 0 && !isLoading)) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse items-end gap-3 pointer-events-none">
      {groupedPins.map((group) => (
        <PinGroupCard key={group.category.id || "uncategorized"} category={group.category} pins={group.pins} qc={qc} />
      ))}
    </div>
  );
}

function PinGroupCard({ category, pins, qc }: { category: any; pins: any[]; qc: any }) {
  const [isExpanded, setIsExpanded] = useState(category.id === null); // Uncategorized expanded by default
  const [autoCollapse, setAutoCollapse] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editColor, setEditColor] = useState(category.color || 'amber');

  const unpinMutation = useMutation({
    mutationFn: (id: string) => vocabularyApi.unpin(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pinned-vocabulary"] });
      setConfirmDeleteId(null);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: () => vocabularyApi.updateCategory(category.id, editName.trim(), editColor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pinned-vocabulary"] });
      qc.invalidateQueries({ queryKey: ["pin-categories"] });
      setIsEditing(false);
    },
  });

  const handleUpdateCategory = () => {
    if (!editName.trim() || !category.id) return;
    updateCategoryMutation.mutate();
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX - 24;
      setWidth(Math.max(320, Math.min(newWidth, window.innerWidth * 0.9)));
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (autoCollapse && isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [autoCollapse, isExpanded, pins.length]);

  return (
    <div className="pointer-events-auto">
      {isExpanded ? (
        <Card 
          style={{ width: `${width}px` }}
          className="shadow-2xl border-border/50 animate-scale-in origin-bottom-right flex flex-col max-h-[60vh] overflow-hidden relative"
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-3 bg-gray-100 dark:bg-gray-800 hover:bg-amber-200 dark:hover:bg-amber-900/50 cursor-ew-resize z-50 transition-colors flex items-center justify-center border-r border-border/50"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            title="Drag to resize width"
          >
            <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
          <CardHeader className="p-3 pl-6 border-b flex flex-col gap-2 sticky top-0 bg-card z-10">
            {isEditing ? (
              <div className="flex flex-col gap-2 animate-fade-in w-full">
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" onClick={handleUpdateCategory} disabled={updateCategoryMutation.isPending || !editName.trim()} className="h-8 w-8 p-0 shrink-0">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0 shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(CATEGORY_BG_COLORS).map(([colorName, bgClass]) => (
                    <button
                      key={colorName}
                      onClick={() => setEditColor(colorName)}
                      className={cn(
                        "w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-110",
                        bgClass,
                        editColor === colorName ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""
                      )}
                      title={colorName}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex items-center gap-2 group/header">
                  <div className={cn("p-1.5 rounded-md text-white shadow-sm shrink-0", getCategoryBgClass(category?.color))}>
                    <PinIcon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold truncate max-w-[150px]">{category.name}</CardTitle>
                  {category.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover/header:opacity-100 transition-opacity shrink-0"
                      onClick={() => {
                        setIsEditing(true);
                        setEditName(category.name);
                        setEditColor(category.color || 'amber');
                      }}
                    >
                      <Edit2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setAutoCollapse(!autoCollapse)}
                    title={autoCollapse ? "Disable Auto-collapse" : "Enable Auto-collapse"}
                  >
                    <div className={cn("h-2 w-2 rounded-full", autoCollapse ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsExpanded(false)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <div className="overflow-y-auto flex-1 p-0 pl-3 custom-scrollbar">
            <div className="flex flex-col divide-y divide-border/50 pb-2">
              {pins.map((pin) => (
                <div key={pin.id} className="p-4 hover:bg-muted/30 transition-colors relative group">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="font-bold text-foreground text-base break-words">{pin.vocab?.word}</p>
                      <p className="text-sm text-muted-foreground break-words mt-0.5">{pin.vocab?.translation}</p>
                    </div>
                    {confirmDeleteId === pin.vocabId ? (
                       <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm p-1 absolute right-2 top-2 z-10">
                        <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => unpinMutation.mutate(pin.vocabId)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setConfirmDeleteId(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => setConfirmDeleteId(pin.vocabId)}
                        title="Unpin"
                      >
                        <PinOffIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Button
          size="lg"
          className={cn(
            "rounded-full shadow-lg h-14 px-5 animate-fade-in flex items-center justify-center relative border-none gap-2",
            getCategoryButtonClass(category?.color)
          )}
          onClick={() => setIsExpanded(true)}
          title={category.name}
        >
          <PinIcon className="h-5 w-5 shrink-0" />
          <span className="font-semibold text-sm max-w-[150px] truncate">{category.name}</span>
          <span className="absolute -top-2 -right-1 bg-destructive text-destructive-foreground text-[11px] font-bold h-6 w-6 flex items-center justify-center rounded-full shadow-md border-2 border-background">
            {pins.length}
          </span>
        </Button>
      )}
    </div>
  );
}
