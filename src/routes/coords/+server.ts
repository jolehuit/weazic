import type { RequestHandler } from "@sveltejs/kit";
import { OPENWEATHER_KEY } from "$env/static/private";

export const POST:RequestHandler = async ({ request }) => {

  try {
    const postData = await request.json();
    console.log("postData city :" + postData.city);
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${postData.city}&limit=1&appid=${OPENWEATHER_KEY}`;
    console.log("url : " + url)
    const res = await fetch(url);
    const data = await res.json();
    if(data) {
      console.log(data);
      const latitude = data[0].lat;
      const longitude = data[0].lon;
      console.log("coords found : " + latitude + longitude)
      return new Response(JSON.stringify(
        { latitude, longitude }));
    }
    else {
      return new Error("Ville incorrecte.");
    }
  } catch (error) {
    throw new Error("Aucun résultat de géocodage trouvé.");
  }
};