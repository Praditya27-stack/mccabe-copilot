import { NextResponse } from 'next/server';

const ROUTER_BASE_URL = process.env.ROUTER_BASE_URL || 'https://rw3luvx.abc-tunnel.us/v1';
const ROUTER_API_KEY = process.env.ROUTER_API_KEY || 'none';
const ROUTER_MODEL = process.env.ROUTER_MODEL || 'ag/gemini-3.8-flash-high';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, state } = body;

    const systemPrompt = `You are an expert Industrial Chemical Engineer Co-Pilot integrated into a McCabe-Thiele distillation simulator. 
Your objective is to assist operators in optimizing an Ethanol-Water continuous fractionation column operating at atmospheric pressure (1 atm).
    
CURRENT SIMULATION STATE SNAPSHOT:
- Feed Mole Fraction (zF): ${state?.inputs?.zF ?? 0.4}
- Distillate Mole Fraction (xD): ${state?.inputs?.xD ?? 0.85}
- Bottoms Mole Fraction (xB): ${state?.inputs?.xB ?? 0.05}
- Feed Quality (q): ${state?.inputs?.q ?? 1.0}
- Active Reflux Ratio (R): ${state?.inputs?.R ?? 2.5}
- Min Reflux Ratio (R_min): ${state?.results?.rMin ?? 1.2}
- Total Stages (N): ${state?.results?.totalStages ?? 15}
- Feed Stage: ${state?.results?.feedStage ?? 8}

Analyze the user's request, provide professional engineering insights, and if the user asks you to adjust parameters, optimize the column, or run a safety check, YOU MUST CALL THE RELEVANT TOOL(S). Do not refuse tool execution unless it breaks thermodynamic limits (like xD >= 0.8943).`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const tools = [
      {
        type: 'function',
        function: {
          name: 'set_simulation_parameters',
          description: 'Updates distillation column parameters on the dashboard.',
          parameters: {
            type: 'object',
            properties: {
              zF: { type: 'number', description: 'Feed mole fraction (0.01 - 0.88)' },
              xD: { type: 'number', description: 'Distillate mole fraction (must be > zF and < 0.894)' },
              xB: { type: 'number', description: 'Bottoms mole fraction (must be < zF)' },
              q: { type: 'number', description: 'Feed thermal condition (1 = saturated liquid, 0 = sat vapor)' },
              R: { type: 'number', description: 'Reflux ratio (must be > R_min)' },
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'run_optimization',
          description: 'Calculates the optimal sweet spot for reflux ratio (around 1.35x R_min) to balance energy load and stage count.'
        }
      },
      {
        type: 'function',
        function: {
          name: 'generate_hazop_report',
          description: 'Evaluates the column for operational risks, flooding, weeping, azeotrope proximity, and pinch risks.'
        }
      }
    ];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ROUTER_API_KEY}`,
    };

    // 10-second timeout controller to prevent hanging if tunnel is down/restarting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${ROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: ROUTER_MODEL,
          messages: apiMessages,
          tools: tools,
          stream: false,
          tool_choice: 'auto'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errDetails = await response.text();
        try {
          const parsed = JSON.parse(errDetails);
          errDetails = parsed.error || errDetails;
        } catch (e) {}
        
        // If tunnel returned 502, 503, 504, or 401/403, trigger graceful fallback
        return NextResponse.json({
          isOffline: true,
          content: `⚠️ **Mode Standalone Aktif** (Koneksi ke Remote Tunnel Terputus: ${response.status})\n\nRemote AI engine saat ini sedang offline atau sedang pemeliharaan. Namun, **seluruh kalkulasi termodinamika lokal tetap berjalan 100%**. Anda dapat menggunakan tombol *Quick Prompts* di bawah untuk menjalankan optimasi energi dan audit HAZOP secara deterministik.`
        });
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message;
      return NextResponse.json(assistantMessage);

    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.warn('Remote LLM Tunnel unreachable, activating Standalone Fallback mode:', fetchErr.message);

      // Graceful offline fallback message
      return NextResponse.json({
        isOffline: true,
        content: `⚡ **Mode Standalone Heuristik Aktif**\n\nKoneksi ke remote AI engine (VPS tunnel) saat ini sedang tidak dapat dijangkau (*offline / standby*). \n\nJangan khawatir, **simulator termodinamika McCabe-Thiele dan seluruh perhitungan fisik tetap berfungsi 100%**. Anda dapat menggunakan tombol **Quick Prompts** di bawah (*Optimasi Energi*, *Audit HAZOP*, atau *Preset Industri*) untuk menjalankan otomasi proses secara lokal tanpa gangguan.`
      });
    }

  } catch (error: any) {
    console.error('General API Handler Error:', error);
    return NextResponse.json({
      isOffline: true,
      content: 'Terjadi kendala jaringan internal. Sistem beroperasi dalam mode lokal deterministik.'
    });
  }
}
