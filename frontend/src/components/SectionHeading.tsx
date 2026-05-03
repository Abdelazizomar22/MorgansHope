// Shared section heading style
export const SectionHeading = ({ text, subText }: { text: string; subText: string }) => (
	<div style={{ textAlign: 'center', marginBottom: subText ? 44 : 40 }}>
		<h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px', letterSpacing: -0.4 }}>
			{text}
		</h2>
		{subText && <p style={{ color: 'var(--text-muted)', fontSize: 14.5, margin: 0 }}>{subText}</p>}
	</div>
);