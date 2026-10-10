import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'McCabe-Thiele Distillation Simulator | AI Co-Pilot & SCADA';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0d14',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          color: '#f8fafc',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(10, 13, 20, 0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(10, 13, 20, 0) 70%)',
          }}
        />

        {/* Top Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '9999px',
              padding: '8px 20px',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#10b981', letterSpacing: '2px' }}>
              SCADA PROCESS SUITE
            </span>
            <span style={{ color: '#4b5563' }}>•</span>
            <span style={{ fontSize: '15px', color: '#9ca3af' }}>Ethanol-Water Continuous Fractionation</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#312e81',
              border: '1px solid #6366f1',
              borderRadius: '10px',
              padding: '8px 18px',
              color: '#c7d2fe',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            ⚡ AI Co-Pilot Online
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>McCabe-Thiele</span>
            <span style={{ color: '#818cf8' }}>Distillation Simulator</span>
          </div>

          <p style={{ fontSize: '22px', color: '#94a3b8', maxWidth: '850px', lineHeight: 1.4 }}>
            Rigorous thermodynamic binary separation solver with Perry&apos;s Handbook empirical VLE data, dynamic SVG column schematic, and autonomous chemical engineering agent.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid #1f2937',
              borderRadius: '14px',
              padding: '16px 20px',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700, letterSpacing: '1px' }}>VLE EQUILIBRIUM</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6' }}>Perry&apos;s Handbook</span>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Atmospheric 1 atm with Azeotrope Limit (0.8943)</span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid #1f2937',
              borderRadius: '14px',
              padding: '16px 20px',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, letterSpacing: '1px' }}>DIGITAL TWIN</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6' }}>Dynamic SVG Tower</span>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Real-time hydraulic trays & nozzle feed mapping</span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid #1f2937',
              borderRadius: '14px',
              padding: '16px 20px',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700, letterSpacing: '1px' }}>INTELLIGENT AGENT</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6' }}>LLM Function Calling</span>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Automated reflux optimization & HAZOP auditing</span>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #1f2937',
            paddingTop: '20px',
            fontSize: '14px',
            color: '#64748b',
          }}
        >
          <span>github.com/Praditya27-stack/mccabe-copilot</span>
          <span>Next.js 15 • React 19 • TypeScript • Tailwind CSS</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
