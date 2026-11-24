<script lang="ts">
	import '../app.css';
	import Select from '#lib/Select.svelte';
	import { GRAPH_MODES, graph, restoreGraphMode, saveGraphMode } from '#lib/graphMode.svelte.ts';
	import { asset, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	onMount(restoreGraphMode);
</script>

<svelte:head>
	<link rel="icon" href={asset('favicon.svg')} type="image/svg+xml" />
	<title>Downloads</title>
	<meta name="description" content="Download stats across projects" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Downloads" />
	<meta property="og:title" content="Downloads" />
	<meta property="og:description" content="Download stats across projects" />
	<meta property="og:image" content="https://stats.prason.dev/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
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
