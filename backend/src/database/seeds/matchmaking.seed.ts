import { DataSource } from 'typeorm';
import { Match, MatchStatus } from '../../matchmaking/entities/match.entity';
import { MatchCriteria } from '../../matchmaking/entities/match-criteria.entity';
import { User } from '../../users/entities/user.entity';

export const seedMatchmaking = async (dataSource: DataSource): Promise<void> => {
  const matchRepository = dataSource.getRepository(Match);
  const matchCriteriaRepository = dataSource.getRepository(MatchCriteria);
  const userRepository = dataSource.getRepository(User);

  // Check if matches already exist
  const existingMatchCount = await matchRepository.count();
  if (existingMatchCount > 0) {
    console.log('Matches already seeded, skipping...');
    return;
  }

  // Check if match criteria already exist
  const existingCriteriaCount = await matchCriteriaRepository.count();
  if (existingCriteriaCount > 0) {
    console.log('Match criteria already seeded, skipping...');
    return;
  }

  // Get users
  const users = await userRepository.find();
  if (users.length < 2) {
    console.log('Not enough users to seed matchmaking data, skipping...');
    return;
  }

  console.log('Seeding match criteria...');

  // Create match criteria for each user
  for (const user of users) {
    const criteria = matchCriteriaRepository.create({
      userId: user.id,
      enabled: true,
      minExperienceYears: 0,
      maxExperienceYears: 10,
      desiredSkills: user.skills || [],
      excludedSkills: [],
      industries: user.industries || [],
      locations: user.locations || [],
      remoteOnly: false,
      maxMatchesPerWeek: 5,
      notificationsEnabled: true,
    });

    await matchCriteriaRepository.save(criteria);
  }

  console.log('Seeding matches...');

  // Create some sample matches between users
  const matchesData = [];

  // Create matches between all users (except with themselves)
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i !== j) {
        const initiator = users[i];
        const receiver = users[j];

        // Calculate a random score between 60 and 100
        const score = Math.floor(Math.random() * 41) + 60;

        // Generate random match reasons
        const matchReasons = [];
        
        // Skills match
        if (initiator.skills && receiver.skills && initiator.skills.length > 0 && receiver.skills.length > 0) {
          const sharedSkills = initiator.skills.filter(skill => 
            receiver.skills.includes(skill)
          );
          
          if (sharedSkills.length > 0) {
            matchReasons.push(`Compartilham ${sharedSkills.length} habilidades, incluindo ${sharedSkills.slice(0, 3).join(', ')}`);
          }
        }
        
        // Industry match
        if (initiator.industries && receiver.industries && initiator.industries.length > 0 && receiver.industries.length > 0) {
          const sharedIndustries = initiator.industries.filter(industry => 
            receiver.industries.includes(industry)
          );
          
          if (sharedIndustries.length > 0) {
            matchReasons.push(`Interesse em indústrias similares: ${sharedIndustries.slice(0, 2).join(', ')}`);
          }
        }
        
        // Location match
        if (initiator.locations && receiver.locations && initiator.locations.length > 0 && receiver.locations.length > 0) {
          const sharedLocations = initiator.locations.filter(location => 
            receiver.locations.includes(location)
          );
          
          if (sharedLocations.length > 0) {
            matchReasons.push(`Localizações em comum: ${sharedLocations.slice(0, 2).join(', ')}`);
          }
        }
        
        // Experience level
        if (initiator.experience && receiver.experience) {
          const experienceDifference = Math.abs(initiator.experience - receiver.experience);
          if (experienceDifference <= 2) {
            matchReasons.push(`Nível de experiência similar: ${initiator.experience} e ${receiver.experience} anos`);
          }
        }

        // Add a default reason if none were generated
        if (matchReasons.length === 0) {
          matchReasons.push('Perfis profissionais complementares');
        }

        // Create match with random status
        const statuses = [MatchStatus.PENDING, MatchStatus.ACCEPTED, MatchStatus.REJECTED];
        const randomStatusIndex = Math.floor(Math.random() * 3);
        const status = statuses[randomStatusIndex];

        const match = matchRepository.create({
          initiatorId: initiator.id,
          receiverId: receiver.id,
          score,
          status,
          matchReasons,
          notes: status === MatchStatus.PENDING ? null : 'Exemplo de nota para esta conexão.',
          respondedAt: status === MatchStatus.PENDING ? null : new Date(),
        });

        matchesData.push(match);
      }
    }
  }

  // Save all matches
  await matchRepository.save(matchesData);

  console.log('Matchmaking data seeded successfully!');
};
