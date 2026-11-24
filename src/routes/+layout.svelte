<script lang="ts">
	import '../app.css';
	import Select from '#lib/Select.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { GRAPH_MODES, graph, restoreGraphMode, saveGraphMode } from '#lib/graphMode.svelte.ts';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	onMount(restoreGraphMode);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Downloads</title>
</svelte:head>

<header>
	<div class="bar">
		<a class="brand" href={resolve('/')}>Downloads</a>
		<div class="setting">
			<span class="setting-label">Graph</span>
			<Select
				options={GRAPH_MODES}
				bind:value={graph.mode}
				label="Graph"
				align="right"
				onchange={saveGraphMode}
			/>
		</div>
	</div>
</header>

<main>
	{@render children()}
</main>

<style>
	header {
		border-bottom: 1px solid var(--line);
	}
	.bar,
	main {
		max-width: 1040px;
		margin: 0 auto;
		padding: 0 20px;
	}
	.bar {
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.brand {
		font-weight: 600;
		font-size: 18px;
	}
	.setting {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: var(--muted);
	}
	@media (max-width: 480px) {
		.setting-label {
			display: none;
		}
	}
	main {
		padding-top: 48px;
		padding-bottom: 96px;
	}
</style>
