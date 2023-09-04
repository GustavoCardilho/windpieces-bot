import {
  Client,
  IntentsBitField,
  BitFieldResolvable,
  GatewayIntentsString,
  Partials,
  Collection,
  ApplicationCommandDataResolvable,
  ClientEvents,
} from "discord.js";
import {
  CommandType,
  ComponentsButton,
  ComponentsModal,
  ComponentsSelect,
} from "./types/command";
import fs from "fs";
import path from "path";
import { EventType } from "./types/event";
import { tokenDiscord } from "..";

const fileCondition = (fileName: string) =>
  fileName.endsWith(".ts") || fileName.endsWith(".js");
export class ExtendedClient extends Client {
  public commands: Collection<string, CommandType> = new Collection();
  public buttons: ComponentsButton = new Collection();
  public selects: ComponentsSelect = new Collection();
  public modals: ComponentsModal = new Collection();

  constructor() {
    super({
      intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<
        GatewayIntentsString,
        number
      >[],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.User,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
      ],
    });
  }

  public async start(): Promise<string> {
    this.registerModules();
    this.registerEvents();
    await this.login(tokenDiscord);
    return this.user?.tag ?? "Unknown";
  }

  private registerCommands(commands: Array<ApplicationCommandDataResolvable>) {
    this.application?.commands
      .set(commands)
      .then((cmds) => {
        console.log(`✅ Registered ${cmds.size} commands`.green);
      })
      .catch((err) => {
        console.log(`❌ Failed to register commands: ${err}`.red);
      });
  }

  private registerModules() {
    const slashCommands: Array<ApplicationCommandDataResolvable> = new Array();

    const commandsPath = path.join(__dirname, "..", "commands");

    fs.readdirSync(commandsPath).forEach((local) => {
      fs.readdirSync(commandsPath + `/${local}/`)
        .filter(fileCondition)
        .forEach(async (fileName) => {
          const command: CommandType = (
            await import(`../commands/${local}/${fileName}`)
          )?.default;
          const { name, buttons, selects, modals } = command;

          if (name) {
            this.commands.set(name, command);
            slashCommands.push(command);

            if (buttons)
              buttons.forEach((run, key) => this.buttons.set(key, run));
            if (selects)
              selects.forEach((run, key) => this.selects.set(key, run));
            if (modals) modals.forEach((run, key) => this.modals.set(key, run));
          }
        });
    });

    this.on("ready", () => this.registerCommands(slashCommands));
  }

  private registerEvents() {
    const eventsPath = path.join(__dirname, "..", "events");

    fs.readdirSync(eventsPath).forEach((local) => {
      fs.readdirSync(`${eventsPath}/${local}`)
        .filter(fileCondition)
        .forEach(async (fileName) => {
          const { name, once, run }: EventType<keyof ClientEvents> = (
            await import(`../events/${local}/${fileName}`)
          )?.default;

          try {
            if (name) once ? this.once(name, run) : this.on(name, run);
          } catch (error) {
            console.log(`An error occurred on event: ${name} \n${error}`.red);
          }
        });
    });
  }
}
