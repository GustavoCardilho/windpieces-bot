import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import { Command } from "../../structs/types/command";
import * as uuid from "uuid";
import { clientRedis } from "../..";

export default new Command({
  name: "redis-register",
  description: "Testando conexão com o redis",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "value",
      description: "Valor a ser registrado",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run({ interaction, client, options }) {
    const uuidResult = uuid.v4();
    const userText = options.getString("value", true);

    clientRedis.set(`register-${uuidResult}`, userText);

    interaction.reply({
      ephemeral: true,
      content: `Chave criada com o id: **register-${uuidResult}** e seu valor é: **${userText}**`,
    });
  },
});
