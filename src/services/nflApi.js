import axios from 'axios';

const ESPN_NFL_API = 'https://site.web.api.espn.com/apis/site/v2/sports/football/nfl';

export const fetchNFLGames = async (mode = 'previous', week = 1) => {
  try {
    // Calculate dates based on mode
    const today = new Date();
    const currentYear = today.getFullYear();
    
    let apiUrl;
    
    if (mode === 'previous') {
      // Get scoreboard for completed games
      apiUrl = `${ESPN_NFL_API}/scoreboard`;
    } else {
      // Get upcoming games
      apiUrl = `${ESPN_NFL_API}/scoreboard`;
    }

    const response = await axios.get(apiUrl, {
      params: {
        limit: 50,
        week: week,
        seasontype: 2, // Regular season
        year: currentYear
      }
    });

    const events = response.data?.events || [];
    
    // Filter games based on mode
    const filteredGames = events.filter(game => {
      const gameStatus = game.status?.type?.name;
      
      if (mode === 'previous') {
        return gameStatus === 'STATUS_FINAL' || gameStatus === 'STATUS_IN_PROGRESS';
      } else {
        return gameStatus === 'STATUS_SCHEDULED' || gameStatus === 'STATUS_POSTPONED';
      }
    });

    return filteredGames;
    
  } catch (error) {
    console.error("Error fetching NFL games:", error);
    
    // Return mock data for demonstration if API fails
    return generateMockGames(mode, week);
  }
};

// Mock data generator for demonstration purposes
const generateMockGames = (mode, week) => {
  const teams = [
    { name: 'Kansas City Chiefs', abbreviation: 'KC', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png' },
    { name: 'Buffalo Bills', abbreviation: 'BUF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png' },
    { name: 'Dallas Cowboys', abbreviation: 'DAL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png' },
    { name: 'Green Bay Packers', abbreviation: 'GB', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png' },
    { name: 'San Francisco 49ers', abbreviation: 'SF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png' },
    { name: 'New England Patriots', abbreviation: 'NE', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png' }
  ];

  const mockGames = [];
  const baseDate = new Date();
  
  for (let i = 0; i < 8; i++) {
    const homeTeam = teams[Math.floor(Math.random() * teams.length)];
    let awayTeam = teams[Math.floor(Math.random() * teams.length)];
    
    // Ensure different teams
    while (awayTeam.abbreviation === homeTeam.abbreviation) {
      awayTeam = teams[Math.floor(Math.random() * teams.length)];
    }

    const gameDate = new Date(baseDate);
    gameDate.setDate(baseDate.getDate() + (mode === 'previous' ? -i - 1 : i + 1));

    const homeScore = mode === 'previous' ? Math.floor(Math.random() * 35) + 7 : null;
    const awayScore = mode === 'previous' ? Math.floor(Math.random() * 35) + 7 : null;

    mockGames.push({
      id: `mock-${i}`,
      date: gameDate.toISOString(),
      status: {
        type: {
          name: mode === 'previous' ? 'STATUS_FINAL' : 'STATUS_SCHEDULED'
        }
      },
      competitions: [{
        competitors: [
          {
            homeAway: 'home',
            team: {
              displayName: homeTeam.name,
              abbreviation: homeTeam.abbreviation,
              logo: homeTeam.logo
            },
            score: homeScore
          },
          {
            homeAway: 'away', 
            team: {
              displayName: awayTeam.name,
              abbreviation: awayTeam.abbreviation,
              logo: awayTeam.logo
            },
            score: awayScore
          }
        ],
        venue: {
          fullName: `${homeTeam.name} Stadium`
        }
      }]
    });
  }

  return mockGames;
};
