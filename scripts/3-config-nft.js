import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0x4AE1bF53236e04DC1c99Ec6Bb3EC94eE21C4c51b");

(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: "To The Moon",
        description: "Esse NFT vai te dar acesso ao MoonDAO!",
        image: readFileSync("scripts/assets/moon.png"),
      },
    ]);
    console.log("✅ Novo NFT criado com sucesso no !");
  } catch (error) {
    console.error("falha ao criar o novo NFT", error);
  }
})()