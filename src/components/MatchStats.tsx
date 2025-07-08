import { Shot } from '@/types/shot';

const getMatchShots = (matchId: string): Shot[] => {
  const shots = localStorage.getItem('shots');
  return shots ? JSON.parse(shots).filter((shot: Shot) => shot.matchId === matchId) : [];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateMatchStats = (matchId: string) => {
  const matchShots = getMatchShots(matchId);
  const totalShots = matchShots.length;
  const winners = matchShots.filter((shot: Shot) => shot.result === 'point').length;
  const errors = matchShots.filter((shot: Shot) => shot.result === 'miss').length;
  const rallies = matchShots.filter((shot: Shot) => shot.result === 'point' || shot.result === 'miss').length;
  const avgRallyLength = rallies > 0 ? totalShots / rallies : 0;

  return {
    totalShots,
    winners,
    errors,
    rallies,
    avgRallyLength: avgRallyLength.toFixed(1)
  };
}; 