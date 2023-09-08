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
      return interaction.reply({
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
      **Element:** ${verifyUser?.element}
      **Local:** ${verifyUser?.local}
      **Weapon:** ${verifyUser?.weapon}
      **Magic Power:** ${verifyUser?.magicPower}
      **Physical Power:** ${verifyUser?.physicalPower}
      **Defense:** ${verifyUser?.defense}
      **Speed:** ${verifyUser?.speed}
      `,
      )
      .setThumbnail(interaction.user.displayAvatarURL({ size: 512 }));

    return interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  },
});
