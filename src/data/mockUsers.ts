export interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  photoUrl: string;
  photos?: string[];
  location?: string;
  prompts: Array<{
    question: string;
    answer: string;
  }>;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 26,
    gender: 'Woman',
    bio: 'Coffee enthusiast, bookworm, and weekend hiker',
    photoUrl: 'https://i.pravatar.cc/400?img=1',
    prompts: [
      {
        question: 'A small thing that makes my day is...',
        answer: 'Finding the perfect playlist for my mood',
      },
      {
        question: 'I geek out on...',
        answer: 'Indie music festivals and discovering new artists',
      },
      {
        question: 'My ideal Sunday morning...',
        answer: 'Farmers market, then reading in the park',
      },
    ],
  },
  {
    id: '2',
    name: 'Alex',
    age: 28,
    gender: 'Non-binary',
    bio: 'Product designer who loves cooking and photography',
    photoUrl: 'https://i.pravatar.cc/400?img=12',
    prompts: [
      {
        question: 'A small thing that makes my day is...',
        answer: 'The smell of fresh bread baking',
      },
      {
        question: 'I geek out on...',
        answer: 'Typography and the history of fonts',
      },
      {
        question: 'My ideal Sunday morning...',
        answer: 'Cooking brunch for friends',
      },
    ],
  },
  {
    id: '3',
    name: 'Maya',
    age: 24,
    gender: 'Woman',
    bio: 'Aspiring novelist and cat mom',
    photoUrl: 'https://i.pravatar.cc/400?img=5',
    prompts: [
      {
        question: 'A small thing that makes my day is...',
        answer: 'When my cat actually sits on my lap',
      },
      {
        question: 'I geek out on...',
        answer: 'Fantasy world-building and magic systems',
      },
      {
        question: 'My ideal Sunday morning...',
        answer: 'Writing at a cozy café',
      },
    ],
  },
];
