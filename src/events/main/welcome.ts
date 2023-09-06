import { EmbedBuilder } from "discord.js";
import { client } from "../..";
import { Event } from "../../structs/types/event";

export default new Event({
  name: "guildMemberAdd",
  run(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Bem vindo ao servidor!")
      .setDescription(
        `Olá ${interaction.user.username}, seja bem vindo ao servidor!`,
      )
      .setColor("Green")
      .setThumbnail(interaction.user.avatarURL()!);

    const chanell: any = interaction.guild?.channels.cache.get(
      "1102361851330826344",
    );

    if (chanell) {
      chanell.send({
        embeds: [embed],
      });
    }
  },
});
