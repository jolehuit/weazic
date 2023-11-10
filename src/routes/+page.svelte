<script lang="ts">
  /** @type {import('./$types').PageData} */
  import { fade, fly } from 'svelte/transition';
  import {quintInOut} from "svelte/easing"
  import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import animation from '$lib/animations/listening-music.json'
  import cityE from '$lib/errors/error.svg'
  import { Geolocation } from "@capacitor/geolocation";
  let mood:string;
  let moodToggle:boolean=false;
  let locationButtonValue:string = "Get your location 📍";
  let weather:String;

  let city: string;


  let showPLaylists:boolean =false;
let playlistsListEmbed:[]=[];
    let inputText: string;
    let goToStyles:boolean=false;
    let stylesSelected: string[] = [];
    let loading:boolean=false;
    let latitude:number;
    let longitude:number;
let playlistsList;
    let controlsLayout = [
      'previousFrame',
      'playpause',
      'stop',
      'nextFrame',
      'progress',
      'frame',
      'loop',
      'spacer',
      'background',
      'snapshot',
      'zoom',
      'info',
    ];
  let elemCarousel: HTMLDivElement;
let cityError:boolean=false;

  function carouselLeft(): void {
    const x =
      elemCarousel.scrollLeft === 0
        ? elemCarousel.clientWidth * elemCarousel.childElementCount // loop
        : elemCarousel.scrollLeft - elemCarousel.clientWidth; // step left
    elemCarousel.scroll(x, 0);
  }
  function carouselRight(): void {
    const x =
      elemCarousel.scrollLeft === elemCarousel.scrollWidth - elemCarousel.clientWidth
        ? 0 // loop
        : elemCarousel.scrollLeft + elemCarousel.clientWidth; // step right
    elemCarousel.scroll(x, 0);
  }
  async function getLoc() {
    locationButtonValue = "Please wait...";
    const loc = await Geolocation.getCurrentPosition();
    latitude = loc.coords.latitude;
    longitude = loc.coords.longitude;
    await coordsToWeather();
    locationButtonValue = "Location found!"
  }

  async function coordsToWeather() {
    const response = await fetch('/weather', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
      headers: {
        'content-type': 'application/json',
      },
    });
        if (response.ok) {
          weather = await response.text();
          console.log("Weather ok : " + weather);
          goToStyles = true;

        } else {
          throw new Error('Something went wrong');
        }

  }

async function getWeatherFromCity() {
    const response = await fetch('/coords', {
      method: 'POST',
      body: JSON.stringify({ city }),
      headers: {
        'content-type': 'application/json',
      },
    });
  if (response.ok) {
    const coords = await response.json();
    console.log(coords);
    latitude = coords.latitude;
    longitude = coords.longitude;
    console.log("Coords ok : " + latitude + longitude);
    await coordsToWeather();
    goToStyles=true;
  }
  else {
    console.log("error");
    cityError=true;
  }

}async function gpt() {
    const response = await fetch('/gpt', {
      method: 'POST',
      body: JSON.stringify({mood,weather,stylesSelected}),
      headers: {
        'content-type': 'application/json',
      },
    });
  if (response.ok) {
    playlistsList = await response.json();
    console.log(playlistsList);
     playlistsListEmbed = playlistsList.map(lien => (
      `${lien.split("/playlist/")[0]}/embed/playlist/${lien.split("/playlist/")[1]}?utm_source=oembed`
    ));
    console.log("element 0 : " + playlistsListEmbed[0]);
    loading=false;
    showPLaylists=true;
  }
  else {
    console.log("error");
  }
}
</script>

<body class="overflow-hidden" data-theme="crimson">


