<script lang="ts">
  import { get } from '$lib/api';
  import { onMount } from 'svelte';
  let ukms: Array<{ id: string; name: string; slug: string; current_slot: number; max_slot: number; regist_fee: number }>=[];
  let error: string | null = null;
  onMount(async () => {
    try { ukms = await get('/api/user/ukms'); } catch (e: any) { error = e.message; }
  });
</script>

<h1>UKM</h1>
{#if error}
  <p>{error}</p>
{:else}
  <ul>
    {#each ukms as u}
      <li>{u.name} ({u.current_slot}/{u.max_slot})</li>
    {/each}
  </ul>
{/if}

<<<<<<< HEAD
=======
    // if (logoRef && titleRef && introRef) {
    //   const tl = gsap.timeline({
    //     scrollTrigger: {
    //       trigger: part1Ref,
    //       start: "top top",
    //       end: "bottom top", // scroll distance until finished
    //       scrub: true,
    //       pin: true, // keep it in place while animating
    //     },
    //   });

    //   tl.to(logoRef, {
    //     scale: 0.5, // shrink
    //     y: "-40vh", // move up
    //     duration: 1,
    //     ease: "power2.out",
    //   });

    //   tl.to(
    //     titleRef,
    //     {
    //       scale: 0.8,
    //       y: "-38vh", // just under logo
    //       duration: 1,
    //       ease: "power2.out",
    //     },
    //     "<" // sync with logo animation
    //   );

    //   // Show subtitle after logo+title are done
    //   tl.from(introRef, {
    //     opacity: 0,
    //     y: 50,
    //     duration: 1,
    //     ease: "power2.out",
    //   });
    // }

    // horizontal scroll (sudah oke)
    if (framesRowRef && framesWrapperRef) {
      const totalWidth = framesRowRef.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollDistance = totalWidth - viewportWidth;

      gsap.to(framesRowRef, {
        x: -scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: framesWrapperRef,
          start: "top top",
          end: () => `+=${scrollDistance}`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Animate card rotations
      if (card1Ref) {
        gsap.to(card1Ref, {
          rotate: 70, // from 45deg to 60deg
          ease: "none",
          scrollTrigger: {
            trigger: framesWrapperRef,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            scrub: true,
          },
        });
      }
      if (card2Ref) {
        gsap.to(card2Ref, {
          rotate: 30, // from 45deg to 30deg
          ease: "none",
          scrollTrigger: {
            trigger: framesWrapperRef,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            scrub: true,
          },
        });
      }
      if (card3Ref) {
        gsap.to(card3Ref, {
          rotate: -10, // from 0deg to -10deg
          ease: "none",
          scrollTrigger: {
            trigger: framesWrapperRef,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            scrub: true,
          },
        });
      }
    }

    if (posterOverlay) {
      gsap.to(posterOverlay, {
        opacity: 0.5,
        pointerEvents: "auto",
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: posterOverlay,   
          start: "95% bottom",       
          toggleActions: "play none none reverse", 
        },
      });
    }
});
</script> 

<div class="fixed top-0 left-0 w-full h-[100lvh] bg-[url('/images/bg-wood.png')] bg-cover bg-center bg-no-repeat -z-10"></div>
<Background ref={(el) => (containerRef = el)} className="" >
  <div class="absolute inset-0 bg-black opacity-0" bind:this={overlayRef}></div>

  <div class="relative flex flex-col items-center justify-center h-full p-8" bind:this={part1Ref}>
    <Logo
      src="/images/ukm/dekorasi/logo.png"
      alt="UKM Dekorasi Logo"
      ref={(el) => (logoRef = el)}
    />
    <div class="w-[80%]">
      <Title text="UKM DEKORASI" ref={(el) => (titleRef = el)} />
    </div>
  </div>

  <!-- second part -->
  <div class="flex items-center justify-center overflow-hidden p-8"
    bind:this={part2Ref}>
    <div 
    class="bg-gradient-to-r from-[#1a1a1a]/70 via-[#2a2a2a]/60 to-[#1a1a1a]/70 
          backdrop-blur-lg 
          border border-white/10 
          shadow-lg 
          rounded-2xl 
          p-4
          mt-2
          max-w-3xl 
          mx-auto"
          bind:this={introRef}
      >
    <Subtitle
      text='UKM Dekorasi hadir sebagai wadah bagi mahasiswa untuk mengekspresikan nilai seni melalui kerajinan tangan, khususnya bagi mereka yang memiliki ketertarikan di bidang kesenian. Dengan mengusung tema "The Silent Symphony: Crafting Stories Without Words," UKM ini memfasilitasi anggotanya untuk menciptakan kerajinan tangan yang tidak hanya estetis, tetapi juga mengandung makna. Keikutsertaan dalam UKM Dekorasi memberikan kesempatan untuk mengasah kreativitas, mengekspresikan diri, dan berkolaborasi dalam kelompok kecil. Seluruh bahan akan disediakan oleh pihak UKM, dan setiap peserta akan mendapatkan bimbingan langsung dari fungsionaris. Setiap karya yang telah selesai dapat dibawa pulang oleh para peserta.'
      className="text-justify text-[#FFF4E9]"
    />
  <!-- ref={(el) => (introRef = el)}-->
    </div>
  </div>

</Background>

<Background ref={(el) => (framesWrapperRef = el)} className="!h-[200vh]">
  <div class="flex justify-center items-start relative gap-8 w-full h-[300vh]" bind:this={framesRowRef}>
    <div data-aos="fade-down">
      <Title text="Our Memories"></Title>
    </div>
    <ImageFrame ref={(el) => (frame1Ref = el)}
      src="/images/ukm/dekorasi/1.jpg" alt="Dekorasi 1" className="w-[270px] -rotate-8 top-[5%] left-0 z-10" />
    <ImageFrame ref={(el) => (frame2Ref = el)}
      src="/images/ukm/dekorasi/2.jpg" alt="Dekorasi 2" className="w-[270px] rotate-12 top-[40%] left-[30%] z-12" />
    <ImageFrame ref={(el) => (frame3Ref = el)}
      src="/images/ukm/dekorasi/3.jpg" alt="Dekorasi 3" className="w-[270px] rotate-8 top-[17%] right-[5%] z-10" />
    <ImageFrame ref={(el) => (frame4Ref = el)}
      src="/images/ukm/dekorasi/4.jpg" alt="Dekorasi 4" className="w-[270px] -rotate-12 top-[28%] left-[10%] z-[11]" />
    <!-- <ImageFrame ref={(el) => (frame5Ref = el)}
      src="/images/ukm/dekorasi/5.jpg" alt="Dekorasi 5" className="w-[260px] bottom-[35%] -rotate-10 right-[25%]" /> -->

    <!-- decoration -->
     <!-- <img bind:this={card1Ref} class="w-[400px] rotate-45 absolute -bottom-10 -left-5" src="images/single-card.png" alt=""> -->
     <img class="w-[350px] absolute top-[50%] right-0 z-[100]" src="images/mask.png" alt="">
     <!-- <img bind:this={card3Ref} class="w-[400px] absolute bottom-0 right-0" src="images/multi-card.png" alt=""> -->
  </div>
</Background>

<Background className="flex flex-col items-center justify-center">
  <div data-aos="fade-down">
    <Title text="Title"></Title>
  </div>

  <div data-aos="fade-up" data-aos-offset="300" data-aos-duration="500">
    <Video src="/images/ukm/dekorasi/video.mov" className="w-full p-8" controls={true} />
  </div>
</Background>

<Background className="flex flex-col items-center justify-center p-8 gap-4">
  <div class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,black_100%)] z-[-1] opacity-0" bind:this={posterOverlay}></div>
  <div data-aos="fade-down">
    <Title text="Title"></Title>
  </div>
  <img data-aos="fade-up" data-aos-offset="500" src="images/ukm/dekorasi/poster.png" alt="">
</Background>
>>>>>>> eea415a (tidy up the code)
