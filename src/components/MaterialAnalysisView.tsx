import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Atom, FileText, Shield, Ruler, Weight, Utensils, Package, ZoomIn } from "lucide-react";

interface Material {
  type: string;
  chemicalFormula: string;
  chemicalStructureImage: string | null;
  fssaiLimits: string[] | string;
  bisLimits: string[] | string;
  thickness: string;
  gsm: string;
  foodApplications: string[] | string;
}

interface MaterialAnalysisViewProps {
  materials: Material[];
}

type PropertyType = "chemical" | "fssai" | "bis" | "thickness" | "gsm" | "applications";

export const MaterialAnalysisView = ({ materials }: MaterialAnalysisViewProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const propertyButtons = [
    { id: "chemical" as PropertyType, label: "Chemical Structure", icon: Atom },
    { id: "fssai" as PropertyType, label: "FSSAI Limits", icon: FileText },
    { id: "bis" as PropertyType, label: "BIS Standards", icon: Shield },
    { id: "thickness" as PropertyType, label: "Thickness", icon: Ruler },
    { id: "gsm" as PropertyType, label: "GSM", icon: Weight },
    { id: "applications" as PropertyType, label: "Food Applications", icon: Utensils },
  ];

  const renderPropertyContent = (material: Material, property: PropertyType) => {
    const fssaiLimits = Array.isArray(material.fssaiLimits) 
      ? material.fssaiLimits 
      : [material.fssaiLimits];
    const bisLimits = Array.isArray(material.bisLimits)
      ? material.bisLimits
      : [material.bisLimits];
    const foodApplications = Array.isArray(material.foodApplications)
      ? material.foodApplications
      : [material.foodApplications];

    switch (property) {
      case "chemical":
        return (
          <div className="space-y-3">
            {material.chemicalStructureImage && (
              <div className="relative group">
                <img 
                  src={material.chemicalStructureImage} 
                  alt="Chemical structure"
                  className="w-full max-w-sm h-48 mx-auto bg-white p-4 rounded border object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setEnlargedImage(material.chemicalStructureImage)}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-background/80 backdrop-blur-sm rounded-full p-2">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}
            <ul className="list-disc list-inside space-y-1">
              <li>Formula: {material.chemicalFormula}</li>
            </ul>
          </div>
        );
      case "fssai":
        return (
          <ul className="list-disc list-inside space-y-1">
            {fssaiLimits.map((limit, idx) => (
              <li key={idx}>{limit}</li>
            ))}
          </ul>
        );
      case "bis":
        return (
          <ul className="list-disc list-inside space-y-1">
            {bisLimits.map((limit, idx) => (
              <li key={idx}>{limit}</li>
            ))}
          </ul>
        );
      case "thickness":
        return (
          <ul className="list-disc list-inside space-y-1">
            <li>Thickness: {material.thickness}</li>
          </ul>
        );
      case "gsm":
        return (
          <ul className="list-disc list-inside space-y-1">
            <li>GSM: {material.gsm}</li>
          </ul>
        );
      case "applications":
        return (
          <ul className="list-disc list-inside space-y-1">
            {foodApplications.map((app, idx) => (
              <li key={idx}>{app}</li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Selected Material Indicator (Compact at top when selected) */}
      {selectedMaterial !== null && (
        <Card className="bg-muted/50 sticky top-2 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-fade-in">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">{materials[selectedMaterial].type}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMaterial(null);
                  setSelectedProperty(null);
                }}
              >
                Change Component
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Material Selection Buttons */}
      {selectedMaterial === null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-2 ${materials.length <= 2 ? 'grid-cols-2' : materials.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
              {materials.map((material, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => {
                    setSelectedMaterial(index);
                    setSelectedProperty(null);
                  }}
                  className="h-20 p-2 flex flex-col gap-1 items-center justify-center hover-scale"
                >
                  <Package className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs text-center leading-tight line-clamp-2">{material.type}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Selection Buttons */}
      {selectedMaterial !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Property to View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
              {propertyButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <Button
                    key={btn.id}
                    variant={selectedProperty === btn.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedProperty(btn.id);
                      setIsDialogOpen(true);
                    }}
                    className="h-16 p-1.5 flex flex-col gap-0.5 items-center justify-center hover-scale"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[9px] text-center leading-tight">{btn.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Content Dialog */}
      {selectedMaterial !== null && selectedProperty && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl animate-fade-in">
            <DialogHeader>
              <DialogTitle>
                {materials[selectedMaterial].type} - {propertyButtons.find(b => b.id === selectedProperty)?.label}
              </DialogTitle>
              <DialogDescription>Detailed information about the selected property.</DialogDescription>
            </DialogHeader>
            <div className="text-sm mt-4 max-h-[60vh] overflow-hidden">
              {renderPropertyContent(materials[selectedMaterial], selectedProperty)}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Enlarged Image Dialog */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-4xl animate-fade-in">
          <DialogHeader>
            <DialogTitle>Chemical Structure (Enlarged)</DialogTitle>
            <DialogDescription>Click outside or press ESC to close</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {enlargedImage && (
              <img 
                src={enlargedImage} 
                alt="Chemical structure enlarged"
                className="w-full h-auto bg-white p-6 rounded border object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
