const { exec } = require('child_process');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
if (config.enable_start_audio == "True") {
  play_audio("start.mp3", config.start_volume, 152)
}
const process = require('process');
const { Client } = require('discord.js-selfbot-v13');
const getRegionsAlongPath = require("./getRegionsAlongPath.js")
const client = new Client();
const squawkFile = 'current_squawk';
if (config.reset_arrivals_and_departures_on_startup == "True") {
  fs.writeFileSync("Departure.yaml", "-----------------------------------\nDeparting\n-----------------------------------\n");
  fs.writeFileSync("Arrival.yaml", `-----------------------------------\nArriving\n${'-' .repeat(35)}`);
}

const cwd = process.cwd();

const cwdFolders = cwd.split("\\")

if (config.dont_delete_setup != "True") {
  if (cwdFolders[cwdFolders.length - 1] == "src") {
    cwdFolders.pop()
    deleteList = ["/setup.bat", "/setup.sh"]
    deleteList.forEach( file => {
      filePath = cwdFolders.join("/") + file
      if (fs.existsSync(filePath)) {
        console.log("deleted " + filePath)
        fs.unlink(filePath, (err) => {});
      }
    })
  }
}

if (!fs.existsSync(squawkFile)) {
  fs.writeFileSync(squawkFile, "");
}

if (config.renew_squawk_on_startup == "True") {
  saveCurrentSquawk(squawkFile, 1200);
}

function operateOnList(operation, arg2, arg3) {
  if (operation === 'write') {
    // Write operation
    arg3 = `cache_${arg3}`; // Add "cache_" to the start of the filename for writing
    const listString = arg2.join('|||'); // Use a unique separator
    fs.writeFileSync(arg3, listString);
  } else if (operation === 'read') {
    // Read operation
    arg2 = `cache_${arg2}`; // Add "cache_" to the start of the filename for reading
    try {
      const data = fs.readFileSync(arg2, 'utf-8');
      if (data.trim() === '') {
        return []; // Return an empty list if the file is empty
      }
      const list = data.split('|||'); // Split by the unique separator
      return list;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // Return an empty list if the file is not found
      } else {
        console.error(`Error reading file ${arg2}:`, error.message);
        return [];
      }
    }
  } else {
    console.error('Invalid operation type. Please use "read" or "write".');
    return [];
  }
}

function play_audio(audioFile, volume, start_at = 0, kill_prev = false) {
  if(config.enable_audio == "True") {
    let command = `ffplay -autoexit -nodisp -loglevel panic -ss ${start_at} -af "volume=${volume}" "${audioFile}"`;
    if (kill_prev != true) {
      run(command)
    } else {
      run("taskkill /IM ffplay.exe /F")
      setTimeout(() => {
        run(command);
      }, 500);
    }

    function run(command) {
      exec(command, (err) => {
        
      });
    }
  }
}


function ICAO_to_name_converter(flightPlan, airport=false) {
  const replaceDict = {
    'ITKO': 'Tokyo Intl.', 'IDCS': 'Saba', 'IPPH': 'Perth Intl.', 'ILKL': 'Lukla', 'SHV': 'Sea Haven', 'IGRV': 'Grindavik', 'IZOL': 'Izlirani Intl.',
    'ISCM': 'Scampton', 'IJAF': 'Al Najaf', 'IIAB': 'McConnell AFB', 'IBAR': 'Barra', 'IHEN': 'Henstridge', 'ILAR': 'Larnaca Intl.',
    'IPAP': 'Paphos Intl.', 'IBTH': 'Saint Barthélemy', 'IUFO': 'UFO Base', 'ISAU': 'Sauthemptona', 'ISKP': 'Skopelos', 'IMLR': 'Mellor Intl.',
    'ITRC': 'Training Centre', 'IGAR': 'Air Base Garry', 'IBLT': 'Boltic Airfield', 'IRFD': 'Greater Rockford', 'OWO' : 'Waterloo'
  };
  
  for (const [key, value] of Object.entries(replaceDict)) {
    flightPlan = flightPlan.replace(new RegExp(`${key}`, 'g'), value);
  }
  return flightPlan
}

function checkForDuplicateFP(outputContent, username, outputFileName) {

  let outputFileNames = ["Departure.yaml", "Arrival.yaml"]

  outputFileNames.forEach(outputFile => {
    if (outputContent.includes(username)) {
      // If the username is found, remove lines after it until a newline
      const lines = outputContent.split('\n');
      let i
      let numberOfTimes
      lines.forEach((line, index) => {
        if (line.includes(username)) {
          
          if (outputFile == "Departure.yaml") {
            numberOfTimes = 11
          } else if (outputFile == "Arrival.yaml") {
            numberOfTimes = 10
          } else {
            numberOfTimes = 0
          }
          i = index
        }
      })
      lines.splice(i, numberOfTimes)
      if (outputFile == outputFileName) {
        outputContent = lines.join("\n")
      }
    }
  })

  
  return outputContent;
}

