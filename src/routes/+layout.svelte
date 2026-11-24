<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Downloads</title>
</svelte:head>

<header>
	<div class="bar">
		<a class="brand" href={resolve('/')}>Downloads</a>
		<a class="nav" href="https://github.com/Narcissus-tazetta/project-graph">GitHub</a>
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
	.nav {
		color: var(--muted);
	}
	.nav:hover {
		color: var(--fg);
	}
	main {
		padding-top: 48px;
		padding-bottom: 96px;
	}
</style>
