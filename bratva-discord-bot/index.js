const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

const ROLE_GROUPS = {
  TURFERI: [
    { name: '🔫 Lider Turf', id: '1290326914363297862' },
    { name: '🔱 Co-Lider Turf', id: '1290325693414248459' },
    { name: '💣 Turfer', id: '1290326262858125426' }
  ],
  MEMBRI: [
    { name: '👑 Lider Bratva', id: '1107100643291828224' },
    { name: '⭐ Co-Lider Bratva', id: '1107099637644529684' },
    { name: '🧪 Tester Bratva', id: '1107098741510520852' },
    { name: '👤 Membru Bratva', id: '1107095888045801532' },
    { name: '🏹 Sageata Bratva', id: '1107093171026010203' }
  ]
};

function calculateDays(joinedAt) {
  const now = new Date();
  const diff = now - joinedAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

client.once('ready', async () => {
  console.log(`✅ Botul ${client.user.tag} este online.`);

  const commands = [
    new SlashCommandBuilder().setName('turferi').setDescription('Afișează membrii cu roluri legate de Turf'),
    new SlashCommandBuilder().setName('membri').setDescription('Afișează membrii cu gradele Bratva')
  ];

  try {
    const guild = client.guilds.cache.first();
    if (guild) {
      await guild.commands.set(commands);
      console.log('✅ Comenzile slash au fost înregistrate.');
    }
  } catch (err) {
    console.error('Eroare la înregistrare comenzi:', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const selectedGroup = commandName === 'turferi' ? ROLE_GROUPS.TURFERI : ROLE_GROUPS.MEMBRI;

    const embed = new EmbedBuilder()
      .setTitle(commandName === 'turferi' ? '🏄 Lista Turferi' : '👥 Lista Membri Bratva')
      .setColor(0x5865F2)
      .setTimestamp();

    let totalCount = 0;
    let fullDescription = '';
    const alreadyListed = new Set();

    for (const role of selectedGroup) {
      const groupMembers = members.filter(member =>
        !alreadyListed.has(member.id) && member.roles.cache.has(role.id)
      );

      if (groupMembers.size > 0) {
        fullDescription += `\n__**${role.name}**__\n`;
        groupMembers.forEach(member => {
          const daysOnServer = calculateDays(member.joinedAt);
          fullDescription += `• ${member.displayName} — ${daysOnServer} zile pe server\n`;
          alreadyListed.add(member.id);
        });
        totalCount += groupMembers.size;
      }
    }

    if (!fullDescription) {
      embed.setDescription('❌ Nu s-au găsit membri cu rolurile respective.');
    } else {
      embed.setDescription(fullDescription);
      embed.setFooter({ text: `Total: ${totalCount} membri` });
    }

    await interaction.reply({ embeds: [embed], ephemeral: false });

  } catch (err) {
    console.error('Eroare la comanda:', err);
    await interaction.reply({ content: '❌ A apărut o eroare!', ephemeral: true });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);