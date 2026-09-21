// Fixed order — colors stay pinned to a restaurant regardless of how the
// chart or list happens to sort them, so identity never depends on rank.
export const RESTAURANTS = [
  { name: 'Kebap Express', color: '#c1440e' },
  { name: 'Mr Kebap', color: '#e8a23d' },
  { name: 'Traum Cafe', color: '#2e7d4f' },
  { name: 'Pizza Mega', color: '#3a5ba0' },
];

export const RESTAURANT_NAMES = RESTAURANTS.map((r) => r.name);
