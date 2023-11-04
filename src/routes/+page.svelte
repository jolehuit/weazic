<script lang="ts">
  /** @type {import('./$types').PageData} */
  import { fade, fly } from 'svelte/transition';
  import {quintInOut} from "svelte/easing"
  import { Autocomplete } from '@skeletonlabs/skeleton';
  import type { AutocompleteOption } from '@skeletonlabs/skeleton';
  import { popup } from '@skeletonlabs/skeleton';
  import type { PopupSettings } from '@skeletonlabs/skeleton';
  import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import cities from '$lib/db/cities.json';
  import animation from '$lib/animations/listening-music.json'

  import { Geolocation } from "@capacitor/geolocation";
  let mood:string;
let moodToggle:boolean=false;
  let locationButtonValue:string = "Get your location 📍";
  let showNextButton:boolean = false;
  let popupSettings: PopupSettings = {
      event: 'focus-click',
      target: 'popupAutocomplete',
      placement: 'bottom',
    };
  let weather:String;

  let city: string;
  const citiesOptions: AutocompleteOption<string>[] = cities.map(function(city) {

      return { value : city.name, label : city.name }
    })
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
    function onCitySelection(event: CustomEvent<AutocompleteOption<string>>): void {
      inputText = event.detail.label;
      showNextButton = true;
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
  }
  else {
    console.log("error");
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

  <h1 transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center mt-48 text-3xl">Select your mood</h1>
    <div class="grid grid-cols-3 grid-rows-1 w-1/2  md:w-1/6 m-auto mt-6">
    <button transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} on:click={()=>{moodToggle=true; mood="sad"}} type="button" class="btn-icon btn-icon-xl variant-filled text-3xl m-2">😭</button>
    <button transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} on:click={()=>{moodToggle=true; mood="neutral"}} type="button" class="btn-icon btn-icon-xl variant-filled text-3xl m-2">😐</button>
    <button transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }}  on:click={()=>{moodToggle=true; mood="happy"}} type="button" class="btn-icon btn-icon-xl variant-filled text-3xl m-2">😄</button>
    </div>

{:else}
  {#if !goToStyles}
    <div transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="container py-10 px-10 mx-0 min-w-full flex flex-col items-center">

        <h1 transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class=" mt-20 md:text-3xl text-2xl">What's the weather like?</h1>
        <span transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="py-5 text-center md:text-m"><i>Don't worry, this information will not be stored. We only use it to detect the weather where you live. ☔️</i></span>

        <button on:click={getLoc} transition:fly={{
          delay: 250,
          duration: 600,
          y: 50,
          opacity: 0,
          easing: quintInOut
        }} class="mt-5 btn btn-xl variant-filled grid">
      {locationButtonValue}</button>
  {#if !(locationButtonValue=="Location found!")}
      <span transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="py-6 text-center md:text-m">Or select the city where you are located....</span>
        <input transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} on:focus={() => { showNextButton=false}}
                class="py-5 pl-2 md:w-1/4 input autocomplete"
                type="search"
                name="autocomplete-search"
                bind:value={inputText}
                placeholder="Select your city"
                use:popup={popupSettings}
        />
      <div transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="overflow-scroll md:h-1/5 h-16 md:w-1/4"data-popup="popupAutocomplete">
            <Autocomplete
                    bind:input={inputText}
                    options={citiesOptions}
                    on:selection={onCitySelection}
            />
        </div>

      {/if}
      {#if showNextButton}
        <button on:click={()=> {goToStyles=true;city=inputText;console.log("OK" + city); getWeatherFromCity()}} transition:fade={{ delay: 1000, duration: 300 }} class="mt-10 btn btn-l variant-filled grid">Next</button>

      {/if}

    </div>
{/if}
  {/if}

{#if goToStyles && playlistsListEmbed.length<1 && !loading}
  <h1 transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center mt-20 text-3xl">Select your preferred styles</h1>
  <div class="flex justify-center items-center" transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }}>
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
  <div transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="grid grid-rows-2 gap-3 justify-center mt-5">
    {#if stylesSelected.length>0}
      <button transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} on:click={()=>{loading=true; gpt(); console.log("Styles sélectionnés : " + stylesSelected)}} class="btn btn-l variant-filled grid"> 😎 I've selected my styles!</button>
    {/if}
  <button transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} on:click={()=>{loading=true, gpt()}} class="btn btn-l variant-filled grid" on:click={()=>{stylesSelected=["No style preference"]}}> 🤷‍ No style preference</button>
  </div>
{/if}
  {#if loading}
    <h1 transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center mt-20 text-3xl">Let AI find what you need...</h1>
    <div  transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center">
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
  <div transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="grid grid-cols-1 grid-rows-3 md:w-1/2 md:h-full m-auto mt-6">
  {#each playlistsListEmbed as item,i}
  <iframe transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} style="border-radius: 12px; margin-top:10px" width="100%" height="152"  title="item {i}" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" src={item}></iframe>
    {/each}
  </div>
  <span transition:fly={{ delay: 250, duration: 600, y: 50, opacity: 0, easing: quintInOut }} class="flex justify-center mt-10 text-center md:text-m"><i>The results are generated by an AI. They can therefore be more or less relevant️</i>🤖</span>
{/if}
    </body>
