import type { RequestHandler } from "@sveltejs/kit";
import { OPENWEATHER_KEY } from "$env/static/private";

export const POST:RequestHandler = async ({ request }) => {

  try {
    const postData = await request.json();
    console.log("postData longitude :" + postData.longitude);
    console.log("postData latitude :" + postData.latitude);
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${postData.latitude}&lon=${postData.longitude}&appid=${OPENWEATHER_KEY}`;
    console.log("url : " + url)
    const res = await fetch(url);
    const data = await res.json();
    const weather = data.weather[0].main;
    console.log("weather : " + weather)
    // Vérification des résultats
    if(weather.length > 0)
      return new Response(String(weather));

    else{
      throw new Error("Erreur lors de la récupération de la météo");
      }
    } catch (error) {
    throw new Error("Aucun résultat de géocodage trouvé.");
  }
};