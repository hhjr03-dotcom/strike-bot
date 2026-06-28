const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("strike")
    .setDescription("Give a user a strike")
    .addUserOption(o =>
      o.setName("user")
	.setDescription("User")
	.setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("strikes")
    .setDescription("Check your strikes"),

  new SlashCommandBuilder()
    .setName("check")
    .setDescription("Check a user's strikes")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear a user's strikes")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true)
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("Commands deployed.");
})();