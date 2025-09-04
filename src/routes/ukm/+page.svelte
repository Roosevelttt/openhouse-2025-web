<script lang="ts">
  import { get } from '$lib/api';
  import { onMount } from 'svelte';
  let ukms: Array<{ id: string; name: string; slug: string; current_slot: number; max_slot: number; regist_fee: number }>=[];
  let error: string | null = null;
  onMount(async () => {
    try { ukms = await get('/api/ukms'); } catch (e: any) { error = e.message; }
  });
</script>

<<<<<<< HEAD
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
=======
    if (overlayRef && logoRef && titleRef && introRef && containerRef) {
      // Intro overlay fade
      gsap.to(overlayRef, { opacity: 0.7, duration: 0 });
      gsap.to(overlayRef, { opacity: 0, duration: 1.2, delay: 0.5 });
      
      // Entrance animation
      gsap.from(logoRef, {
        x: -200,
        opacity: 0,
        duration: 1,
        delay: 1.2,
        ease: "power2.out",
      });
      gsap.from(titleRef, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 1.5,
        ease: "power2.out",
      });

      
      ScrollTrigger.matchMedia({
        // Mobile 
        "(max-width: 768px)": function () {
          const deltaY = window.innerHeight * 0.25 - (window.innerHeight / 2);
>>>>>>> c154f6e (fix: ukm page responsiveness)

          let tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef,
              start: "top top",
              end: "+=100",
              scrub: true,
              pin: true,
            },
          });

          tl.to(part1Ref, {
            y: deltaY,
            scale: 0.75,
          }).to(introRef, {
            maxHeight: 1000,
            duration: 1,
            y: deltaY,
            ease: "power2.out",
            onComplete: () => {
              if (introRef) {
                introRef.classList.remove("max-h-0", "overflow-hidden");
                introRef.classList.add("border", "border-white/10", "p-4");
              }
            },
            onReverseComplete: () => {
              if (introRef) {
                introRef.classList.add("max-h-0", "overflow-hidden");
                introRef.classList.remove("border", "border-white/10", "p-4");
              }
            },
          });
        },

        "(min-width: 769px)": function () {
          const deltaY = window.innerWidth * 0.5 - (window.innerWidth / 2);

          let tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef,
              start: "top top",
              end: "+=300", // longer scroll for desktop
              scrub: true,
              pin: true,
            },
          });

          tl.to(part1Ref, {
            x: deltaY,
            scale: 0.9,
            ease: "power2.out",
            duration: 1,
          }).to(introRef, {
            maxHeight: 1000,
            maxWidth: 1000,
            duration: 1,
            // x: "+=" + deltaY,
            ease: "power2.out",
            onStart: () => {
              if (introRef) {
                introRef.classList.remove("max-w-0", "overflow-hidden");
                introRef.classList.add("border", "border-white/10", "p-4");
              }
            },
            onReverseComplete: () => {
              if (introRef) {
                introRef.classList.add("max-w-0", "overflow-hidden");
                introRef.classList.remove("border", "border-white/10", "p-4");
              }
            },
          }, ">");
        },
      });


    }


      
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
<Background ref={(el) => (containerRef = el)} className="relative flex max-md:flex-col justify-center items-center p-8 sm:p-16 lg:p-20" >
  <div class="absolute inset-0 bg-black opacity-0" bind:this={overlayRef}></div>
    <!-- <img class="w-[400px] rotate-45 absolute -bottom-10 -left-5" src="images/single-card.png" alt=""> -->

  <div class="relative flex flex-col items-center justify-center" bind:this={part1Ref}>
    <Logo
      src="/images/ukm/dekorasi/logo.png"
      alt="UKM Dekorasi Logo" 
      className=""
      ref={(el) => (logoRef = el)}
    />
    <Title text="UKM DEKORASI" ref={(el) => (titleRef = el)} />
    
  </div>

  <div class="bg-gradient-to-r from-[#1a1a1a]/70 via-[#2a2a2a]/60 to-[#1a1a1a]/70 
          backdrop-blur-lg 
          shadow-lg 
          rounded-2xl 
          mt-2
          max-w-3xl 
          transition-all duration-500 ease-in-out 
          max-md:max-h-0 md:max-w-0
          overflow-hidden"
          bind:this={introRef}
      >
    <Subtitle
      text='UKM Dekorasi hadir sebagai wadah bagi mahasiswa untuk mengekspresikan nilai seni melalui kerajinan tangan, khususnya bagi mereka yang memiliki ketertarikan di bidang kesenian. Dengan mengusung tema "The Silent Symphony: Crafting Stories Without Words," UKM ini memfasilitasi anggotanya untuk menciptakan kerajinan tangan yang tidak hanya estetis, tetapi juga mengandung makna. Keikutsertaan dalam UKM Dekorasi memberikan kesempatan untuk mengasah kreativitas, mengekspresikan diri, dan berkolaborasi dalam kelompok kecil. Seluruh bahan akan disediakan oleh pihak UKM, dan setiap peserta akan mendapatkan bimbingan langsung dari fungsionaris. Setiap karya yang telah selesai dapat dibawa pulang oleh para peserta.'
      className="text-justify text-[#FFF4E9] max-sm:text-sm"
    />
  </div>

