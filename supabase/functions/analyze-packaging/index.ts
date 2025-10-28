import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Missing image data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert food packaging material analyst specializing in Indian regulations and standards. Analyze the image and identify all packaging materials visible.

FOCUS: Only analyze FOOD PACKAGING materials.

CRITICAL: Be very specific with material names. Examples:
- Instead of "metal" say "tin-plated steel can" or "aluminum foil"
- Instead of "plastic" say "PET bottle" or "HDPE container" or "PP film"
- Instead of "paper" say "kraft paper" or "coated paperboard"

For each material detected, provide:
- Detailed material type (be very specific, include exact type)
- Chemical structure formula (e.g., "(C10H8O4)n" for PET, "C3H6" for PP)
- FSSAI limit values: Provide actual regulatory limits/values (e.g., "Maximum heavy metal: 1 ppm", "Migration limit: 10 mg/kg")
- BIS standard values: Provide actual limit values (e.g., "Thickness tolerance: ±5%", "Burst strength: 250 kPa")
- Common thickness: Only number with unit (e.g., "50 microns")
- Common GSM: Only number (e.g., "80")
- Potential applications in food industry: List 3-4 specific food applications

Return your analysis in JSON format with this structure:
{
  "materials": [
    {
      "type": "string",
      "chemicalFormula": "string",
      "fssaiLimits": "string",
      "bisLimits": "string",
      "thickness": "string",
      "gsm": "string",
      "foodApplications": "string"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error("No analysis returned from AI");
    }

    const analysis = JSON.parse(analysisText);

    // Generate chemical structure images for each material
    const materialsWithImages = await Promise.all(
      analysis.materials.map(async (material: any) => {
        try {
          const imagePrompt = `Generate a clean 2D chemical structure diagram for ${material.chemicalFormula}. White background, black molecular structure, skeletal formula style, professional chemistry textbook quality.`;
          
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [
                {
                  role: "user",
                  content: imagePrompt
                }
              ],
              modalities: ["image", "text"]
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            return {
              ...material,
              chemicalStructureImage: imageUrl || null
            };
          }
        } catch (error) {
          console.error("Error generating structure image:", error);
        }
        
        return {
          ...material,
          chemicalStructureImage: null
        };
      })
    );

    return new Response(
      JSON.stringify({ materials: materialsWithImages }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-packaging:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
