import { Player } from '../types/player';
import { Shot } from '../types/shot';

export const calculatePlayerStats = (player: Player, shots: Shot[]) => {
  const playerShots = shots.filter(shot => shot.hitPlayer === player.id);
  const totalShots = playerShots.length;
  const rearShots = playerShots.filter(shot => ['LR', 'CR', 'RR'].includes(shot.hitArea));
  const totalRearShots = rearShots.length;
  const winners = rearShots.filter(shot => shot.result === 'point').length;
  const missShots = rearShots.filter(shot => shot.result === 'miss').length;
  const totalMidShots = playerShots.filter(shot => ['LM', 'CM', 'RM'].includes(shot.hitArea)).length;
  const totalFrontShots = playerShots.filter(shot => ['LF', 'CF', 'RF'].includes(shot.hitArea)).length;

  return {
    totalShots,
    rearRate: totalShots > 0 ? (totalRearShots / totalShots) * 100 : 0,
    midRate: totalShots > 0 ? (totalMidShots / totalShots) * 100 : 0,
    frontRate: totalShots > 0 ? (totalFrontShots / totalShots) * 100 : 0,
    pointRate: totalRearShots > 0 ? ((winners / totalRearShots) * 100).toFixed(1) : '0.0',
    missRate: totalRearShots > 0 ? ((missShots / totalRearShots) * 100).toFixed(1) : '0.0'
  };
}; 