{#if !moodToggle}

  <h1 transition:fly={{ delay: 50, duration: 550, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center mt-44 text-4xl font-bold">Select your mood</h1>
   <div transition:fly={{ delay: 50, duration: 550, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center m-auto mt-6">
    <button on:click={()=>{moodToggle=true; mood="sad"}} type="button" class="btn h-20 w-20 rounded-full variant-filled text-5xl m-2">😭</button>
    <button  on:click={()=>{moodToggle=true; mood="neutral"}} type="button" class="btn h-20 w-20 rounded-full variant-filled text-5xl m-2">😐</button>
    <button   on:click={()=>{moodToggle=true; mood="happy"}} type="button" class="btn h-20 w-20 rounded-full variant-filled text-5xl m-2">😄</button>
    </div>

{:else}
  {#if !goToStyles && !cityError}
    <div in:fly={{ delay: 500, duration: 600, y: 50, opacity: 0, easing: quintInOut }} out:fly={{ delay: 50, duration: 500, y: 50, opacity: 0, easing: quintInOut }} class="container py-10 px-10 mx-0 min-w-full flex flex-col items-center">

        <h1 class=" mt-20 md:text-4xl text-2xl font-bold">What's the weather like?</h1>
        <span class="py-5 text-center md:text-lg"><i>Don't worry, this information will not be stored. We only use it to detect the weather where you live. ☔️</i></span>

        <button on:click={getLoc}
                class="mt-5 btn btn-xl variant-filled grid">
      {locationButtonValue}</button>
  {#if !(locationButtonValue=="Location found!")}
      <span class="py-6 text-center md:text-m">Or enter the city where you are located....</span>
        <input
                class="py-5 pl-2 md:w-1/6 input autocomplete"
                type="text"
                bind:value={inputText}
                placeholder="Enter your city"
        />
      {/if}
      {#if inputText}
        <button on:click={()=> {city=inputText;console.log("OK" + city); getWeatherFromCity()}} transition:fade={{ delay: 250, duration: 300 }} class="mt-5 btn btn-l variant-filled grid">Next</button>

      {/if}

    </div>
{/if}
  {/if}
{#if cityError}
  <div in:fly={{ delay: 450, duration: 500, y: 50, opacity: 0, easing: quintInOut }} class="flex flex-col">
<img  src={cityE} alt="404 error" class="mt-52 w-1/6 xl:w-1/12 m-auto"/>
  <span class="flex justify-center text-center text-xl font-bold mt-5">City not found, please retry.</span>
    <button class="m-auto mt-5 btn btn-l variant-filled grid w-22" on:click={() => {goToStyles=false; cityError=false}}>Back</button>
  </div>
{/if}
{#if goToStyles && playlistsListEmbed.length<1 && !loading && !cityError}
  <h1 in:fly={{ delay: 450, duration: 600, y: 50, opacity: 0, easing: quintInOut }} out:fly={{ delay: 50, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center mt-20 text-3xl">Select your preferred styles</h1>
  <div class="flex justify-center items-center" in:fly={{ delay: 450, duration: 600, y: 50, opacity: 0, easing: quintInOut }} out:fly={{ delay: 50, duration: 600, y: 50, opacity: 0, easing: quintInOut }}>
  <ListBox multiple class="grid grid-cols-2 gap-2 md:w-1/4 mt-5">
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="Pop" value="Pop">🎤 Pop</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="Rock" value="Rock">🎸 Rock</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="Rap" value="Rap">🔪 Rap</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="EDM" value="EDM">👨‍🎤 EDM</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="Country" value="Country">🤠 Country</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="Jazz" value="Jazz">🎷 Jazz</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="Classical" value="Classical">🎹 Classical</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="R&B/Soul" value="R&B/Soul">🍯 R&B/Soul</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="Indie" value="Indie">⏭️ Indie</ListBoxItem>
    <ListBoxItem class="border-2 ml-3" bind:group={stylesSelected} name="Latin" value="Latin">🌮 Latin</ListBoxItem>
  </ListBox>
  </div>
  <div in:fly={{ delay: 450, duration: 600, y: 50, opacity: 0, easing: quintInOut }} out:fly={{ delay: 50, duration: 300, y: 50, opacity: 0, easing: quintInOut }} class="grid grid-rows-2 gap-3 justify-center mt-5">
    {#if stylesSelected.length>0}
      <button transition:fly={{ delay: 150, duration: 400, y: 50, opacity: 0, easing: quintInOut }} on:click={()=>{loading=true; gpt() ; console.log("Styles sélectionnés : " + stylesSelected)}} class="btn btn-l variant-filled grid"> 😎 I've selected my styles!</button>
    {/if}
  <button on:click={()=>{loading=true; gpt()}} class="btn btn-l variant-filled grid" on:click={()=>{stylesSelected=["No style preference"]}}> 🤷‍ No style preference</button>
  </div>
{/if}
  {#if loading}
    <h1 in:fly={{ delay: 550, duration: 500, y: 50, opacity: 0, easing: quintInOut }} out:fly={{ delay: 50, duration: 300, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center mt-20 text-3xl">Let AI find what you need...</h1>
    <div  in:fly={{ delay: 550, duration: 500, y: 50, opacity: 0, easing: quintInOut }} out:fly={{ delay: 50, duration: 300, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center">
    <LottiePlayer
      src="{animation}"
      autoplay="{true}"
      loop="{true}"
      controls="{false}"
      renderer="svg"
      background="transparent"
      height="{600}"
      width="{600}"
      controlsLayout="{controlsLayout}"
    />
    </div>
  {/if}

{#if showPLaylists && playlistsListEmbed.length>1}
  <div class="md:grid-cols-1 grid grid-cols-[auto_1fr_auto] gap-6 items-center mt-3 sm:mt-5 md:mt-10">
    <button type="button" class="md:hidden btn-icon variant-filled ml-2" on:click={carouselLeft}>⬅️</button>
    <!-- Button: Left -->
    <div bind:this={elemCarousel} class="snap-x snap-mandatory scroll-smooth flex overflow-x-auto md:flex-col md:items-center">
      {#each playlistsListEmbed as item,i}
        <iframe  class="rounded-container-token md:rounded-xl w-full mb-5 md:h-44 md:w-1/2"  height="500" width="550" title="item {i}" loading="lazy" src={item}></iframe>
      {/each}

    </div>

    <button type="button" class="md:hidden btn-icon variant-filled mr-2" on:click={carouselRight}>
      ➡️
    </button>

  </div>
  <span class="flex justify-center text-center text-xs md:text-base mt-3"><i>The results are generated by an AI. <br/> They can therefore be more or less relevant️.</i></span>

{/if}
    </body>
