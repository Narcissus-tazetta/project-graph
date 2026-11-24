<script lang="ts" generics="K extends string">
	// ネイティブ <select> は macOS で OS 標準のポップアップが出て配色を変えられないため自前で描く
	let {
		options,
		value = $bindable(),
		label,
		align = 'left',
		onchange
	}: {
		options: readonly { key: K; label: string }[];
		value: K;
		label: string;
		align?: 'left' | 'right';
		onchange?: (value: K) => void;
	} = $props();

	let open = $state(false);
	let root = $state<HTMLDivElement>();
	let trigger = $state<HTMLButtonElement>();
	let items = $state<HTMLButtonElement[]>([]);

	const current = $derived(options.find((o) => o.key === value)?.label ?? '');

	async function show() {
		open = true;
		await Promise.resolve();
		items[options.findIndex((o) => o.key === value)]?.focus();
	}

	function close(refocus: boolean) {
		open = false;
		if (refocus) trigger?.focus();
	}

	function pick(key: K) {
		const changed = key !== value;
		value = key;
		close(true);
		if (changed) onchange?.(key);
	}

	function move(from: number, step: number) {
		items[(from + step + options.length) % options.length]?.focus();
	}

	function onTriggerKey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			show();
		}
	}

	function onItemKey(e: KeyboardEvent, i: number) {
		if (e.key === 'ArrowDown') move(i, 1);
		else if (e.key === 'ArrowUp') move(i, -1);
		else if (e.key === 'Home') move(-1, 1);
		else if (e.key === 'End') move(options.length, -1);
		else if (e.key === 'Escape') close(true);
		else if (e.key === 'Tab') close(false);
		else return;
		if (e.key !== 'Tab') e.preventDefault();
	}

	function onWindowPointer(e: PointerEvent) {
		if (open && root && !root.contains(e.target as Node)) close(false);
	}
</script>

<svelte:window onpointerdown={onWindowPointer} />

<div class="select" bind:this={root}>
	<button
		type="button"
		class="trigger"
		bind:this={trigger}
		aria-label={label}
		aria-haspopup="listbox"
		aria-expanded={open}
		onclick={() => (open ? close(false) : show())}
		onkeydown={onTriggerKey}
	>
		{current}
		<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
			<path d="M1 1l4 4 4-4" />
		</svg>
	</button>

	{#if open}
		<div class="menu {align}" role="listbox" aria-label={label}>
			{#each options as o, i (o.key)}
				<button
					type="button"
					role="option"
					aria-selected={o.key === value}
					class:on={o.key === value}
					bind:this={items[i]}
					onclick={() => pick(o.key)}
					onkeydown={(e) => onItemKey(e, i)}
				>
					<span class="check">{o.key === value ? '✓' : ''}</span>{o.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.select {
		position: relative;
		display: inline-block;
	}
	.trigger {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: transparent;
		color: var(--fg);
		border: 0;
		border-radius: 8px;
		padding: 7px 12px;
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}
	.trigger svg {
		color: var(--muted);
	}
	.trigger:hover {
		background: var(--line);
	}
	.trigger:focus-visible,
	.menu button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.menu {
		position: absolute;
		top: calc(100% + 6px);
		z-index: 10;
		min-width: 100%;
		background: var(--card);
		border-radius: 10px;
		padding: 4px;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
	}
	.menu.left {
		left: 0;
	}
	.menu.right {
		right: 0;
	}
	.menu button {
		display: flex;
		align-items: center;
		width: 100%;
		background: none;
		border: 0;
		border-radius: 6px;
		color: var(--fg);
		padding: 6px 12px 6px 6px;
		font: inherit;
		font-size: 14px;
		text-align: left;
		white-space: nowrap;
		cursor: pointer;
	}
	.menu button:hover,
	.menu button:focus-visible {
		background: var(--line);
	}
	.menu button.on {
		color: var(--accent);
	}
	.check {
		display: inline-block;
		width: 20px;
		font-size: 12px;
	}
</style>
