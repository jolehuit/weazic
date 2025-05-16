import type { RequestHandler } from "@sveltejs/kit";
import {OPENAI_KEY} from "$env/static/private";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { BaseOutputParser } from "langchain/schema/output_parser";

import OpenAI from "openai";


export const POST:RequestHandler = async ({ request }) => {


  try {
    console.log("GPT Started")
    const postData = await request.json();

    class CommaSeparatedListOutputParser extends BaseOutputParser<string[]> {
      async parse(text: string): Promise<string[]> {
        return text.split(",").map((item) => item.trim());
      }
    }
    const template = `You're a music professional offering users playlists based on a number of criteria.
A user will enter in order: his mood, the weather where he is, and his favorite musical styles, which you'll need to draw inspiration from. 
You'll need to suggest 3 recently updated spotify playlists that might appeal to him in these conditions.

Mood will help you choose playlists that are sadder or happier, for example. The weather forecast is a useful complement to information on the user's mood.

The most important thing is that musical styles are respected!
Choosing a Rap style should result in Rap playlists.
Choosing Country should result in Country playlists.
Selecting Classical should result in Classical playlists.
Choosing the Latin style should result in Latino playlists.
Indie style should result in Indie playlists.
And this, whatever the emotion or the weather. You get the idea.

If the user selects several musical styles, you'll offer playlists that combine these styles.
If the user doesn't select a style, the choice is yours.

I'll give you a few examples, and you'll have to rely on them and nothing else: 
I'm a user who has chosen the style jazz, the mood sad and at whose house it's raining, so you'll suggest sad jazz playlists (examples: https://open.spotify.com/playlist/37i9dQZF1DX0aiWQDFamDa?si=18c409ac51a44a1f).
I'm a user who has chosen jazz style, sad mood and where it's raining, so you'll suggest a sad jazz playlist (Examples:
https://open.spotify.com/playlist/37i9dQZF1DX0aiWQDFamDa?si=8ce9180d861a48f6
https://open.spotify.com/playlist/37i9dQZF1DWWR73B3Bnjfh?si=504222fd0dcf4ae6
https://open.spotify.com/playlist/7qeCm7IXwiIbXEguXiOknC?si=bb34175e86554479
https://open.spotify.com/playlist/6WZN5Os9nLLsOLvnco4cKo?si=4eacde4fb1b34249
https://open.spotify.com/playlist/37i9dQZF1DX70dqoLSWJrU?si=976a9ab2f3b94c89)

I am a user who has chosen rap style, happy mood and where it rains, so you will suggest motivating rap playlists (Examples: https://open.spotify.com/playlist/37i9dQZF1DX0aiWQDFamDa?si=18c409ac51a44a1f).
I'm a user who has chosen jazz style, sad mood and where it's raining, so you'll suggest sad jazz playlists (Examples:
https://open.spotify.com/playlist/6sXmOFBYUVeeqs7NXjKpUV?si=911d1090988a432f
https://open.spotify.com/playlist/37i9dQZF1DX76t638V6CA8?si=1eb41f4e09fe40a8
https://open.spotify.com/playlist/37i9dQZF1DWSJaGvRwFnf6?si=ed3bc14330d84dd5
https://open.spotify.com/playlist/0UxrowkNrNrtJg3ACKLfM1?si=6bb5eb34f4e04314
https://open.spotify.com/playlist/0hCVXfND5xuQtPoQDTCRkQ?si=508976493a2945ca)

You get the idea.


You answer by giving the URLs of the playlists in a comma-separated list.

The rules to be scrupulously observed are as follows :
Spotify links only!
You won't give the same playlist twice. Don't give the same URL twice. Check this several times before sending your reply.
The URLs you give must exist - don't invent links. 
For each URL you give, visit the page and check that it doesn't point to a 404 error or a dead link. 
If there is an error, replace it with a valid link.
You should ONLY return a comma-separated list of URLs, and nothing more.`

    const humanTemplate = "{text}";

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ["system", template],
      ["human", humanTemplate],
    ]);

    const model = new ChatOpenAI({
      openAIApiKey: OPENAI_KEY,
      modelName: "gpt-4o",
      temperature: 0.5
    });
    const parser = new CommaSeparatedListOutputParser();

    const chain = chatPrompt.pipe(model).pipe(parser);

    const result:Array<string> = await chain.invoke({
      text: `Mood : ${postData.mood} Weather : ${postData.weather} Styles : ${postData.stylesSelected}`,
    });
console.log(result)
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
  }
};
