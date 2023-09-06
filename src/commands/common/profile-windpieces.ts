import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/command";
import { UserModel } from "../../models/UserModel";

export default new Command({
  name: "profile-windpieces",
  description: "profile-windpieces",
  type: ApplicationCommandType.ChatInput,
  async run({ interaction, client, options }) {
    const verifyUser = await UserModel.findOne({
      userID: interaction.user.id,
      guildID: interaction.guild!.id,
    });

    if (!verifyUser) {
      interaction.reply({
        ephemeral: true,
        content: `
        :warning: Você não está registrado, use o comando \`/register\` para se registrar!`,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("Profile")
      .setColor("Aqua")
      .setDescription(
        `
        **User:** ${interaction.user.tag}
      **Level:** ${verifyUser?.level}
      **XP:** ${verifyUser?.xp}
      **Coins:** ${verifyUser?.coins}
      **Class:** ${verifyUser?.class}
      `,
      )
      .setThumbnail(interaction.user.displayAvatarURL({ size: 512 }));

    interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  },
});
