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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
</svg>
