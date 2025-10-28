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

    const systemPrompt = `You are an expert food packaging material analyst specializing in Indian FSSAI and BIS regulations. Analyze the packaging image carefully and identify ALL visible packaging materials with precise details.

CRITICAL REQUIREMENTS:
1. Be EXTREMELY specific with material identification:
   - For plastics: Specify exact type (PET, HDPE, LDPE, PP, PS, PVC, etc.) and form (bottle, film, container, lid)
   - For metals: Specify exact type (tin-plated steel, aluminum, tinplate) and form (can, foil, cap)
   - For paper: Specify exact type (kraft paper, coated paperboard, corrugated board, wax paper)
   - For composites: List all layers (e.g., "PE/AL/PET multilayer film")

2. Provide DETAILED regulatory compliance data:
   - FSSAI limits: Include specific migration limits, heavy metal limits, and overall migration values
   - BIS standards: Include density, tensile strength, thickness tolerances, and relevant IS codes
   - Use exact numerical values with units (e.g., "Overall migration limit: 60 mg/kg (10 mg/dm²)")

3. Technical specifications MUST be realistic:
   - Thickness: Use appropriate units (microns for films, mm for rigid containers)
   - GSM: Only for paper/board materials (typical range: 60-400)
   - For non-paper materials, use "N/A" for GSM

4. Food applications: List 3-5 specific, realistic food product categories

RESPONSE FORMAT (strict JSON):
{
  "materials": [
    {
      "type": "Specific material name with form (e.g., 'HDPE bottle', 'Aluminum foil', 'Kraft paper')",
      "chemicalFormula": "Accurate formula (e.g., '(C2H4)n' for PE, 'Al' for aluminum, 'C6H10O5' for cellulose)",
      "fssaiLimits": [
        "Overall migration: [value] mg/kg or mg/dm²",
        "Specific migration limits: [details]",
        "Heavy metals (Pb, Cd, Hg, Cr): [values] ppm"
      ],
      "bisLimits": [
        "Relevant BIS standard: IS [code]",
        "Density: [value] g/cm³",
        "Tensile strength: [value] MPa",
        "Other specific parameters"
      ],
      "thickness": "Realistic value with unit (e.g., '25 microns', '1.5 mm')",
      "gsm": "Number only for paper/board, 'N/A' for others",
      "foodApplications": [
        "Specific food category 1",
        "Specific food category 2",
        "Specific food category 3"
      ]
    }
  ]
}

IMPORTANT: Analyze thoroughly and return data for ALL identifiable materials in the packaging.`;

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
          // Simplified prompt for better image generation
          const imagePrompt = `Draw a clean skeletal formula diagram of ${material.chemicalFormula} chemical structure. Pure white background, black lines only, chemistry textbook style, show repeating unit if polymer.`;
          
          console.log(`Generating structure for: ${material.type} (${material.chemicalFormula})`);
          
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

          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error(`Image generation failed for ${material.type}:`, imageResponse.status, errorText);
            return {
              ...material,
              chemicalStructureImage: null
            };
          }

          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (imageUrl) {
            console.log(`Successfully generated image for ${material.type}`);
          } else {
            console.warn(`No image URL returned for ${material.type}`);
          }
          
          return {
            ...material,
            chemicalStructureImage: imageUrl || null
          };
        } catch (error) {
          console.error(`Error generating structure image for ${material.type}:`, error);
          return {
            ...material,
            chemicalStructureImage: null
          };
        }
      })
    );

    console.log(`Analysis complete. Generated ${materialsWithImages.filter(m => m.chemicalStructureImage).length}/${materialsWithImages.length} structure images`);

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
