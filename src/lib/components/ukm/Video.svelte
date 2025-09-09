<script>
  export let videoSrc = "";
  export let className = "";
  export let ref = null;
  let frame;
  $: ref && ref(frame);
</script>

<div
  data-aos="fade-up"
  data-aos-delay="200"
  data-aos-duration="500"
  class={`relative flex items-center justify-center ${className}`}
  ref={frame}
>
  <!-- Container ensures frame and video stack properly -->
  <div class="relative aspect-[9/16] ">
    <!-- Frame -->
    <img
      src="/images/video-frame.png"
      alt="Video Frame"
      class="absolute inset-0 w-full h-full z-10 pointer-events-none"
    />

    <!-- Video -->
    {#if videoSrc.includes("drive.google.com")}
      <iframe
        src={videoSrc.replace("/view", "/preview")}
        class="w-[90%] mx-auto aspect-[9/16] translate-y-[6%] relative z-0"
        allow="autoplay; encrypted-media"
        allowfullscreen
        frameborder="0"
        title="Google Drive Video"
      ></iframe>
    {/if}
  </div>
</div>
