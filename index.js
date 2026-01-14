const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= CONFIG =================
const PREFIX = "$";
const MERCY_ROLE = "Lower Middleman"; // who can use $mercy
const GIVE_ROLE = "Live Viewer";      // role given on YES
// ========================================

const noClicks = new Map();

// ===== BOT READY =====
client.once("ready", () => {
  console.log(`${client.user.tag} is online 😎`);
});

// ================= MESSAGE COMMANDS =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ===== $mercy =====
  if (command === "mercy") {

    // 🔒 ROLE CHECK — SILENT IGNORE
    if (!message.member.roles.cache.some(role => role.name === MERCY_ROLE)) {
      return; // say NOTHING
    }

    const target = message.mentions.users.first();
    if (!target) return;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("mercy_yes")
        .setLabel("YES")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("mercy_no")
        .setLabel("NO")
        .setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({
      content:
        `You've been scammed!\n\n` +
        `We're sincerely sorry we scammed you.\n` +
        `Do you want to join us and become richer than you already are, ` +
        `or do you want to keep losing your stuff?\n\n` +
        `User: ${target}`,
      components: [row]
    });
  }

  // ===== $mminfo =====
  if (command === "mminfo") {
    await message.channel.send(
      "**Middleman Info**\n\n" +
      "• Trusted MM\n" +
      "• No refunds after trade\n" +
      "• Fake proof = instant ban\n" +
      "• MM takes the first person's stuff,then the other person's stuff and then they take what they offered each other!"
    );
  }
});

// ================= BUTTON HANDLER =================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // ===== YES BUTTON =====
  if (interaction.customId === "mercy_yes") {
    const role = interaction.guild.roles.cache.find(
      r => r.name === GIVE_ROLE
    );

    if (!role) {
      return interaction.reply({
        content: `Role **${GIVE_ROLE}** not found.`,
        ephemeral: true
      });
    }

    await interaction.member.roles.add(role);
    await interaction.reply({
      content: `You were given the **${GIVE_ROLE}** role.`,
      ephemeral: true
    });
  }

  // ===== NO BUTTON (2 CLICKS = BAN) =====
  if (interaction.customId === "mercy_no") {
    const userId = interaction.user.id;
    const count = (noClicks.get(userId) || 0) + 1;
    noClicks.set(userId, count);

    if (count >= 2) {
      if (
        interaction.guild.members.me.permissions.has(
          PermissionsBitField.Flags.BanMembers
        )
      ) {
        await interaction.guild.members.ban(userId, {
          reason: "Clicked NO twice on mercy"
        });
      }
    } else {
      await interaction.reply({
        content: "You clicked NO once. Click again = ban.",
        ephemeral: true
      });
    }
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);

