<script lang="ts">
	import Chart, { type Series } from '#lib/Chart.svelte';
	import { COLORS, fmt, fmtDateTime, fmtDelta } from '#lib/format.ts';
	import { SOURCE_LABELS, SOURCES } from '#lib/types.ts';
	import { resolve } from '$app/paths';

	let { data } = $props();

	type Sort = 'all' | '24h' | '7d' | '30d';
	const SORTS: Sort[] = ['all', '24h', '7d', '30d'];
	let sort = $state<Sort>('all');

	const grandTotal = $derived(data.projects.reduce((a, p) => a + p.total, 0));

	const meta = $derived(
		[`${data.projects.length} projects`, data.updatedAt && `updated ${fmtDateTime(data.updatedAt)}`]
			.filter(Boolean)
			.join(' · ')
	);

	const ranked = $derived(
		[...data.projects].sort((a, b) =>
			sort === 'all' ? b.total - a.total : (b.deltas[sort] ?? -1) - (a.deltas[sort] ?? -1)
		)
	);

	const days = $derived([...new Set(data.projects.flatMap((p) => p.daily.map((d) => d.day)))].sort());
	const series = $derived<Series[]>(
		data.projects.map((p, i) => ({
			label: p.name,
			color: COLORS[i % COLORS.length],
			values: Object.fromEntries(p.daily.map((d) => [d.day, d.total]))
		}))
	);
</script>

<p class="label">Overview</p>
<h1 class="num">{fmt(grandTotal)} downloads</h1>
<p class="sub">{meta}</p>

<section>
	{#if days.length >= 2}
		<Chart {series} {days} mode="line" />
	{:else}
		<p class="empty">The chart appears once there are snapshots from two different days.</p>
	{/if}
</section>

<p class="label rank-label">Ranking</p>
<div class="tabs" role="tablist">
	{#each SORTS as s (s)}
		<button role="tab" aria-selected={sort === s} class:on={sort === s} onclick={() => (sort = s)}>
			{s === 'all' ? 'Total' : s}
		</button>
	{/each}
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
					{#if sort === 'all'}{fmt(p.total)}{:else}{fmtDelta(p.deltas[sort])}{/if}
				</span>
			</a>
		</li>
	{/each}
</ol>
{#if sort !== 'all'}
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
	.tabs {
		display: flex;
		gap: 4px;
		margin-bottom: 16px;
	}
	.tabs button {
		background: none;
		border: 1px solid var(--line);
		color: var(--muted);
		border-radius: 8px;
		padding: 4px 12px;
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}
	.tabs button.on {
		color: var(--fg);
		background: var(--card);
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
	.note {
		color: var(--muted);
		font-size: 13px;
	}
</style>
