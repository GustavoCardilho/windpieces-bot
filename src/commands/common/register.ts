import {
  ActionRowBuilder,
  ApplicationCommandType,
  BitField,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  Collection,
  ComponentType,
  EmbedBuilder,
  GuildChannel,
  Interaction,
  OverwriteType,
  PermissionOverwrites,
  PermissionsBitField,
  StringSelectMenuBuilder,
} from "discord.js";
import { Command } from "../../structs/types/command";
import { GuildModel } from "../../models/GuildModel";
import { clientRedis } from "../../databases/redis";
import { UserModel } from "../../models/UserModel";

export default new Command({
  name: "register",
  description: "Pong!",
  type: ApplicationCommandType.ChatInput,
  async run({ interaction, client, options }) {
    if (!interaction.inCachedGuild()) return;
    const category = await interaction.guild?.channels.cache.find(
      (channel) => channel.name === "WindPieces",
    );

    if (!category) {
      interaction.reply({
        ephemeral: true,
        content: `Categoria não encontrada.`,
      });
      return;
    }

    const verifyRegisterMongo = await UserModel.findOne({
      userID: interaction.user.id,
      guildID: interaction.guildId,
    });
    if (verifyRegisterMongo) {
      await clientRedis.del(`register-user-${interaction.user.id}-stage`);

      interaction.reply({
        ephemeral: true,
        content: `Você já está registrado.`,
      });
      return;
    }

    const { guild } = interaction;

    if (!guild.channels.cache.get(`register-${interaction.user.id}`)) {
      try {
        const channel = await guild.channels.create({
          name: `register-${interaction.user.id}`,
          type: ChannelType.GuildText,
          parent: category as CategoryChannel,
        });
        await channel.permissionOverwrites.create(guild.roles.everyone, {
          SendMessages: false,
          ViewChannel: false,
        });
        if (
          !guild.roles.cache.find(
            (role) =>
              role.name === `windpieces-registered-${interaction.user.id}`,
          )
        ) {
          const roleRegistered = await guild.roles.create({
            name: `windpieces-registered-${interaction.user.id}`,
            color: "Red",
          });
          await channel.permissionOverwrites.create(roleRegistered, {
            ViewChannel: true,
          });

          if (!roleRegistered)
            return interaction.reply({
              ephemeral: true,
              content: `Não foi possível criar o cargo. ERR: 500`,
            });
        }

        const findRole = guild.roles.cache.find(
          (role) =>
            role.name === `windpieces-registered-${interaction.user.id}`,
        );

        await interaction.member.roles.add(findRole!);

        const EmbedCreatedChannel = await EmbedCreatedChannelForRegister(
          interaction.user.id,
          channel.id,
        );

        const { buttons, embeds } = await RegisterSetup();
        const msg = await channel.send({
          components: buttons,
          embeds: embeds,
        });
        const collectorButtonRegister = msg.createMessageComponentCollector({
          componentType: ComponentType.Button,
        });

        await interaction.reply({
          ephemeral: true,
          embeds: EmbedCreatedChannel.embeds,
        });

        collectorButtonRegister.on("collect", async (buttonInteraction) => {
          const { user } = buttonInteraction;
          const { selects, embeds } = await ClassSetup();
          const verifyRegister = await clientRedis.get(
            `register-user-${user.id}-stage`,
          );

          if (!verifyRegister) {
            await clientRedis.set(`register-user-${user.id}-stage`, 1);
            clientRedis.expire(`register-user-${user.id}-stage`, 30);
            await buttonInteraction.reply({
              components: selects,
              embeds: embeds,
              ephemeral: true,
            });
          }
        });
      } catch (err) {}
    }
  },
  selects: new Collection([
    [
      "select-class",
      async (interaction) => {
        if (!interaction.inCachedGuild()) return;
        await UserModel.create({
          userID: interaction.user.id,
          guildID: interaction.guildId,
          class: interaction.values[0],
        });
        await clientRedis.del(`register-user-${interaction.user.id}-stage`);

        const embed = new EmbedBuilder()
          .setTitle("Registrado com sucesso")
          .setDescription(
            `Seja bem vind@, ${interaction.user.username}. Você foi registrado com sucesso.\n
            Caso precise de ajuda, digite \`/help\` para ver os comandos disponíveis.\n
            Até mais!`,
          )
          .setColor("Green")
          .setThumbnail(interaction.user.displayAvatarURL());
        await interaction.update({
          components: [],
          embeds: [embed],
        });
        setTimeout(async () => {
          finishRegister(interaction);
        }, 5000);
      },
    ],
  ]),
});

const RegisterSetup = async () => {
  const embed = new EmbedBuilder()
    .setTitle("Registre-se no WindPieces")
    .setDescription(
      `Olá! Para se registrar no mundo de windpieces, clique no botão abaixo.`,
    )
    .setColor("Aqua");

  const button = new ButtonBuilder({
    customId: "start-register",
    label: "Registre-se",
    style: ButtonStyle.Success,
  });

  const rowButton = new ActionRowBuilder<ButtonBuilder>({
    components: [button],
  });

  return { buttons: [rowButton], embeds: [embed] };
};

const ClassSetup = async () => {
  const embed = new EmbedBuilder()
    .setTitle("Seleção de classe")
    .setDescription(
      `Selecione uma classe para começar sua jornada no mundo de WindPieces.`,
    )
    .setColor("Random");

  const rowSelect = new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder({
        customId: "select-class",
        placeholder: "Selecione uma classe",
        options: [
          {
            label: "Guerreiro",
            value: "warrior",
            emoji: "⚔️",
          },
          {
            label: "Mago",
            value: "mage",
            emoji: "🧙‍♂️",
          },
          {
            label: "Arqueiro",
            value: "archer",
            emoji: "🏹",
          },
        ],
      }),
    ],
  });

  return { selects: [rowSelect], embeds: [embed] };
};

const finishRegister = async (interaction: any) => {
  const findRole = interaction.guild.roles.cache.find(
    (role: any) => role.name === `windpieces-registered-${interaction.user.id}`,
  );

  await interaction.member!.roles.remove(findRole!);

  const channel = interaction.guild?.channels.cache.find(
    (channel: any) => channel.name === `register-${interaction.user.id}`,
  );
  interaction.guild.roles.delete(findRole!);
  await channel?.delete();
};

const EmbedCreatedChannelForRegister = async (
  userId: String,
  channelCreated: string,
) => {
  const embed = new EmbedBuilder()
    .setTitle("Registro iniciado")
    .setDescription(
      `Para se registrar, acesse o canal <#${channelCreated}>. Caso não consiga acessar, contate um administrador do bot`,
    )
    .setColor("Aqua");

  return { embeds: [embed] };
};
