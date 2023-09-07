import { ApplicationCommandType, ChannelType, Collection } from "discord.js";
import { Command } from "../../structs/types/command";
import { GuildModel } from "../../models/GuildModel";

export default new Command({
  name: "guild",
  description: "Registrar o servidor ao WindPieces",
  type: ApplicationCommandType.ChatInput,
  async run({ interaction, client, options }) {
    if (!interaction.inCachedGuild()) return;

    if (!interaction.member.permissions.has("Administrator"))
      return interaction.reply({
        ephemeral: true,
        content: `Você não pode registrar o servidor.`,
      });
    const { guild } = interaction;
    const guildId = interaction.guildId;
    const guildOwnerId = interaction.guild?.ownerId;

    if (!guildId || !guildOwnerId) {
      interaction.reply({
        ephemeral: true,
        content: `Dados insuficientes para registrar o servidor.`,
      });
      return;
    }

    try {
      const checkGuild = await GuildModel.findOne({ guildID: guildId });
      if (checkGuild) {
        interaction.reply({
          ephemeral: true,
          content: `Este servidor já está registrado.`,
        });
        return;
      }

      const checkCategoryCreated = guild.channels.cache.find(
        (channel) => channel.name === "WindPieces",
      );

      if (!checkCategoryCreated) {
        await guild.channels.create({
          name: "WindPieces",
          type: ChannelType.GuildCategory,
        });

        return interaction.reply({
          ephemeral: true,
          content: `Servidor registrado com sucesso.`,
        });
      }
      interaction.reply({
        ephemeral: true,
        content: `Já existe uma categoria com o nome de *WindPieces.*`,
      });
    } catch (err) {
      console.log(err);
    }
  },
});
