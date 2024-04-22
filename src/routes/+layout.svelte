<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });


</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Weazic</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://www.linkedin.com/in/maxpenso/"
					target="_blank"
					rel="noreferrer"
				>
					LinkedIn
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/jolehuit"
					target="_blank"
					rel="noreferrer"
				>

					Github
				</a>

				<LightSwitch></LightSwitch>

				</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<slot />
</AppShell>
