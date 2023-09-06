import {
  ActionRowBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Command } from "../../structs/types/command";
import { UserModel } from "../../models/UserModel";

export default new Command({
  name: "register",
  description: "Pong!",
  type: ApplicationCommandType.ChatInput,
  async run({ interaction, client, options }) {
    if (interaction.user.id || interaction.guild!.id) {
      const embed = new EmbedBuilder()
        .setTitle("Erro!")
        .setDescription(
          ":warning: Erro ao buscar os dados do usuário, tente novamente mais tarde!",
        )
        .setColor("Red");

      return interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
    }

    const modal = new ModalBuilder({
      customId: "register-form-modal",
      title: "Formulario de cadastro",
    });

    const input1 = new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          customId: "register-form-modal-input1",
          label: "Description",
          placeholder: "Enter your description here",
          style: TextInputStyle.Short,
        }),
      ],
    });

    modal.setComponents([input1]);

    const verifyUser = await UserModel.findOne({
      userID: interaction.user.id,
      guildID: interaction.guild!.id,
    });

    if (verifyUser) {
      const embed = new EmbedBuilder()
        .setTitle("Registro encontrado!!")
        .setDescription(
          ":warning: Você já está registrado, caso queira alterar sua descrição, use o comando `/edit`",
        )
        .setColor("Red");

      return interaction.reply({
        content: "Você já está registrado!",
        ephemeral: true,
        embeds: [embed],
      });
    }

    interaction.showModal(modal);

    const modalInteraction = await interaction
      .awaitModalSubmit({
        time: 20_000,
        filter: (i) => i.user.id == interaction.user.id,
      })
      .catch((err) => undefined);

    if (!modalInteraction) return;

    const { fields } = modalInteraction;

    const description = fields.getTextInputValue("register-form-modal-input1");

    await UserModel.create({
      userID: interaction.user.id,
      guildID: interaction.guild!.id,
      description,
      class: "Nenhuma",
    });

    modalInteraction.reply({
      content: `Modal submitted! ${modalInteraction.user.username}`,
      ephemeral: true,
    });
  },
});
