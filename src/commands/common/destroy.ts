import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/command";
import { UserModel } from "../../models/UserModel";

export default new Command({
  name: "destroy",
  description: "!!",
  type: ApplicationCommandType.ChatInput,
  async run({ interaction, client, options }) {
    const { member, guild } = interaction;

    try {
      if (!member || !guild) return;
      console.log(member.user.id, guild.id);
      await UserModel.findOneAndDelete({
        userID: member.user.id,
        guildID: guild.id,
      });
      const embed = new EmbedBuilder()
        .setTitle("Account Destroyed")
        .setDescription(
          "Your account has been destroyed. You can create a new one with `/register`",
        )
        .setColor("Red");
      return interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
    } catch (err) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("An error occurred while destroying your account.")
        .setColor("Red");
      return interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
    }
  },
});
