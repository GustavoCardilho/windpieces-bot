import { describe, expect, it, test } from "vitest";
import { z } from "zod";

/* ARQUIVOS DOS COMANDOS */
import ping from "../../commands/common/ping";
import redisRead from "../../commands/common/redis-read";
import redisReadAll from "../../commands/common/redis-readall";
import redisRegister from "../../commands/common/redis-register";
import guild from "../../commands/common/guild";

class CommandClass {
  private name!: string;
  private description!: string;
  private type!: number;
  private run!: Function | Promise<Function>;

  constructor(props: CommandClass) {
    Object.assign(this, props);
  }

  public async validate(): Promise<boolean> {
    try {
      const commandSchema = z.object({
        name: z.string(),
        description: z.string(),
        type: z.number(),
        run: z.function(),
      });
      commandSchema.parse(this);

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

describe("should return the correct number of commands", async () => {
  const allCommands = [ping, redisRead, redisReadAll, redisRegister, guild];

  allCommands.forEach(async (command) => {
    test(`should return the correct number of commands`, async () => {
      let result: boolean = true;
      const commandClass = new CommandClass(command as CommandClass);
      const verifyCommand = await commandClass.validate();
      result = verifyCommand;
      expect(result).toBe(true);
    });
  });
});
