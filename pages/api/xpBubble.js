import XpBubble from "@/components/XpBubble";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {
  let requestedMethod = req.method;

  switch (requestedMethod) {
    case "GET":
      let xpBubble = await redis.hgetall("xpBubble").then((res) => {
        let bubbleList = [];
        for (let field in res) {
          let value = res[field];
          let parsedBubble = JSON.parse(value);
          bubbleList.push(parsedBubble);
        }
        return bubbleList;
      });
      res.status(200).json(xpBubble);
      return {
        props: {
          xpBubble,
        },
      };
    case "DELETE":
      let xpBubblePosX = req.body.xpBubblePosX;
      let xpBubblePosY = req.body.xpBubblePosY;
      
      await redis.hdel(
        "xpBubble",
        JSON.stringify(xpBubblePosX) + ";" + JSON.stringify(xpBubblePosY)
      );

      //Création d'une nouvelle bulle
      let randomPosX = Math.floor(Math.random() * 1000 - 500);
      let randomPosY = Math.floor(Math.random() * 1000 - 500);
      let newXpBubble = {
        worldPosX: randomPosX,
        worldPosY: randomPosY,
        xp: 5,
      };
      await redis.hset(
        "xpBubble",
        JSON.stringify(newXpBubble.worldPosX) +
          ";" +
          JSON.stringify(newXpBubble.worldPosY),
        JSON.stringify(newXpBubble)
      );
      res.status(200).json(newXpBubble);
      break;
  }
}
