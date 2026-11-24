<script lang="ts">
	import Chart, { type Series } from '#lib/Chart.svelte';
	import Select from '#lib/Select.svelte';
	import { COLORS, fmt, fmtDateTime, fmtDelta } from '#lib/format.ts';
	import { graph, pointsFor, toValues } from '#lib/graphMode.svelte.ts';
	import { SOURCE_LABELS, SOURCES } from '#lib/types.ts';
	import { resolve } from '$app/paths';

	let { data } = $props();

	type Sort = 'all' | '24h' | '7d' | '30d' | 'name' | 'recent';
	const SORTS: { key: Sort; label: string }[] = [
		{ key: 'all', label: 'Total downloads' },
		{ key: '24h', label: 'Growth · 24h' },
		{ key: '7d', label: 'Growth · 7d' },
		{ key: '30d', label: 'Growth · 30d' },
		{ key: 'name', label: 'Name (A–Z)' },
		{ key: 'recent', label: 'Recently updated' }
	];
	let sort = $state<Sort>('all');
	const isGrowth = (s: Sort): s is '24h' | '7d' | '30d' => s === '24h' || s === '7d' || s === '30d';

	const grandTotal = $derived(data.projects.reduce((a, p) => a + p.total, 0));

	const meta = $derived(
		[`${data.projects.length} projects`, data.updatedAt && `updated ${fmtDateTime(data.updatedAt)}`]
			.filter(Boolean)
			.join(' · ')
	);

	const ranked = $derived(
		[...data.projects].sort((a, b) => {
			if (sort === 'name') return a.name.localeCompare(b.name, 'en');
			if (sort === 'recent') return (b.changedAt ?? '').localeCompare(a.changedAt ?? '') || b.total - a.total;
			if (isGrowth(sort)) return (b.deltas[sort] ?? -1) - (a.deltas[sort] ?? -1);
			return b.total - a.total;
		})
	);

	const pointsOf = (p: (typeof data.projects)[number]) => pointsFor(p.daily, graph.mode);
	const days = $derived([...new Set(data.projects.flatMap((p) => pointsOf(p).map((d) => d.day)))].sort());
	const series = $derived<Series[]>(
		data.projects.map((p, i) => ({
			label: p.name,
			color: COLORS[i % COLORS.length],
			values: toValues(pointsOf(p))
		}))
	);
	const colorOf = (id: string) => COLORS[data.projects.findIndex((p) => p.id === id) % COLORS.length];
	const need = $derived(graph.mode === 'total' ? 'two' : 'three');
</script>

<p class="label">Overview</p>
<h1 class="num">{fmt(grandTotal)} downloads</h1>
<p class="sub">{meta}</p>

<section>
	{#if days.length >= 2}
		<Chart {series} {days} mode="line" />
	{:else}
		<p class="empty">The chart appears once there are snapshots from {need} different days.</p>
	{/if}
</section>

<p class="label rank-label">Ranking</p>
<div class="sort">
	<span class="sort-label">Sort by</span>
	<Select options={SORTS} bind:value={sort} label="Sort by" />
</div>

<ol class="rank">
	{#each ranked as p, i (p.id)}
		<li>
			<a href={resolve('/projects/[id]', { id: p.id })}>
				<span class="pos num">{i + 1}</span>
				<span class="name">{p.name}</span>
				<span class="src">
					{#each SOURCES as s (s)}
						{#if p.sources[s] !== undefined}<span>{SOURCE_LABELS[s]} {fmt(p.sources[s])}</span>{/if}
					{/each}
				</span>
				<span class="val num">
					{#if isGrowth(sort)}{fmtDelta(p.deltas[sort])}{:else}{fmt(p.total)}{/if}
				</span>
				{#if pointsOf(p).length >= 2}
					<span class="spark">
						<Chart
							compact
							mode="line"
							days={pointsOf(p).map((d) => d.day)}
							series={[{ label: p.name, color: colorOf(p.id), values: toValues(pointsOf(p)) }]}
						/>
					</span>
				{/if}
			</a>
		</li>
	{/each}
</ol>
{#if isGrowth(sort)}
	<p class="note">— means there is not yet a full {sort} of history for that project.</p>
{/if}

<style>
	h1 {
		font-size: clamp(36px, 6vw, 56px);
	}
	.sub {
		color: var(--muted);
		margin: 8px 0 32px;
	}
	.empty {
		color: var(--muted);
		border: 1px dashed var(--line);
		border-radius: 12px;
		padding: 32px;
		text-align: center;
	}
	.rank-label {
		margin-top: 56px;
	}
	.sort {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
		font-size: 14px;
		color: var(--muted);
	}
	.rank {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--line);
	}
	.rank li {
		border-bottom: 1px solid var(--line);
	}
	.rank a {
		display: grid;
		grid-template-columns: 32px 1fr auto;
		gap: 4px 12px;
		align-items: baseline;
		padding: 16px 4px;
	}
	.rank a:hover {
		background: var(--card);
	}
	.pos {
		color: var(--muted);
	}
	.name {
		font-weight: 600;
		font-size: 18px;
	}
	.val {
		font-size: 20px;
		font-weight: 600;
		grid-row: 1;
		grid-column: 3;
	}
	.src {
		grid-column: 2;
		display: flex;
		flex-wrap: wrap;
		gap: 0 16px;
		color: var(--muted);
		font-size: 13px;
	}
	.spark {
		grid-column: 2 / 4;
		margin-top: 8px;
	}
	.note {
		color: var(--muted);
		font-size: 13px;
	}
</style>
