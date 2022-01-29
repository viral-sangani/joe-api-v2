"use strict";

import { Request, Response } from "express";

function getInfos(req: Request) {
  if (!("id" in req.params)) return { name: "Joe Hat NFT" };
  else {
    return {
      id: req.params.id,
      external_url: "https://api.traderjoexyz.com/nft/hat/" + req.params.id,
      name: "Joe Hat NFT #" + req.params.id,
      description: "Redeemed a real HAT and burned 1 $HAT",
      image:
        "https://ipfs.io/ipfs/QmaYPV2VKW5vHtD92m8h9Q4YFiukFx2fBWPAfCWKg6513s",
    };
  }
}

export function infos(req: Request, res: Response) {
  var data = getInfos(req);
  res.send(data);
}
