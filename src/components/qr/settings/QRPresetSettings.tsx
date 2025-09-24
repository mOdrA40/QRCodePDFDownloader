/**
 * QR Preset Settings Component
 * Save, load, and manage QR presets
 */

"use client";

import { Star } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQRContext } from "@/contexts";
import type { QRPreset } from "@/types";

export function QRPresetSettings() {
  const { savePreset, loadPreset, deletePreset, getPresets } = useQRContext();
  const [presetName, setPresetName] = useState("");
  const [savedPresets, setSavedPresets] = useState<QRPreset[]>([]);
  const presetNameId = useId();

  useEffect(() => {
    const presets = getPresets();
    setSavedPresets(presets);
  }, [getPresets]);

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    const success = await savePreset(presetName.trim());
    if (success) {
      setPresetName("");
      setSavedPresets(getPresets());
    }
  };

  const handleLoadPreset = (preset: QRPreset) => {
    loadPreset(preset);
  };

  const handleDeletePreset = async (id: string) => {
    const success = await deletePreset(id);
    if (success) {
      setSavedPresets(getPresets());
    }
  };

  return (
    <>
      <div>
        <Label htmlFor={presetNameId} className="text-sm font-medium">
          Save Current Configuration
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            id={presetNameId}
            placeholder="Enter preset name..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSavePreset();
              }
            }}
          />
          <Button onClick={handleSavePreset} size="sm">
            <Star className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Saved Presets ({savedPresets.length})
        </Label>
        {savedPresets.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedPresets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-2 border rounded-md bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{preset.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(preset.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadPreset(preset)}
                    className="h-7 px-2"
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePreset(preset.id)}
                    className="h-7 px-2"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No saved presets yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Save your current configuration above
            </p>
          </div>
        )}
      </div>
    </>
  );
}
