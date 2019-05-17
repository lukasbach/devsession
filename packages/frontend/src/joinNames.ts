export const joinNames: string[] = [
  'Pikachu',
  'Luke Skywalker',
  'Darth Vader',
  'Harry Potter',
  'Hermione Granger',
  'Ron Weasley',
  'Jon Snow',
  'Littlefinger',
  'Danerys Targaryen',
  'Rick Sanchez',
  'Homer Simpson'
];

export const getRandomJoinName = (): string => {
  return joinNames[Math.floor(Math.random() * (joinNames.length))];
};
