import React from 'react';
import ThoughtMatchGame from '../games/ThoughtMatchGame';
import FollowTheFriendGame from '../games/FollowTheFriendGame';
import GratitudeGardenGame from '../games/GratitudeGardenGame';
import BreathingGame from '../games/BreathingGame';

export default function GamesScreen(){
  return (
    <div style={{ padding:24 }}>
      <h1>Wellness Games</h1>
      <ThoughtMatchGame />
      <FollowTheFriendGame />
      <GratitudeGardenGame />
      <BreathingGame />
    </div>
  )
}
