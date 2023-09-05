import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/command";
import { clientRedis } from "../..";

export default new Command({
  name: "redis-readall",
  description: "ler todos os dados do redis",
  type: ApplicationCommandType.ChatInput,
  async run({ interaction, client, options }) {
    const allData = await clientRedis.keys("*");

    interaction.reply({
      ephemeral: true,
      content: allData.toString(),
    });
  },
});
