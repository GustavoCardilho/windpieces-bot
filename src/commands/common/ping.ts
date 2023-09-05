import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  Collection,
} from "discord.js";
import { Command } from "../../structs/types/command";

export default new Command({
  name: "ping",
  description: "Pong!",
  type: ApplicationCommandType.ChatInput,
  run({ interaction, client, options }) {
    interaction.reply({
      ephemeral: true,
      content: `Pong!`,
    });
  },
});