// Define organiseFlightPlans function after updating the squawk file
function organiseFlightPlans(flightPlan, airport, squawkFile, incrementSquawkBy, username) {

    // Check if "Departing: ITKO" is present in the flight plan
  if (flightPlan.includes(`Departing: ${airport}`) && config.listen_to_departure == "True") {
    if (config.enable_ping_audio == "True") {
      play_audio('ping.mp3', config.ping_volume)
    }

    ICAO = flightPlan.split("\n")[5].replace("Arriving: ", "")
    flightPlan = ICAO_to_name_converter(flightPlan)
    console.log("Departure")
    const outputFileName = "Departure.yaml";

    // Read existing content from the output file
    let outputContent = fs.readFileSync(outputFileName, 'utf-8');
    let cache_history = operateOnList("read", outputFileName)
    cache_history.push(outputContent)
    if (cache_history.length > 20) {
      cache_history.shift()
    }
    operateOnList("write", cache_history, outputFileName)
    // Get and update the Squawk Code from the file
    const currentSquawk = getCurrentSquawk(squawkFile);
    const squawkCode = getUpdatedSquawkCode(flightPlan, currentSquawk, incrementSquawkBy);

    // Save the updated Squawk Code back to the file
    if ( squawkCode != 1200) {
      saveCurrentSquawk(squawkFile, squawkCode);
    }

    outputContent = checkForDuplicateFP(outputContent, username, outputFileName);

    let regionsAlongPath = getRegionsAlongPath.getRegionsAlongPath(airport, ICAO);
    regionsAlongPath.splice(0, 1)
    let handoffFreq = ""
    regionsAlongPath.forEach((region, index) => {
      handoffFreq += region
      if (regionsAlongPath.length-1 != index) {
        handoffFreq += " => "
      }
    })

    let handoffFreqTitle

    if (regionsAlongPath.length > 1) {
      handoffFreqTitle = "Handoff Frequencies: "
    } else {
      handoffFreqTitle = "Handoff Frequency: "
    }

    let squawkData
    if (config.enable_auto_squawk == "True" && config.enable_auto_squawk_for_departures == "True") {
      squawkData = `\nSquawk Code: ${squawkCode}`
    }

    outputContent = outputContent + `${flightPlan.trim()}\nRunway: ${config.default_departure_runway}\nDeparture is with: ${config.departure_is_with}\n${handoffFreqTitle+handoffFreq}${squawkData}\n\n`.replace(/.*Departing:.*\n?/, '').replace("Arriving", "Destination").replace(/.*Aircraft:.*\n?/, '').replace("Route: N/A", "Route: GPS Direct")
        
  
    fs.writeFileSync(outputFileName, outputContent);
  } else if (flightPlan.includes(`Arriving: ${airport}`) && config.listen_to_arrival == "True") {
    if (config.enable_ping_audio == "True") {
      play_audio('ping.mp3', config.ping_volume)
    }
    flightPlan = ICAO_to_name_converter(flightPlan, airport)
    console.log("Arrival")
    const outputFileName = "Arrival.yaml";
    let outputContent = fs.readFileSync(outputFileName, 'utf-8');
    outputContent = checkForDuplicateFP(outputContent, username, outputFileName);

    const currentSquawk = getCurrentSquawk(squawkFile);
    const squawkCode = getUpdatedSquawkCode(flightPlan, currentSquawk, incrementSquawkBy);

    // Save the updated Squawk Code back to the file
    if ( squawkCode != 1200) {
      saveCurrentSquawk(squawkFile, squawkCode);
    }

    let squawkData
    if (config.enable_auto_squawk == "True" && config.enable_auto_squawk_for_arrivals == "True") {
      squawkData = `\nSquawk Code: ${squawkCode}`
    }

    outputContent += `\n${flightPlan}${squawkData}\n`;
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
  console.clear();
  console.log(`\n${client.user.username} PAWR online, flight plan hunting is operational!`);
  console.log(`Go to http://localhost:${config.port}`)
  if (config.enable_ready_audio == "True") {
    play_audio("ready.mp3", config.ready_volume, 0, true)
  }

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

  client.on('messageCreate', async (message) => {
    if (message.channel.id === channelId && message.content.includes(airport)) {
      // Extract user ID from the first line of message.content
      const userIdMatch = message.content.match(/Username: <@(\d+)>/);
  
      if (userIdMatch && userIdMatch[1]) {
        const userId = userIdMatch[1];
  
        // Fetch the user object using the user ID
        const user = client.users.cache.get(userId);
        const member = await guild.members.fetch(userId);
  
        if (user) {
          let flightPlan = message.content
          let flightPlanLinesArray = flightPlan.split('\n');
          flightPlanLinesArray.pop();
          flightPlan = flightPlanLinesArray.join('\n');

          let username

          if (member.nickname) {
            username = member.nickname
          } else {
            username = user.username
          }

          organiseFlightPlans(flightPlan.replace(/^.*\n?/, `Username: @${username}\n`), airport, squawkFile, config.increment_squawk_by, username);

        } else {
          console.error(`User with ID ${userId} not found.`);
        }
      } else {
        console.error('User ID not found in the message content.');
      }
    }
  });
  
});

client.login(config.token);
