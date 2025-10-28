import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Atom, FileText, Shield, Ruler, Weight, Utensils } from "lucide-react";

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
              <img 
                src={material.chemicalStructureImage} 
                alt="Chemical structure"
                className="w-full max-w-md mx-auto bg-white p-4 rounded border"
              />
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
    <div className="space-y-4">
      {/* Material Selection Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {materials.map((material, index) => (
              <Button
                key={index}
                variant={selectedMaterial === index ? "default" : "outline"}
                onClick={() => {
                  setSelectedMaterial(index);
                  setSelectedProperty(null);
                }}
              >
                {material.type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Selection Buttons */}
      {selectedMaterial !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Property</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {propertyButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <Button
                    key={btn.id}
                    variant={selectedProperty === btn.id ? "default" : "outline"}
                    onClick={() => setSelectedProperty(btn.id)}
                    className="aspect-square h-auto p-4 flex flex-col gap-2 items-center justify-center"
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs text-center leading-tight">{btn.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Content Display */}
      {selectedMaterial !== null && selectedProperty && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {materials[selectedMaterial].type} - {propertyButtons.find(b => b.id === selectedProperty)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {renderPropertyContent(materials[selectedMaterial], selectedProperty)}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
