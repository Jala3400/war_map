<script lang="ts">
    let { size = 24, class: className = "" }: { size?: number; class?: string } = $props();
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={className}
>
    <circle cx="12" cy="5" r="3"></circle>
    <circle cx="12" cy="19" r="3"></circle>
    <circle cx="5" cy="12" r="3"></circle>
    <circle cx="19" cy="12" r="3"></circle>
</svg>
