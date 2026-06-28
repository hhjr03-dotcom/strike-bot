const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

const fs = require("fs");
require("dotenv").config();

const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

let strikes = {};
if (fs.existsSync("./strikes.json")) {
  strikes = JSON.parse(fs.readFileSync("./strikes.json", "utf8"));
}

function save() {
  fs.writeFileSync("./strikes.json", JSON.stringify(strikes, null, 2));
}

function get(userId) {
  return strikes[userId] || [];
}

function add(userId, data) {
  if (!strikes[userId]) strikes[userId] = [];
  strikes[userId].push(data);
  save();
}

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const isMod = interaction.member.permissions.has(
    PermissionsBitField.Flags.BanMembers
  );

  if (interaction.commandName === "strike") {
    if (!isMod)
      return interaction.reply({ content: "No permission.", ephemeral: true });

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason";

    add(user.id, {
      reason,
      moderator: interaction.user.tag,
      date: new Date().toISOString()
    });

    const total = get(user.id).length;

    await interaction.reply(
      `${user.tag} now has ${total}/${config.maxStrikes} strikes`
    );

    try {
      await user.send(`You received a strike (${total}/3)\nReason: ${reason}`);
    } catch {}

    if (total >= config.maxStrikes) {
      const member = await interaction.guild.members.fetch(user.id);
      await member.ban({ reason: "3 strikes reached" });

      interaction.followUp(`${user.tag} has been banned.`);
    }
  }

  if (interaction.commandName === "strikes") {
    const list = get(interaction.user.id);
    return interaction.reply(
      `You have ${list.length}/${config.maxStrikes} strikes`
    );
  }

  if (interaction.commandName === "check") {
    if (!isMod)
      return interaction.reply({ content: "No permission.", ephemeral: true });

    const user = interaction.options.getUser("user");
    const list = get(user.id);

    return interaction.reply(
      `${user.tag} has ${list.length}/${config.maxStrikes} strikes`
    );
  }

  if (interaction.commandName === "clear") {
    if (!isMod)
      return interaction.reply({ content: "No permission.", ephemeral: true });

    const user = interaction.options.getUser("user");
    strikes[user.id] = [];
    save();

    return interaction.reply(`${user.tag}'s strikes cleared.`);
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);