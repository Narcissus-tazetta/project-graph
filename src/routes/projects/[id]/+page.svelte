<script lang="ts">
	import Chart from '#lib/Chart.svelte';
	import { fmt, fmtDateTime, fmtDelta } from '#lib/format.ts';
	import { graph, pointsFor, toValues } from '#lib/graphMode.svelte.ts';
	import { PERIOD_KEYS } from '#lib/periods.ts';
	import { SOURCE_LABELS, SOURCES } from '#lib/types.ts';
	import { resolve } from '$app/paths';

	let { data } = $props();
	const p = $derived(data.project);

	const meta = $derived(
		[
			`${fmt(p.total)} downloads`,
			p.firstRecordedAt && `recording since ${p.firstRecordedAt.slice(0, 10)}`,
			p.updatedAt && `updated ${fmtDateTime(p.updatedAt)}`
		]
			.filter(Boolean)
			.join(' · ')
	);

	const points = $derived(pointsFor(p.daily, graph.mode));
	const days = $derived(points.map((d) => d.day));
	const series = $derived([{ label: p.name, color: '#4c8dff', values: toValues(points) }]);
</script>

<a class="back" href={resolve('/')}>← All projects</a>

<p class="label">Project</p>
<h1>{p.name}</h1>
<p class="sub num">{meta}</p>

<div class="stats">
	{#each PERIOD_KEYS as k (k)}
		<div>
			<div class="big num">{fmtDelta(p.deltas[k])}</div>
			<div class="cap">last {k}</div>
		</div>
	{/each}
</div>

<p class="label sec">Sources</p>
<div class="cards">
	{#each SOURCES as s (s)}
		{#if p.sources[s] !== undefined}
			<a class="card" href={p.links[s]}>
				<div class="cap">{SOURCE_LABELS[s]}</div>
				<div class="big num">{fmt(p.sources[s])}</div>
			</a>
		{/if}
	{/each}
</div>

<p class="label sec">{graph.mode === 'total' ? 'Total over time' : 'Daily increase'}</p>
{#if days.length >= 2}
	<Chart {series} {days} mode="line" />
{:else}
	<p class="empty">
		The chart appears once there are snapshots from {graph.mode === 'total' ? 'two' : 'three'} different days.
	</p>
{/if}

<style>
	.back {
		display: inline-block;
		color: var(--muted);
		font-size: 14px;
		margin-bottom: 32px;
	}
	h1 {
		font-size: clamp(36px, 6vw, 56px);
	}
	.sub {
		color: var(--muted);
		margin: 8px 0 32px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}
	.stats > div {
		padding: 24px 0 24px 24px;
		border-left: 1px solid var(--line);
	}
	.stats > div:first-child {
		border-left: 0;
		padding-left: 0;
	}
	.big {
		font-size: clamp(24px, 4vw, 40px);
		font-weight: 600;
		letter-spacing: -0.03em;
	}
	.cap {
		color: var(--muted);
		font-size: 14px;
	}
	.sec {
		margin-top: 56px;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}
	.card {
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 20px;
	}
	.card:hover {
		border-color: var(--accent);
	}
	.empty {
		color: var(--muted);
		border: 1px dashed var(--line);
		border-radius: 12px;
		padding: 32px;
		text-align: center;
	}
</style>
