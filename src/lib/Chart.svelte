<script lang="ts">
	import { fmt } from '#lib/format.ts';

	export interface Series {
		label: string;
		color: string;
		values: Record<string, number>;
	}

	let {
		series,
		days,
		mode,
		compact = false
	}: { series: Series[]; days: string[]; mode: 'line' | 'bar'; compact?: boolean } = $props();

	// compact は一覧の各行に置く軸なしの小グラフ。行全体がリンクなのでホバー操作は持たせない
	const W = 720;
	const H = $derived(compact ? 72 : 260);
	const PAD = $derived(compact ? { l: 4, r: 4, t: 6, b: 6 } : { l: 52, r: 12, t: 12, b: 26 });

	// 棒グラフは両端の棒が軸ラベルに被らないよう、帯の中央に置く
	const xs = $derived(
		days.map((_, i) => {
			const inner = W - PAD.l - PAD.r;
			if (mode === 'bar') return PAD.l + ((i + 0.5) * inner) / days.length;
			return days.length === 1 ? PAD.l + inner / 2 : PAD.l + (i * inner) / (days.length - 1);
		})
	);

	const yMax = $derived.by(() => {
		let m = 0;
		for (const s of series) for (const d of days) m = Math.max(m, s.values[d] ?? 0);
		return m === 0 ? 1 : m;
	});
	// 小グラフは0始まりだと累計の増加が潰れて傾向が読めないため、最小値〜最大値に合わせる
	const yMin = $derived.by(() => {
		if (!compact) return 0;
		let m = Infinity;
		for (const s of series) for (const d of days) m = Math.min(m, s.values[d] ?? Infinity);
		return m === Infinity ? 0 : m;
	});
	const y = (v: number) => {
		const span = yMax - yMin;
		const r = span === 0 ? 0.5 : (v - yMin) / span;
		return PAD.t + (1 - r) * (H - PAD.t - PAD.b);
	};

	const ticks = $derived([0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(yMax * r)));

	const path = (s: Series) =>
		days
			.flatMap((d, i) => (s.values[d] === undefined ? [] : [`${xs[i]},${y(s.values[d])}`]))
			.join(' ');

	let hover = $state<number | null>(null);

	function onMove(e: MouseEvent) {
		const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * W;
		let best = 0;
		for (let i = 1; i < xs.length; i++) {
			if (Math.abs(xs[i] - px) < Math.abs(xs[best] - px)) best = i;
		}
		hover = best;
	}
</script>

<div class="chart">
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<svg
		viewBox="0 0 {W} {H}"
		role="img"
		onmousemove={compact ? undefined : onMove}
		onmouseleave={() => (hover = null)}
	>
		{#if !compact}
			{#each ticks as tick (tick)}
				<line x1={PAD.l} x2={W - PAD.r} y1={y(tick)} y2={y(tick)} class="grid" />
				<text x={PAD.l - 8} y={y(tick) + 4} class="axis" text-anchor="end">{fmt(tick)}</text>
			{/each}
			<text x={PAD.l} y={H - 6} class="axis">{days[0]}</text>
			<text x={W - PAD.r} y={H - 6} class="axis" text-anchor="end">{days.at(-1)}</text>
		{/if}

		{#each series as s (s.label)}
			{#if mode === 'line'}
				<polyline points={path(s)} fill="none" stroke={s.color} stroke-width="2" stroke-linejoin="round" />
				{#each days as d, i (d)}
					{#if !compact && s.values[d] !== undefined && days.length <= 40}
						<circle cx={xs[i]} cy={y(s.values[d])} r="2.5" fill={s.color} />
					{/if}
				{/each}
			{:else}
				{#each days as d, i (d)}
					{#if s.values[d] !== undefined}
						{@const bw = Math.max(2, ((W - PAD.l - PAD.r) / days.length) * 0.6)}
						<rect x={xs[i] - bw / 2} y={y(s.values[d])} width={bw} height={y(0) - y(s.values[d])} fill={s.color} rx="2" />
					{/if}
				{/each}
			{/if}
		{/each}

		{#if hover !== null}
			<line x1={xs[hover]} x2={xs[hover]} y1={PAD.t} y2={H - PAD.b} class="cursor" />
		{/if}
	</svg>

	{#if hover !== null}
		<div class="tip" style:left="{(xs[hover] / W) * 100}%">
			<div class="tip-day">{days[hover]}</div>
			{#each series as s (s.label)}
				{#if s.values[days[hover]] !== undefined}
					<div><span class="dot" style:background={s.color}></span>{s.label} {fmt(s.values[days[hover]])}</div>
				{/if}
			{/each}
		</div>
	{/if}

	{#if !compact && series.length > 1}
		<ul class="legend">
			{#each series as s (s.label)}
				<li><span class="dot" style:background={s.color}></span>{s.label}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.chart {
		position: relative;
	}
	svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.grid {
		stroke: var(--line);
		stroke-width: 1;
	}
	.cursor {
		stroke: var(--muted);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}
	.axis {
		fill: var(--muted);
		font-size: 11px;
	}
	.tip {
		position: absolute;
		top: 8px;
		transform: translateX(-50%);
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 8px 10px;
		font-size: 12px;
		pointer-events: none;
		white-space: nowrap;
	}
	.tip-day {
		color: var(--muted);
		margin-bottom: 4px;
	}
	.dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin-right: 6px;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
		list-style: none;
		padding: 0;
		margin: 12px 0 0;
		font-size: 13px;
		color: var(--muted);
	}
</style>
