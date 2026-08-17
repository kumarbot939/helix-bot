const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits,
    ActivityType 
} = require('discord.js');

// Bot istemcisini tüm gerekli yetkilerle (Presences dahil) başlatıyoruz
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences // Aktivite/İzliyor takibi için şart
    ]
});

// Sadece Bu ID Komutu Kullanabilir
const AUTHORIZED_USER_ID = '1539010048796131510';

// Slash Komut Tanımı
const commands = [
    new SlashCommandBuilder()
        .setName('klan-sorgu')
        .setDescription('Bir kullanıcının klan/ekip bilgilerini sorgular.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Sorgulanacak Discord Kullanıcı ID\'si')
                .setRequired(true))
].map(command => command.toJSON());

// Bot Hazır Olduğunda
client.once('ready', async () => {
    console.log(`[+] ${client.user.tag} olarak giriş yapıldı!`);

    // Botun "İzliyor..." Durumunu Ayarlama
    client.user.setActivity('HELIX V11', { type: ActivityType.Watching });

    // Slash Komutlarını Discord API'ye Kaydetme
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('[+] Slash komutları kaydediliyor...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('[+] Slash komutları başarıyla yüklendi!');
    } catch (error) {
        console.error('[-] Komut yükleme hatası:', error);
    }
});

// Üye Durum/Aktivite Değişimlerini İzleme (Oynuyor / İzliyor Takibi)
client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.user) return;

    // Örnek: Üyelerin durumunda/aktivitesinde bir şey değiştiğinde konsola veya kanala loglayabilirsiniz
    const activities = newPresence.activities;
    if (activities.length > 0) {
        const customStatus = activities.find(act => act.type === ActivityType.Custom);
        if (customStatus && customStatus.state) {
            // Kullanıcının özel durumunda (Custom Status) bir kelime aratmak isterseniz burayı kullanabilirsiniz
            // Console log örneği:
            // console.log(`${newPresence.user.tag} durumu değiştirdi: ${customStatus.state}`);
        }
    }
});

// Interaction (Slash Komut) Dinleyicisi
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'klan-sorgu') {
        // ID Kontrolü
        if (interaction.user.id !== AUTHORIZED_USER_ID) {
            return interaction.reply({
                content: '❌ Bu komutu kullanma yetkiniz bulunmamaktadır.',
                ephemeral: true
            });
        }

        const userId = interaction.options.getString('id');
        await interaction.deferReply();

        let foundGuilds = [];

        // Botun bulunduğu tüm sunucuları tara
        for (const guild of client.guilds.cache.values()) {
            try {
                const member = await guild.members.fetch(userId).catch(() => null);
                if (member) {
                    const roles = member.roles.cache
                        .filter(r => r.id !== guild.id)
                        .map(r => r.name);

                    const owner = await guild.fetchOwner();

                    // Kullanıcının anlık durumu (Online/Offline/Idle/DND)
                    const status = member.presence ? member.presence.status : 'offline';

                    foundGuilds.push({
                        guildName: guild.name,
                        guildOwner: owner.user.tag,
                        createdDate: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                        roles: roles.length > 0 ? roles.join(', ') : 'Özel klan/ekip rolü yok',
                        userStatus: status
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (foundGuilds.length === 0) {
            return interaction.editReply({ 
                content: `❌ \`${userId}\` ID'li kullanıcı botun bulunduğu hiçbir sunucuda bulunamadı.` 
            });
        }

        const user = await client.users.fetch(userId).catch(() => null);

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('🔎 Klan & Ekip Sorgu Sonucu')
            .setDescription(`**Sorgulanan Kullanıcı:** ${user ? user.tag : userId} (\`${userId}\`)`)
            .setFooter({ text: 'HELIX V11 Klan Sorgu Sistemi' })
            .setTimestamp();

        if (user) {
            embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
        }

        foundGuilds.forEach(data => {
            embed.addFields({
                name: `🏰 Sunucu / Klan: ${data.guildName}`,
                value: `• **Klan/Ekip Sahibi:** ${data.guildOwner}\n• **Klan Kuruluş:** ${data.createdDate}\n• **Durum:** \`${data.userStatus}\`\n• **Kullanıcı Rolleri:** ${data.roles}`,
                inline: false
            });
        });

        await interaction.editReply({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);