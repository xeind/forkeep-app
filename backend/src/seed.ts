import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const maleNames = [
  'Alex', 'Ben', 'Chris', 'Daniel', 'Ethan',
  'Felix', 'Gabriel', 'Henry', 'Isaac', 'Jack',
  'Kyle', 'Liam', 'Mason', 'Noah', 'Owen'
];

const femaleNames = [
  'Ava', 'Bella', 'Chloe', 'Diana', 'Emma',
  'Fiona', 'Grace', 'Hannah', 'Ivy', 'Jade',
  'Kate', 'Luna', 'Mia', 'Nina', 'Olivia'
];

const bioTemplates = [
  'Coffee enthusiast ☕ | Love hiking and exploring new trails 🏔️',
  'Foodie on a mission to find the best tacos 🌮 | Dog parent 🐕',
  'Weekend warrior 🎯 | Into photography and live music 📸🎵',
  'Yoga instructor by day, Netflix binger by night 🧘‍♀️📺',
  'Adventure seeker ✈️ | Scuba diving, rock climbing, skydiving!',
  'Artist and creative soul 🎨 | Always down for gallery hopping',
  'Tech geek who loves board games 🎲 | Let\'s grab craft beer 🍺',
  'Bookworm 📚 | Looking for someone to discuss plot twists with',
  'Fitness junkie 💪 | Marathon runner training for my 5th race',
  'Amateur chef experimenting with fusion cuisine 👨‍🍳',
  'Music festival lover 🎪 | Vinyl collector and concert goer',
  'Ocean lover 🌊 | Surfing, sailing, or just beach walks',
  'Traveler with 30 countries checked off my list ✈️',
  'Comedy show regular 🎭 | Life\'s too short not to laugh',
  'Environmental activist 🌱 | Passionate about sustainability',
  'Movie buff 🎬 | Classic films and indie cinema enthusiast',
  'Dancer at heart 💃 | Salsa, bachata, and everything in between',
  'Mountain biker seeking trail buddies 🚵',
  'Brunch connoisseur 🥞 | Mimosas are my love language',
  'Gamer and anime fan 🎮 | Looking for my player two',
  'Podcast addict 🎙️ | Always have recommendations to share',
  'Night owl who loves stargazing 🌟 | Astrophotography hobby',
  'Plant parent with 47 succulents 🌵 | Send help',
  'Spontaneous road tripper 🚗 | No GPS, just vibes',
  'Karaoke champion 🎤 | Warning: I take it seriously',
  'Whiskey enthusiast 🥃 | Exploring distilleries is my thing',
  'Beach volleyball player 🏐 | Competitive but fun!',
  'Meditation and mindfulness practitioner 🧘',
  'Food truck chaser 🚚 | Know any hidden gems?',
  'DIY home renovator 🔨 | HGTV is my guilty pleasure'
];

const locations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Austin, TX',
  'Seattle, WA',
  'Denver, CO',
  'Portland, OR',
  'San Francisco, CA',
  'Miami, FL',
  'Boston, MA'
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomAge(): number {
  return Math.floor(Math.random() * 14) + 22;
}

async function createUser(name: string, gender: string) {
  const lookingFor = gender === 'male' ? 'female' : 'male';
  const age = randomAge();
  const bio = randomItem(bioTemplates);
  const location = randomItem(locations);
  const photoUrl = `https://i.pravatar.cc/300?u=${name.toLowerCase()}`;
  const photos = [
    photoUrl,
    `https://i.pravatar.cc/300?u=${name.toLowerCase()}-2`,
    `https://i.pravatar.cc/300?u=${name.toLowerCase()}-3`
  ];
  
  const passwordHash = await bcrypt.hash('password123', 10);
  const email = `${name.toLowerCase()}@forkeep.app`;

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      age,
      gender,
      lookingFor,
      bio,
      photoUrl,
      photos,
      location
    }
  });
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  console.log('🗑️  Clearing existing data...');
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\n');

  console.log('👥 Creating users...');
  const users = [];

  for (const name of maleNames) {
    const user = await createUser(name, 'male');
    users.push(user);
    console.log(`  ✓ Created male user: ${name} (${user.age}, ${user.location})`);
  }

  for (const name of femaleNames) {
    const user = await createUser(name, 'female');
    users.push(user);
    console.log(`  ✓ Created female user: ${name} (${user.age}, ${user.location})`);
  }

  console.log(`\n✅ Created ${users.length} users\n`);

  console.log('💘 Creating sample swipes and matches...');
  let swipeCount = 0;
  let matchCount = 0;

  for (let i = 0; i < 20; i++) {
    const swiper = randomItem(users);
    const potentialMatches = users.filter(
      u => u.id !== swiper.id && u.gender === swiper.lookingFor
    );
    
    if (potentialMatches.length > 0) {
      const swiped = randomItem(potentialMatches);
      const direction = Math.random() > 0.3 ? 'right' : 'left';
      
      try {
        await prisma.swipe.create({
          data: {
            swiperId: swiper.id,
            swipedId: swiped.id,
            direction
          }
        });
        swipeCount++;

        if (direction === 'right') {
          const reverseSwipe = await prisma.swipe.findUnique({
            where: {
              swiperId_swipedId: {
                swiperId: swiped.id,
                swipedId: swiper.id
              }
            }
          });

          if (reverseSwipe && reverseSwipe.direction === 'right') {
            const [user1Id, user2Id] = swiper.id < swiped.id 
              ? [swiper.id, swiped.id]
              : [swiped.id, swiper.id];

            await prisma.match.create({
              data: {
                user1Id,
                user2Id
              }
            });
            matchCount++;
            console.log(`  💕 Match created: ${swiper.name} & ${swiped.name}`);
          }
        }
      } catch (error) {
        // Skip duplicate swipes
      }
    }
  }

  console.log(`\n✅ Created ${swipeCount} swipes and ${matchCount} matches\n`);
  
  console.log('🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Swipes: ${swipeCount}`);
  console.log(`  - Matches: ${matchCount}`);
  console.log('\n💡 Test credentials:');
  console.log(`  Email: alex@forkeep.app`);
  console.log(`  Password: password123`);
  console.log('\n  (All users have password: password123)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
