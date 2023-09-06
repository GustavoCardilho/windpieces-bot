import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/command";
import { GuildModel } from "../../models/GuildModel";

export default new Command({
name: "guild",
description: "Registrar o servidor ao WindPieces",
type: ApplicationCommandType.ChatInput,
async run({ interaction, client, options }) {
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
const teste = await GuildModel.create({
guildID: guildId,
ownerID: guildOwnerId,
});
interaction.reply({
ephemeral: true,
content: `Servidor registrado com sucesso.`,
});
} catch (err) {
console.log(err);
}
},
});
