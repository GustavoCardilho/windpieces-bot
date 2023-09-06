import { client } from "../..";
import { Event } from "../../structs/types/event";

export default new Event({
  name: "guildMemberAdd",
  run(interaction) {
    console.log("oi");
  },
});
