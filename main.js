const { exec } = require('child_process');
play_audio("Z:\\vscode\\selfbot\\start.mp3", "0.04", 152)
const { Client } = require('discord.js-selfbot-v13');
const client = new Client();
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const squawkFile = 'current_squawk';
fs.writeFileSync("Departure.yaml", "-----------------------------------\nDeparting\n-----------------------------------\n");
fs.writeFileSync("Arrival.yaml", `-----------------------------------\nArriving\n${'-' .repeat(35)}`);

function play_audio(audioFile, volume, start_at = 0, kill_prev = false) {

  let command = `ffplay -autoexit -nodisp -loglevel panic -ss ${start_at} -af "volume=${volume}" "${audioFile}"`;
  if (kill_prev != true) {
    run(command)
  } else {
    run("taskkill /IM ffplay.exe /F")
    setTimeout(() => {
      run(command);
    }, 50);
  }

  function run(command) {
    exec(command, (err) => {
      
    });
  }
}


function ICAO_to_name_converter(flightPlan) {
  const replaceDict = {
    'ITKO': 'Tokyo Intl.',
    'IDCS': 'Saba',
    'IPPH': 'Perth Intl.',
    'ILKL': 'Lukla',
    'IGRV': 'Grindavik',
    'IZOL': 'Izlirani Intl.',
    'ISCM': 'Scampton',
    'IJAF': 'Al Najaf',
    'IIAB': 'McConnell AFB',
    'IBAR': 'Barra',
    'IHEN': 'Henstridge',
    'ILAR': 'Larnaca Intl.',
    'IPAP': 'Paphos Intl.',
    'IBTH': 'Saint Barthélemy',
    'IUFO': 'UFO Base',
    'ISAU': 'Sauthemptona',
    'ISKP': 'Skopelos',
    'IMLR': 'Mellor Intl.',
    'ITRC': 'Training Centre',
    'IGAR': 'Air Base Garry',
    'IBLT': 'Boltic Airfield',
    'IRFD': 'Greater Rockford'
  };
  
  for (const [key, value] of Object.entries(replaceDict)) {
    flightPlan = flightPlan.replace(new RegExp(`${key}`, 'g'), value);
  }
  return flightPlan
}

// Define organiseFlightPlans function after updating the squawk file
function organiseFlightPlans(flightPlan, airport, squawkFile, incrementSquawkBy) {

    // Check if "Departing: ITKO" is present in the flight plan
  if (flightPlan.includes(`Departing: ${airport}`) && config.listen_to_departure == "True") {
    play_audio('Z:\\vscode\\selfbot\\ping.mp3', "0.02")
    flightPlan = ICAO_to_name_converter(flightPlan)
    console.log("Departure")
    const outputFileName = "Departure.yaml";

    // Read existing content from the output file
    let outputContent = fs.readFileSync(outputFileName, 'utf-8');
    // Get and update the Squawk Code from the file
    const currentSquawk = getCurrentSquawk(squawkFile);
    const squawkCode = getUpdatedSquawkCode(flightPlan, currentSquawk, incrementSquawkBy);

    // Save the updated Squawk Code back to the file
    if ( squawkCode != 1200) {
      saveCurrentSquawk(squawkFile, squawkCode);
    }
    
    outputContent = outputContent + `${flightPlan.trim()}\nRunway: ${config.default_runway}\nDeparture is with: ${config.departure_is_with}\nSquawk Code: ${squawkCode}\n\n`
    fs.writeFileSync(outputFileName, outputContent.replace(/.*Departing:.*\n?/, '').replace("Arriving", "Destination").replace(/.*Aircraft:.*\n?/, '').replace("Route: N/A", "Route: GPS Direct"));
  } else if (flightPlan.includes(`Arriving: ${airport}`) && config.listen_to_arrival == "True") {
    play_audio('Z:\\vscode\\selfbot\\ping.mp3', "0.02")
    flightPlan = ICAO_to_name_converter(flightPlan)
    console.log("Arrival")
    const outputFileName = "Arrival.yaml";
    let outputContent = fs.readFileSync(outputFileName, 'utf-8');
    outputContent += `\n${flightPlan}\n`;
    fs.writeFileSync(outputFileName, outputContent.replace("Route: N/A", "Route: GPS Direct"));
  }
    
}

function getCurrentSquawk(squawkFile) {
    try {
        return parseInt(fs.readFileSync(squawkFile, 'utf-8').trim());
    } catch (error) {
        console.error(`Error reading squawk file: ${error}`);
        return 0; // Default to 0 if the file doesn't exist or has an issue
    }
}

function saveCurrentSquawk(squawkFile, squawkCode) {
    try {
        fs.writeFileSync(squawkFile, squawkCode.toString());
    } catch (error) {
        console.error(`Error saving squawk file: ${error}`);
    }
}

function getUpdatedSquawkCode(flightPlan, currentSquawk, incrementBy) {
    // Increment squawk code
    let newSquawk = currentSquawk + incrementBy;

    // Replace missing digits with "0"
    newSquawk = newSquawk.toString().padStart(4, '1');

    while (newSquawk.includes('7')) {
      newSquawk = newSquawk.replace(/(\d)7/g, (_, digitBefore) => {
        const incrementedDigit = String(Number(digitBefore) + 1);
        return incrementedDigit + '0';
      });
    }

    // Remove extra digits if it's above 4 digits
    newSquawk = newSquawk % 10000;
    
    if (flightPlan.includes(`VFR`)){
      return 1200;
    } else {
      return newSquawk;
    }

}

// Manually set the airport variable
const airport = config.airport;

client.on('ready', () => {
  console.log(`${client.user.username}, flight plan hunting is operational!`);
  play_audio("Z:\\vscode\\selfbot\\ready.mp3", "0.06", 0, true)

  const guildId = config.guildId;
  const channelId = config.channelId;

  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    console.error(`Guild with ID ${guildId} not found.`);
    return;
  }

  const channel = guild.channels.cache.get(channelId);

  if (!channel || channel.type !== 'GUILD_TEXT') {
    console.error(`Text channel with ID ${channelId} not found.`);
    return;
  }

  client.on('messageCreate', (message) => {
    if (message.channel.id === channelId && message.content.includes(airport)) {
      // Extract user ID from the first line of message.content
      const userIdMatch = message.content.match(/Username: <@(\d+)>/);
  
      if (userIdMatch && userIdMatch[1]) {
        const userId = userIdMatch[1];
  
        // Fetch the user object using the user ID
        const user = client.users.cache.get(userId);
  
        if (user) {
          let flightPlan = message.content
          let flightPlanLinesArray = flightPlan.split('\n');
          flightPlanLinesArray.pop();
          flightPlan = flightPlanLinesArray.join('\n');

          organiseFlightPlans(flightPlan.replace(/^.*\n?/, `Username: @${user.username}\n`), airport, squawkFile, config.increment_squawk_by);

        } else {
          console.error(`User with ID ${userId} not found.`);
        }
      } else {
        console.error('User ID not found in the message content.');
      }
    }
  });
  
});

client.login('NjkwNTg3NTQwNDMxODMxMTM0.G-pObR.BT-k3_mWPmN_3CfdoA5pyVKanFx4_P8BEeXqgg');
