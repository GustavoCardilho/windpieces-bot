import {
  ActionRowBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Collection,
} from "discord.js";
import { Command } from "../../structs/types/command";
import { UserModel } from "../../models/UserModel";
import { v4 as uuidv4 } from "uuid";

const CodeCollection = new Collection<string, string>();

const EmbedSuccess = (message?: string) => {
  return new EmbedBuilder()
    .setTitle(":white_check_mark: Account Destroyed")
    .setDescription(
      message ||
        "Your account has been destroyed. You can create a new one with `/register`",
    )
    .setColor("Green");
};

const EmbedError = (message?: string) => {
  return new EmbedBuilder()
    .setTitle(":warning:  Error")
    .setDescription(
      message || "An error occurred while destroying your account.",
    )
    .setColor("Red");
};

export default new Command({
  name: "destroy",
  description: "!!",
  type: ApplicationCommandType.ChatInput,
  async run({ interaction, client, options }) {
    const { member, guild } = interaction;

    try {
      if (!member || !guild) return;
      console.log(member.user.id, guild.id);
      const user = await UserModel.findOne({
        userID: member.user.id,
        guildID: guild.id,
      });

      if (!user) throw new Error("User not found");

      const Modal = new ModalBuilder({
        custom_id: "destroyModal",
        title: "Are you sure?",
      });

      const code = uuidv4().slice(0, 7).toUpperCase();
      CodeCollection.set(member.user.id, code);

      const input1 = new ActionRowBuilder<TextInputBuilder>({
        components: [
          new TextInputBuilder({
            label: `Code: ${code}`,
            placeholder: "Enter the above code here to confirm",
            custom_id: "destroyInput",
            style: TextInputStyle.Short,
            min_length: 7,
            max_length: 7,
            required: true,
          }),
        ],
      });

      Modal.addComponents([input1]);

      interaction.showModal(Modal);
    } catch (err: any) {
      console.log(err);
      return interaction.reply({
        ephemeral: true,
        embeds: [EmbedError(err.message)],
      });
    }
  },
  modals: new Collection([
    [
      "destroyModal",
      async (interaction) => {
        try {
          const code = CodeCollection.get(interaction.user.id);
          if (!code) throw new Error("Code not found");
          if (interaction.fields.getTextInputValue("destroyInput") == code) {
            await UserModel.deleteOne({
              userID: interaction.user.id,
              guildID: interaction.guild!.id,
            });
            return interaction.reply({
              embeds: [EmbedSuccess()],
              ephemeral: true,
            });
          }
        } catch (err: any) {
          console.log(err);
          return interaction.reply({
            ephemeral: true,
            embeds: [EmbedError(err.message)],
          });
        }
      },
    ],
  ]),
});