</Background>

<Background ref={(el) => (framesWrapperRef = el)} className="!h-[300vh] md:!h-screen flex flex-col items-center justify-center space-y-12 p-8 !overflow-visible ">
  <div data-aos="fade-down">
    <Title text="Our Memories"></Title>
  </div>

  <div class="md:hidden">
    <ImageFrame ref={(el) => (frame1Ref = el)}
      src="/images/ukm/dekoras qi/1.jpg" alt="Dekorasi 1" className="absolute w-[270px] sm:w-[300px] -rotate-8 top-[5%] left-0 z-10" />
    <ImageFrame ref={(el) => (frame2Ref = el)}
      src="/images/ukm/dekorasi/2.jpg" alt="Dekorasi 2" className="absolute w-[270px] sm:w-[300px] rotate-15 top-[40%] right-[2%] z-12" />
    <ImageFrame ref={(el) => (frame3Ref = el)}
      src="/images/ukm/dekorasi/3.jpg" alt="Dekorasi 3" className="absolute w-[270px] sm:w-[300px] rotate-8 top-[17%] right-[5%] z-10" />
    <ImageFrame ref={(el) => (frame4Ref = el)}
      src="/images/ukm/dekorasi/4.jpg" alt="Dekorasi 4" className="absolute w-[270px] sm:w-[300px] -rotate-12 top-[28%] left-[5%] z-[11]" />
  </div>

  <div class="hidden md:grid grid-cols-4 gap-2 justify-center w-full h-full mx-auto">
    <ImageFrame src="/images/ukm/dekorasi/1.jpg" alt="Dekorasi 1" className="-rotate-8 w-[270px] " />
    <ImageFrame src="/images/ukm/dekorasi/2.jpg" alt="Dekorasi 2" className="rotate-8 translate-y-2 w-[270px] " />
    <ImageFrame src="/images/ukm/dekorasi/3.jpg" alt="Dekorasi 3" className="-rotate-2 translate-y-10 w-[270px] " />
    <ImageFrame src="/images/ukm/dekorasi/4.jpg" alt="Dekorasi 4" className="rotate-8 -translate-y-1 w-[270px] " />
  </div>

  <!-- decoration -->
    <img class="w-[375px] absolute top-[50%] left-0 z-[100] rotate-10" src="images/mask.png" alt="">
    <img class="w-[375px] absolute -bottom-[15%] -right-[5%] -rotate-90 z-[1]" src="images/multi-card.png" alt="">
</Background>

<Background className="flex flex-col items-center justify-center p-8 gap-5">
  <div data-aos="fade-down">
    <Title text="Video"></Title>
  </div>

  <!-- <div data-aos="fade-up" data-aos-offset="300" data-aos-duration="500">
    <Video src="/images/ukm/dekorasi/video.mov" className="w-full lg:w-auto h-full" controls={true} />
  </div> -->
</Background>


<Background className="relative flex flex-col items-center justify-center gap-2 md:gap-5 p-8">
  <div
    class="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-[-1] opacity-15"
    bind:this={posterOverlay}
  ></div>

  <div class="w-full mb-8">
    <Title text="Join Us!" class="text-center text-3xl md:text-5xl font-bold" />
  </div>
<<<<<<< HEAD
  <img data-aos="fade-up" data-aos-offset="500" src="images/ukm/dekorasi/poster.png" alt="">
</Background>
>>>>>>> eea415a (tidy up the code)
=======

  <div class="w-full flex flex-col md:grid md:grid-cols-2 md:gap-5 items-center">
    <!-- Poster -->
    <div class="w-full flex justify-center mb-8 md:mb-0">
      <img
        src="images/ukm/dekorasi/poster.png"
        alt="Event Poster"
        class="w-full max-w-sm md:w-[80%] lg:w-[60%] rounded-2xl shadow-lg "
        data-aos="fade-up"
        data-aos-offset="500"
      />
    </div>

    <div data-aos="zoom-in" data-aos-offset="600" class="w-[80%] md:w-3/4 md:mx-auto flex flex-col items-center text-center space-y-1 md:space-y-3 lg:space-y-6 
            bg-[#fff8e1]/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-4 border-red-500">    
      <Subtitle text="🎟 Current Slot: 29/30" 
        className="font-extrabold text-xl md:text-2xl lg:text-3xl text-red-600 drop-shadow-sm" 
      />
      <Subtitle text="Registration Fee: Rp375.000" 
        className="font-extrabold text-x md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" 
      />
      <button class="btn push relative px-4 py-2 rounded-[8px] font-bold cursor-pointer overflow-hidden transition-all
              transition-duration-300 text-white bg-[#333] text-centerfont-lexend mt-4 md:px-8 md:py-3 text-lg md:text-xl"
      >
        Register Now!
      </button>
    </div>
     
  </div>
</Background>
>>>>>>> c154f6e (fix: ukm page responsiveness)
