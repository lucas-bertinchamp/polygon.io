import { PrismaClient } from ".prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  let requestedMethod = req.method;

  switch (requestedMethod) {
    case "GET":
      let players = await prisma.player.findMany();
      res.status(200).json(players);
      break;

    case "POST":
      let a = await prisma.player.create({
        data: {
          name: req.body.name,
          color: req.body.color,
          worldPosX: req.body.worldPosX,
          worldPosY: req.body.worldPosY,
          level: req.body.level,
          xp: req.body.xp,
          hp: req.body.hp,
          ammo: req.body.ammo,
        },
      });
  }
}
