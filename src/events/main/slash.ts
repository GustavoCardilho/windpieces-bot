import { CommandInteractionOptionResolver, EmbedBuilder } from "discord.js";
import { client, clientRedis } from "../..";
import { Event } from "../../structs/types/event";

export default new Event({
  name: "interactionCreate",
  async run(interaction) {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    const userId = interaction.user.id;

    try {
      const verifyOldCommands = await clientRedis.get(`interaction-${userId}`);

      if (!verifyOldCommands) {
        await clientRedis.set(`interaction-${userId}`, 1);
        clientRedis.expire(`interaction-${userId}`, 30);
      }

      if (verifyOldCommands && parseInt(verifyOldCommands) > 5) {
        const embed = new EmbedBuilder()
          .setTitle("Você foi bloqueado!")
          .setDescription(
            ":warning: Você está usando comandos muito rápido, aguarde um pouco.",
          )
          .setColor("Red");

        await interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
        return;
      }

      if (verifyOldCommands) {
        await clientRedis.set(
          `interaction-${userId}`,
          parseInt(verifyOldCommands) + 1,
        );
        clientRedis.expire(`interaction-${userId}`, 30);
      }
    } catch (err) {
      console.log(err);
    }

    if (!command) return;

    const options = interaction.options as CommandInteractionOptionResolver;
    command.run({ client, interaction, options });
  },
});
