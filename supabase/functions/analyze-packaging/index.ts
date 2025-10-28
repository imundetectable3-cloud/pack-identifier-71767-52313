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

    const systemPrompt = `You are an expert food packaging material analyst with specialized training in material identification. Your task is to CAREFULLY examine the packaging image and identify materials with EXTREME ACCURACY.

CRITICAL IDENTIFICATION GUIDELINES:

1. GLASS vs PLASTIC Distinction (MOST IMPORTANT):
   - GLASS characteristics: High transparency with light refraction, surface reflections show crisp edges, frosted glass has uniform matte finish, heavier appearance, no deformation marks
   - PLASTIC (PET/HDPE) characteristics: Slight haziness even when clear, injection molding seam lines visible, base has mold marks, lighter appearance, may show stress marks
   - If frosted/textured surface → Likely FROSTED GLASS, NOT plastic
   - If bottle shows mold seams at base → Plastic
   - If surface has uniform sandblasted texture → FROSTED GLASS

2. METAL Identification:
   - ALUMINUM: Lightweight, dull metallic sheen, can be embossed easily, no rust
   - TIN-PLATED STEEL: Heavier, shinier than aluminum, seam visible on can body
   - TINPLATE: Rigid, specific thickness, used for food cans

3. PAPER/CARDBOARD:
   - Visible fiber texture under close inspection
   - May show layered structure on edges
   - Kraft paper: Brown, fibrous
   - Coated paperboard: Smooth surface with coating

4. Multi-layer/Composite Materials:
   - Look for multiple material layers
   - Common: PE/AL/PET laminates, paper with plastic coating

ANALYSIS PROTOCOL:
- Examine material texture, surface finish, transparency, weight appearance
- Look for manufacturing marks (seams, molds, folds)
- Consider typical usage patterns for the product type
- When uncertain between glass and plastic, default to GLASS if frosted/sandblasted texture present

OUTPUT REQUIREMENTS:
- Be 100% certain before identifying
- Include confidence indicators in your description
- Provide 4-6 detailed regulatory points per material
- Use precise technical specifications

JSON FORMAT:
{
  "materials": [
    {
      "type": "Exact material with form (e.g., 'Frosted glass bottle', 'Clear PET bottle', 'HDPE container')",
      "chemicalFormula": "Accurate chemical formula",
      "fssaiLimits": [
        "Overall migration limit: [specific value] mg/kg",
        "Heavy metals (Pb, Cd, Cr, Hg): [values] ppm",
        "Specific migration of [substance]: [value]",
        "Additional FSSAI requirements"
      ],
      "bisLimits": [
        "BIS Standard: IS [code]:YYYY",
        "Density/specific gravity: [value] g/cm³",
        "Tensile/compressive strength: [value] MPa",
        "Thickness/dimensional tolerance: [value]",
        "Additional technical parameters"
      ],
      "thickness": "Precise value with unit (e.g., '2.5 mm' for glass, '25 microns' for film)",
      "gsm": "Value for paper only, 'N/A' for glass/plastic/metal",
      "foodApplications": [
        "Specific food product category",
        "Another specific application",
        "Third specific use case",
        "Fourth application if relevant"
      ]
    }
  ]
}

IMPORTANT: Take your time to analyze thoroughly. Accuracy is more important than speed.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
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
