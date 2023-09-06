import { clientRedis } from "./../../databases/redis";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import { Command } from "../../structs/types/command";
import * as uuid from "uuid";

export default new Command({
  name: "redis-read",
  description: "Lendo um uuid",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "value",
      description: "Valor a ser buscado",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async run({ interaction, client, options }) {
    const userText = options.getString("value", true);
    const result = await clientRedis.get(userText);
    let message: string;
    if (result) {
      message = `Chave encontrada com o id: ${userText} e seu valor é: ${result}`;
    } else {
      message = `Chave não encontrada com o id: ${userText}`;
    }

    interaction.reply({
      ephemeral: true,
      content: message,
    });
  },
});
