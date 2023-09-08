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
  ModalBuilder,
  OverwriteType,
  PermissionOverwrites,
  PermissionsBitField,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Command } from "../../structs/types/command";
import { GuildModel } from "../../models/GuildModel";
import { clientRedis } from "../../databases/redis";
import { UserModel } from "../../models/UserModel";
import InitialClassMemoryDatabase from "../../databases/memory/InitialClass.json";
import { v4 as uuidv4 } from "uuid";

interface InitialClassInterface {
  label: string;
  value: string;
  emoji: string;
  physicalPower: number;
  magicalPower: number;
  defense: number;
  weapon: string;
  speed: number;
}

interface ClassInterface {
  label: string;
  value: string;
  emoji: string;
}

interface ElementInterface {
  label: string;
  value: string;
  emoji: string;
}

const CollectionClass = new Collection<String, ClassInterface>();
const CollectionElement = new Collection<String, String>();
const CollectionMember = new Collection<String, String>();
const CollectionButtonCaptcha = new Collection<String, String>();

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

        await interaction.reply({
          ephemeral: true,
          embeds: EmbedCreatedChannel.embeds,
        });
      } catch (err) {}
    }
  },
  selects: new Collection([
    [
      "select-class",
      async (interaction) => {
        if (!interaction.inCachedGuild()) return;
        /*         await UserModel.create({
          userID: interaction.user.id,
          guildID: interaction.guildId,
          class: interaction.values[0],
        }); */
        await clientRedis.del(`register-user-${interaction.user.id}-stage`);

        /*         const embed = new EmbedBuilder()
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
        }); */
        const option = InitialClassMemoryDatabase.find(
          (e) => e.value === interaction.values[0],
        );
        if (!option) return;

        const embed = new EmbedBuilder()
          .setTitle("Classe selecionada")
          .setDescription(
            `:white_check_mark:  A classe selecionada foi: *${interaction.values[0]}*`,
          )
          .setColor("Green");

        await interaction.update({
          embeds: [embed],
          components: [],
        });
        const { selects: selectsElement, embeds: embedsElement } =
          await ElementSetup();

        CollectionClass.set(interaction.user.id, option as ClassInterface);

        await interaction.followUp({
          components: selectsElement,
          embeds: embedsElement,
          ephemeral: true,
        });
      },
    ],
    [
      "select-element",
      async (interaction) => {
        if (!interaction.inCachedGuild()) return;
        /* const option = CollectionClass.get(interaction.user.id);
        if (!option) return;
        const InitialClass = InitialClassMemoryDatabase.find(
          (e) => e.value === option.value,
        );
        await UserModel.create({
          userID: interaction.user.id,
          guildID: interaction.guildId,
          class: option.value,
          element: interaction.values[0],
          weapon: InitialClass?.weapon,
          physicalPower: InitialClass?.physicalPower,
          magicalPower: InitialClass?.magicalPower,
          defense: InitialClass?.defense,
          speed: InitialClass?.speed,
          local: "initial",
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
          .setThumbnail(interaction.user.displayAvatarURL()); */
        CollectionElement.set(interaction.user.id, interaction.values[0]);
        const embed = new EmbedBuilder()
          .setTitle("Elemento selecionado")
          .setDescription(
            `:white_check_mark:  O elemento selecionado foi: *${interaction.values[0]}*`,
          )
          .setColor("Green");
        await interaction.update({
          embeds: [embed],
          components: [],
        });
        const codeAll = uuidv4();
        const code = codeAll.split("-")[0];
        CollectionMember.set(interaction.user.id, code);
        let code1 = randomNumber(1000, 9999);
        let code2 = randomNumber(1000, 9999, [code1!]);
        let code3 = randomNumber(1000, 9999, [code1!, code2!]);
        const ArrayCode = [
          ["button-captcha-1", code1],
          ["button-captcha-2", code2],
          ["button-captcha-3", code3],
        ];
        const codeConfirm = Math.floor(Math.random() * 3);
        const embedCaptch = new EmbedBuilder()
          .setTitle("Captcha")
          .setDescription(
            `Para finalizar, digine o código a seguir no modal. Código: ${ArrayCode[codeConfirm][1]}`,
          )
          .setColor("Aqua");

        const Button1 = new ButtonBuilder({
          customId: "button-captcha-1",
          label: `${code1}`,
          style: ButtonStyle.Success,
        });

        const Button2 = new ButtonBuilder({
          customId: "button-captcha-2",
          label: `${code2}`,
          style: ButtonStyle.Success,
        });

        const Button3 = new ButtonBuilder({
          customId: "button-captcha-3",
          label: `${code3}`,
          style: ButtonStyle.Success,
        });

        CollectionButtonCaptcha.set(
          interaction.user.id,
          ArrayCode[codeConfirm][0]!.toString(),
        );

        const rowButton = new ActionRowBuilder<ButtonBuilder>({
          components: [Button1, Button2, Button3],
        });
        await interaction.followUp({
          components: [rowButton],
          embeds: [embedCaptch],
          ephemeral: true,
        });
      },
    ],
  ]),
  buttons: new Collection([
    [
      "start-register",
      async (interaction) => {
        if (!interaction.inCachedGuild()) return;
        const { selects, embeds } = await ClassSetup();
        const verifyRegister = await clientRedis.get(
          `register-user-${interaction.user.id}-stage`,
        );

        if (!verifyRegister) {
          await clientRedis.set(
            `register-user-${interaction.user.id}-stage`,
            1,
          );
          clientRedis.expire(`register-user-${interaction.user.id}-stage`, 30);

          await interaction.reply({
            components: selects,
            embeds: embeds,
            ephemeral: true,
          });
        }
      },
    ],
    [
      "button-captcha-1",
      async (interaction) => {
        if (!interaction.inCachedGuild()) return;
        const code = CollectionButtonCaptcha.get(interaction.user.id);

        if (!code) return;
        if (code != interaction.customId) {
          finishRegister(interaction);
        } else {
          registerUser(interaction);
          setTimeout(() => {
            finishRegister(interaction);
          }, 5000);
        }
      },
    ],
    [
      "button-captcha-2",
      async (interaction) => {
        if (!interaction.inCachedGuild()) return;
        const code = CollectionButtonCaptcha.get(interaction.user.id);

        if (!code) return;
        if (code != interaction.customId) {
          finishRegister(interaction);
        } else {
          registerUser(interaction);
          setTimeout(() => {
            finishRegister(interaction);
          }, 5000);
        }
      },
    ],
    [
      "button-captcha-3",
      async (interaction) => {
        if (!interaction.inCachedGuild()) return;

        const code = CollectionButtonCaptcha.get(interaction.user.id);
        if (!code) return;

        if (code != interaction.customId) {
          finishRegister(interaction);
        } else {
          registerUser(interaction);
          setTimeout(() => {
            finishRegister(interaction);
          }, 5000);
        }
      },
    ],
  ]),
  modals: new Collection([
    [
      "modal-captcha",
      async (interaction) => {
        const code = CollectionMember.get(interaction.user.id);
        const inputCode = interaction.fields.getTextInputValue(
          "modal-captcha-input",
        );

        if (!code) return;
        if (inputCode === code) {
          const option = CollectionClass.get(interaction.user.id);
          if (!option) return;
          const InitialClass = InitialClassMemoryDatabase.find(
            (e) => e.value === option.value,
          );
          const element = CollectionElement.get(interaction.user.id);
          await UserModel.create({
            userID: interaction.user.id,
            guildID: interaction.guildId,
            class: option.value,
            element,
            weapon: InitialClass?.weapon,
            physicalPower: InitialClass?.physicalPower,
            magicalPower: InitialClass?.magicalPower,
            defense: InitialClass?.defense,
            speed: InitialClass?.speed,
            local: "initial",
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
          await interaction.reply({
            components: [],
            embeds: [embed],
          });
        }
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

const ClassSetup = async (Class?: [ClassInterface]) => {
  const embed = new EmbedBuilder()
    .setTitle("Seleção de classe")
    .setDescription(
      `Selecione uma classe para começar sua jornada no mundo de WindPieces.`,
    )
    .setColor("Random");

  let ClassOptions: ClassInterface[] = [];
  InitialClassMemoryDatabase.forEach((e) => {
    const option = {
      label: e.label,
      value: e.value,
      emoji: e.emoji,
    };
    ClassOptions.push(option);
  });
  if (Class) ClassOptions = Class;

  const rowSelect = new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder({
        customId: "select-class",
        placeholder: "Selecione uma classe",
        options: ClassOptions,
        disabled: Class ? true : false,
      }),
    ],
  });

  return { selects: [rowSelect], embeds: [embed] };
};

const ElementSetup = async () => {
  const embed = new EmbedBuilder()
    .setTitle("Seleção de elemento")
    .setDescription(
      `Selecione um elemento para começar sua jornada no mundo de WindPieces.`,
    )
    .setColor("Random");

  const rowSelect = new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder({
        customId: "select-element",
        placeholder: "Selecione um elemento",
        options: [
          {
            label: "Fogo",
            value: "fire",
            emoji: "🔥",
          },
          {
            label: "Água",
            value: "water",
            emoji: "💧",
          },
          {
            label: "Terra",
            value: "earth",
            emoji: "🌿",
          },
          {
            label: "Ar",
            value: "air",
            emoji: "💨",
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

const registerUser = async (interaction: any) => {
  const option = CollectionClass.get(interaction.user.id);
  if (!option) return;
  const InitialClass = InitialClassMemoryDatabase.find(
    (e) => e.value === option.value,
  );
  const element = CollectionElement.get(interaction.user.id);
  await UserModel.create({
    userID: interaction.user.id,
    guildID: interaction.guildId,
    class: option.value,
    element,
    weapon: InitialClass?.weapon,
    physicalPower: InitialClass?.physicalPower,
    magicalPower: InitialClass?.magicalPower,
    defense: InitialClass?.defense,
    speed: InitialClass?.speed,
    local: "initial",
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
  await interaction.reply({
    components: [],
    embeds: [embed],
  });
};

const randomNumber = (min: number, max: number, exception?: Number[]) => {
  let random = Math.floor(Math.random() * (max - min + 1)) + min;
  if (exception && exception.includes(random)) {
    randomNumber(min, max, exception);
  } else {
    return random;
  }
};
