const fs = require('fs');
// Read configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const airport = config.airport;
const squawkFile = 'current_squawk'; // Adjust the file path as needed

// Update the squawk file with config.start_squawk
saveCurrentSquawk(squawkFile, config.start_squawk);

// Define organiseFlightPlans function after updating the squawk file
function organiseFlightPlans(flightPlan, airport, squawkFile, incrementSquawkBy) {
    const outputFileName = "output.yaml";

    // Read existing content from the output file
    let outputContentOld = fs.readFileSync(outputFileName, 'utf-8');
    outputContent = outputContentOld.replace("-----------------------------------\nDeparting\n-----------------------------------\n", "");

    // Check if "Departing: ITKO" is present in the flight plan
    if (flightPlan.includes(`Departing: ${airport}`)) {
        console.log("Departure")
        // Get and update the Squawk Code from the file
        const currentSquawk = getCurrentSquawk(squawkFile);
        const squawkCode = getUpdatedSquawkCode(currentSquawk, incrementSquawkBy);

        // Save the updated Squawk Code back to the file
        saveCurrentSquawk(squawkFile, squawkCode);

        // Find the index of "Arriving" section
        const arrivingIndex = outputContent.indexOf(`-----------------------------------\nArriving\n${'-' .repeat(35)}`);
        
        // Insert the entire flight plan under "Departing" section if not already present
        if (!outputContent.includes(flightPlan.trim())) {
            if (arrivingIndex !== -1) {
                // Insert before "Arriving" section
                outputContent = outputContent.substring(0, arrivingIndex) +
                    `${flightPlan.trim()}\nSquawk Code: ${squawkCode}\nRunway: \nDeparture is with: me\n` +
                    outputContent.substring(arrivingIndex);
            } else {
                // Append at the end if "Arriving" section is not present
                outputContent += `${flightPlan.trim()}\nSquawk Code: ${squawkCode}\nRunway: \nDeparture is with: me\n`;
            }
        }
    } else if (flightPlan.includes(`Arriving: ${airport}`)) {
        console.log("Arrival")
        // Insert the "Arriving" section if it doesn't exist
        if (!outputContent.includes(`-----------------------------------\nArriving\n${'-' .repeat(35)}`)) {
            outputContent += `\n-----------------------------------\nArriving\n${'-' .repeat(35)}\n`;
        }

        // Insert the entire flight plan under "Arriving" section if not already present
        if (!outputContent.includes(flightPlan.trim())) {
            outputContent += `${flightPlan}\n\n`; // Add newline here
        }
    }

    outputContentNew = "-----------------------------------\nDeparting\n-----------------------------------\n" + outputContent

    // Write the updated content back to the output file
    fs.writeFileSync(outputFileName, outputContentNew);
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

function getUpdatedSquawkCode(currentSquawk, incrementBy) {
    // Increment squawk code
    let newSquawk = currentSquawk + incrementBy;

    // Remove extra digits if it's above 4 digits
    newSquawk = newSquawk % 10000;

    // Replace missing digits with "0"
    newSquawk = newSquawk.toString().padStart(4, '0');

    // Replace "7" with "1"
    newSquawk = newSquawk.replace(/7/g, '1');

    return newSquawk;
}

module.exports = organiseFlightPlans;