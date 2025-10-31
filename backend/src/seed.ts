import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import phLocations from 'ph-locations';

const prisma = new PrismaClient();

interface PhProvince {
  code: string;
  name: string;
  altName: string | null;
  nameTL: string;
  region: string;
}

interface PhCity {
  name: string;
  fullName: string;
  altName: string | null;
  province: string | null;
  classification: string;
  isCapital: boolean;
}

const provinces = phLocations.provinces as PhProvince[];
const citiesMunicipalities = phLocations.citiesMunicipalities as PhCity[];

function getAllProvinces(): string[] {
  const regularProvinces = provinces.map((p) => p.name);
  const ncrCities = citiesMunicipalities.filter((c) => c.province === null);

  if (ncrCities.length > 0) {
    return ['Metro Manila', ...regularProvinces];
  }

  return regularProvinces;
}

function getCitiesByProvince(provinceName: string): string[] {
  if (provinceName === 'Metro Manila') {
    return citiesMunicipalities
      .filter((c) => c.province === null)
      .map((c) => c.name);
  }

  const province = provinces.find((p) => p.name === provinceName);
  if (!province) {
    return [];
  }

  return citiesMunicipalities
    .filter((c) => c.province === province.code)
    .map((c) => c.name);
}

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

const popularProvinces = [
  'Metro Manila',
  'Cebu',
  'Davao del Sur',
  'Rizal',
  'Cavite',
  'Laguna',
  'Bulacan',
  'Pampanga',
  'Benguet',
  'Iloilo',
  'Negros Occidental',
  'Palawan'
];

function getRandomLocation(): { province: string; city: string } {
  const province = randomItem(popularProvinces);
  const cities = getCitiesByProvince(province);
  const city = cities.length > 0 ? randomItem(cities) : province;
  return { province, city };
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomAge(): number {
  return Math.floor(Math.random() * 14) + 22;
}

async function createUser(name: string, gender: string) {
  const lookingForGenders = gender === 'Men' ? ['Women'] : ['Men'];
  const age = randomAge();
  const bio = randomItem(bioTemplates);
  const { province, city } = getRandomLocation();
  const photoUrl = `https://i.pravatar.cc/300?u=${name.toLowerCase()}`;
  const photos = [
    photoUrl,
    `https://i.pravatar.cc/300?u=${name.toLowerCase()}-2`,
    `https://i.pravatar.cc/300?u=${name.toLowerCase()}-3`
  ];
  
  const passwordHash = await bcrypt.hash('password123', 10);
  const email = `${name.toLowerCase()}@forkeep.app`;
  const birthday = new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

  return prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash,
      name,
      age,
      birthday,
      showBirthday: false,
      gender,
      lookingForGenders,
      bio,
      photoUrl,
      photos,
      province,
      city,
      updatedAt: new Date()
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
    const user = await createUser(name, 'Men');
    users.push(user);
    console.log(`  ✓ Created male user: ${name} (${user.age}, ${user.city})`);
  }

  for (const name of femaleNames) {
    const user = await createUser(name, 'Women');
    users.push(user);
    console.log(`  ✓ Created female user: ${name} (${user.age}, ${user.city})`);
  }

  console.log(`\n✅ Created ${users.length} users\n`);

  console.log('💘 Creating sample swipes and matches...');
  let swipeCount = 0;
  let matchCount = 0;

  for (let i = 0; i < 20; i++) {
    const swiper = randomItem(users);
    const swiperPreference = swiper.gender === 'Male' ? 'Female' : 'Male';
    const potentialMatches = users.filter(
      u => u.id !== swiper.id && u.gender === swiperPreference
    );
    
    if (potentialMatches.length > 0) {
      const swiped = randomItem(potentialMatches);
      const direction = Math.random() > 0.3 ? 'right' : 'left';
      
      try {
        await prisma.swipe.create({
          data: {
            id: randomUUID(),
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
      id: randomUUID(),
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
