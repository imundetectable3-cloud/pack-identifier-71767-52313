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

    const systemPrompt = `You are an expert packaging material analyst. Analyze the image and identify all packaging materials visible. 

CRITICAL REQUIREMENTS:
1. For PLASTIC materials, you MUST identify the specific resin identification code (1-7):
   - #1 PETE/PET (Polyethylene Terephthalate)
   - #2 HDPE (High-Density Polyethylene)
   - #3 PVC (Polyvinyl Chloride)
   - #4 LDPE (Low-Density Polyethylene)
   - #5 PP (Polypropylene)
   - #6 PS (Polystyrene)
   - #7 OTHER (all other plastics)

2. For MULTILAYER packaging, you MUST identify the layers from outside to inside (e.g., "Plastic/Aluminum/Paper" or "LDPE/Aluminum foil/Paper/LDPE")

For each material detected, provide:
- Material type (plastic, cardboard, glass, metal, paper, multilayer, biodegradable, etc.)
- Specific classification (e.g., "PET plastic", "corrugated cardboard", "aluminum can")
- plasticResinCode: number (1-7) or null if not plastic
- layerComposition: string or null (for multilayer only, list layers from outside to inside)
- Environmental impact (recyclability, biodegradability)
- Common uses for this type of packaging
- Sustainability rating (1-5, where 5 is most sustainable)

Return your analysis in JSON format with this structure:
{
  "materials": [
    {
      "type": "string",
      "classification": "string",
      "plasticResinCode": number | null,
      "layerComposition": string | null,
      "recyclability": "string",
      "biodegradable": boolean,
      "commonUses": "string",
      "sustainabilityRating": number,
      "environmentalImpact": "string"
    }
  ],
  "overallAnalysis": "string"
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

    return new Response(
      JSON.stringify(analysis),
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
